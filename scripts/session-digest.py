#!/usr/bin/env python3
"""Session digest: what the last N days of agent sessions looked like.

Reads, when present:

  ~/.claude/projects/*/*.jsonl                 Claude Code transcripts
  ~/.claude/history.jsonl                      Claude Code prompt history
  ~/.agent-sessions/<repo>/prompt-log.jsonl    prompts from the UserPromptSubmit hook
  ~/.agent-sessions/<repo>/transcripts/*.jsonl archived transcripts (SessionEnd hook)
  ~/.codex/sessions/**/*.jsonl                 Codex transcripts
  ~/.codex/history.jsonl                       Codex prompt history
  a ChatGPT export (conversations.json or zip) --chatgpt <path>

and writes context/digests/<date>.md (gitignored). Only sessions whose working
directory is under this repo are read; this is a work repo.

The digest quotes the owner's prompts, so it stays out of git. The /retro
skill reads it like an editor and proposes rules; this script only reports.

Written from the spec in playbooks/agent-workflow/README.md, section 9.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

REPO = Path(__file__).resolve().parent.parent
REPO_NAME = REPO.name
HOME = Path.home()
AREAS = ("apps", "packages", "evals", "docs", "scripts", "context", "playbooks", ".claude", ".codex")
LOCAL = HOME / ".agent-sessions" / REPO_NAME

CORRECTION = re.compile(
    r"^\s*(no[,.!\s]|nope|don'?t|do not|stop\b|not that|i said|again\b|wrong|that'?s not|"
    r"undo|revert|why did you|you (just|keep|didn'?t)|not what i)",
    re.IGNORECASE,
)
ERROR_HINT = re.compile(r"(error|exception|failed|traceback|not found|cannot|refused|denied)", re.IGNORECASE)


# --- helpers ----------------------------------------------------------------

def parse_ts(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    try:
        if isinstance(value, (int, float)):
            if value > 1e12:
                value = value / 1000.0
            return datetime.fromtimestamp(value, tz=timezone.utc)
        s = str(value).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None


def under_repo(cwd: Optional[str]) -> bool:
    if not cwd:
        return False
    try:
        return Path(cwd).resolve() == REPO or REPO in Path(cwd).resolve().parents
    except Exception:
        return False


def area_of(path: str) -> Optional[str]:
    p = path
    for prefix in (str(REPO) + "/", "$CLAUDE_PROJECT_DIR/"):
        if p.startswith(prefix):
            p = p[len(prefix):]
    p = p.lstrip("./")
    top = p.split("/", 1)[0]
    return top if top in AREAS else None


def iter_jsonl(path: Path):
    try:
        with path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    continue
    except OSError:
        return


def text_of(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") in ("text", "input_text", "output_text"):
                    parts.append(str(block.get("text", "")))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts)
    if isinstance(content, dict):
        return text_of(content.get("content") or content.get("text") or "")
    return ""


# --- a session ----------------------------------------------------------------

class Session:
    def __init__(self, sid: str, tool: str, source: str):
        self.id = sid
        self.tool = tool
        self.source = source  # "transcript" | "prompts-only"
        self.cwd: Optional[str] = None
        self.start: Optional[datetime] = None
        self.end: Optional[datetime] = None
        self.prompts: List[str] = []
        self.tools: Counter = Counter()
        self.errors: List[str] = []
        self.files: Counter = Counter()  # by area

    def see(self, ts: Optional[datetime]):
        if ts is None:
            return
        if self.start is None or ts < self.start:
            self.start = ts
        if self.end is None or ts > self.end:
            self.end = ts

    @property
    def minutes(self) -> int:
        if self.start and self.end:
            return int((self.end - self.start).total_seconds() // 60)
        return 0

    def note_tool(self, name: str, inp: Any):
        self.tools[name] += 1
        if not isinstance(inp, dict):
            return
        for key in ("file_path", "path", "notebook_path"):
            if isinstance(inp.get(key), str):
                a = area_of(inp[key])
                if a:
                    self.files[a] += 1
        cmd = inp.get("command")
        if isinstance(cmd, str):
            for m in re.finditer(r"(?:^|[\s\"'=])((?:apps|packages|evals|docs|scripts|context|playbooks)/[\w./-]+)", cmd):
                a = area_of(m.group(1))
                if a:
                    self.files[a] += 1


# --- readers ------------------------------------------------------------------

def read_claude_transcript(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    """One Claude Code transcript file. Returns 1 if it belonged to this repo and the window."""
    sid = path.stem
    s = Session(sid, "Claude Code", "transcript")
    in_window = False
    for rec in iter_jsonl(path):
        ts = parse_ts(rec.get("timestamp"))
        if rec.get("cwd") and s.cwd is None:
            s.cwd = rec["cwd"]
        # A long-lived transcript (one session across many compactions) is read
        # only for the part inside the window; otherwise a week's digest reports
        # the session's whole life as this week's time.
        if ts and ts < since:
            continue
        if ts:
            in_window = True
        s.see(ts)
        msg = rec.get("message") or {}
        role = msg.get("role") or rec.get("type")
        content = msg.get("content")
        if role == "user":
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "tool_result":
                        if block.get("is_error"):
                            s.errors.append(text_of(block.get("content"))[:160])
            t = text_of(content).strip()
            if t and not t.startswith("<") and rec.get("type") == "user" and not rec.get("isMeta"):
                s.prompts.append(t[:300])
        elif role == "assistant" and isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get("type") == "tool_use":
                    s.note_tool(str(block.get("name", "?")), block.get("input"))
    if not in_window or not under_repo(s.cwd):
        return 0
    if sid in sessions:
        sessions[sid].prompts = sessions[sid].prompts or s.prompts
    else:
        sessions[sid] = s
    return 1


def read_codex_transcript(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    sid = "codex-" + path.stem
    s = Session(sid, "Codex", "transcript")
    in_window = False
    for rec in iter_jsonl(path):
        ts = parse_ts(rec.get("timestamp") or rec.get("ts"))
        payload = rec.get("payload") if isinstance(rec.get("payload"), dict) else rec
        ptype = payload.get("type")
        if ptype == "session_meta" or "cwd" in payload:
            cwd = payload.get("cwd") or (payload.get("payload") or {}).get("cwd")
            if cwd and s.cwd is None:
                s.cwd = cwd
        if ts and ts < since:
            continue
        if ts:
            in_window = True
        s.see(ts)
        if ptype == "message":
            role = payload.get("role")
            t = text_of(payload.get("content")).strip()
            # Codex injects AGENTS.md and environment context as user messages; not the owner's words.
            injected = t.startswith("#") and "instructions" in t[:60].lower() or "<INSTRUCTIONS>" in t or t.startswith("<environment_context>")
            if role == "user" and t and not t.startswith("<") and not injected:
                s.prompts.append(t[:300])
        elif ptype in ("function_call", "custom_tool_call", "local_shell_call"):
            name = payload.get("name") or ptype
            args = payload.get("arguments")
            try:
                args = json.loads(args) if isinstance(args, str) else args
            except Exception:
                args = {"command": str(args)}
            if ptype == "local_shell_call":
                action = payload.get("action") or {}
                args = {"command": " ".join(action.get("command", []))} if isinstance(action.get("command"), list) else args
                name = "shell"
            s.note_tool(str(name), args)
        elif ptype in ("function_call_output", "custom_tool_call_output"):
            out = str(payload.get("output", ""))
            # A successful shell run says "Script completed"; only a non-zero exit or
            # an error word near the top counts.
            head = out[:200]
            failed = re.search(r"[Ee]xit code:? ?[1-9]", head) or (ERROR_HINT.search(head) and not head.startswith("Script completed"))
            if failed:
                s.errors.append(out[:160])
    if not in_window or not under_repo(s.cwd):
        return 0
    sessions.setdefault(sid, s)
    return 1


def read_prompt_log(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    n = 0
    for rec in iter_jsonl(path):
        ts = parse_ts(rec.get("ts"))
        if not ts or ts < since or not under_repo(rec.get("cwd")):
            continue
        sid = str(rec.get("session", "unknown"))
        tool = str(rec.get("tool", "unknown"))
        if sid not in sessions:
            sessions[sid] = Session(sid, tool, "prompts-only")
            sessions[sid].cwd = rec.get("cwd")
        s = sessions[sid]
        s.see(ts)
        p = str(rec.get("prompt", "")).strip()
        if p and p not in s.prompts:
            s.prompts.append(p[:300])
        n += 1
    return n


def read_claude_history(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    """Prompt history has no session id; group by day into a prompts-only session.

    Prompts a transcript already holds are skipped, so a day with a transcript
    does not reappear as a second, prompts-only session.
    """
    known = {p for s in sessions.values() if s.source == "transcript" for p in s.prompts}
    n = 0
    for rec in iter_jsonl(path):
        ts = parse_ts(rec.get("timestamp"))
        if not ts or ts < since or not under_repo(rec.get("project")):
            continue
        if str(rec.get("display", "")).strip()[:300] in known:
            continue
        sid = "claude-history-" + ts.strftime("%Y-%m-%d")
        if sid not in sessions:
            sessions[sid] = Session(sid, "Claude Code", "prompts-only")
            sessions[sid].cwd = rec.get("project")
        s = sessions[sid]
        s.see(ts)
        p = str(rec.get("display", "")).strip()
        if p and not any(p == q for q in s.prompts):
            s.prompts.append(p[:300])
        n += 1
    return n


def read_codex_history(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    n = 0
    for rec in iter_jsonl(path):
        ts = parse_ts(rec.get("ts"))
        if not ts or ts < since:
            continue
        sid = "codex-" + str(rec.get("session_id", "unknown"))
        # No cwd in Codex history; attach only to sessions already known to be this repo.
        if sid not in sessions:
            continue
        s = sessions[sid]
        s.see(ts)
        p = str(rec.get("text", "")).strip()
        if p and p not in s.prompts:
            s.prompts.append(p[:300])
        n += 1
    return n


def read_chatgpt(path: Path, since: datetime, sessions: Dict[str, Session]) -> int:
    data = None
    try:
        if path.suffix == ".zip":
            with zipfile.ZipFile(path) as z:
                name = next((n for n in z.namelist() if n.endswith("conversations.json")), None)
                if name:
                    data = json.loads(z.read(name))
        else:
            data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"chatgpt export unreadable: {e}", file=sys.stderr)
        return 0
    n = 0
    for conv in data or []:
        ts = parse_ts(conv.get("create_time"))
        if not ts or ts < since:
            continue
        sid = "chatgpt-" + str(conv.get("id", n))
        s = Session(sid, "ChatGPT", "transcript")
        s.see(ts)
        s.see(parse_ts(conv.get("update_time")))
        for node in (conv.get("mapping") or {}).values():
            m = (node or {}).get("message") or {}
            if (m.get("author") or {}).get("role") == "user":
                t = text_of((m.get("content") or {}).get("parts") or "").strip()
                if t:
                    s.prompts.append(t[:300])
        sessions[sid] = s
        n += 1
    return n


# --- the digest ---------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--chatgpt", type=Path, default=None, help="ChatGPT export: conversations.json or the zip")
    ap.add_argument("--out", type=Path, default=None)
    args = ap.parse_args()

    since = datetime.now(timezone.utc) - timedelta(days=args.days)
    sessions: Dict[str, Session] = {}
    coverage: List[str] = []

    def source(label: str, present: bool, count: int, note: str = ""):
        state = "read" if present else "not present"
        coverage.append(f"- {label}: {state}" + (f", {count} matched" if present else "") + (f" — {note}" if note else ""))

    # Claude transcripts (project folders are the encoded repo path; read all, filter by cwd)
    files = [Path(p) for p in glob.glob(str(HOME / ".claude" / "projects" / "*" / "*.jsonl"))]
    recent = [p for p in files if datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc) >= since]
    n = sum(read_claude_transcript(p, since, sessions) for p in recent)
    source("Claude Code transcripts (~/.claude/projects)", bool(files), n, f"{len(recent)} files touched in the window")

    archived = [Path(p) for p in glob.glob(str(LOCAL / "transcripts" / "*.jsonl"))]
    n = sum(read_claude_transcript(p, since, sessions) for p in archived)
    source("archived transcripts (~/.agent-sessions)", bool(archived), n)

    codex_files = [Path(p) for p in glob.glob(str(HOME / ".codex" / "sessions" / "**" / "*.jsonl"), recursive=True)]
    codex_recent = [p for p in codex_files if datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc) >= since]
    n = sum(read_codex_transcript(p, since, sessions) for p in codex_recent)
    source("Codex transcripts (~/.codex/sessions)", bool(codex_files), n)

    p = LOCAL / "prompt-log.jsonl"
    source("prompt log (~/.agent-sessions)", p.exists(), read_prompt_log(p, since, sessions) if p.exists() else 0)
    p = HOME / ".claude" / "history.jsonl"
    source("Claude Code prompt history", p.exists(), read_claude_history(p, since, sessions) if p.exists() else 0)
    p = HOME / ".codex" / "history.jsonl"
    source("Codex prompt history", p.exists(), read_codex_history(p, since, sessions) if p.exists() else 0)
    if args.chatgpt:
        source("ChatGPT export", args.chatgpt.exists(), read_chatgpt(args.chatgpt, since, sessions) if args.chatgpt.exists() else 0)

    ordered = sorted(sessions.values(), key=lambda s: s.start or since)
    prompts_only = [s for s in ordered if s.source == "prompts-only"]

    out: List[str] = []
    today = datetime.now().strftime("%Y-%m-%d")
    out.append(f"# Session digest — {today} (last {args.days} days, {REPO_NAME})\n")
    out.append("## Coverage\n")
    out.extend(coverage)
    out.append(f"\n{len(ordered)} sessions in the window; {len(prompts_only)} seen only through prompts (no transcript: no tool use, errors or files for those).")
    if not ordered:
        out.append("\nNothing to report. If sessions ran, check that the hooks are installed and that `CLAUDE_CODE_FORCE_SESSION_PERSISTENCE=1` is set (playbook section 6).")

    out.append("\n## Sessions\n")
    for s in ordered:
        when = s.start.astimezone().strftime("%a %b %-d %H:%M") if s.start else "?"
        out.append(f"### {when} · {s.tool} · {s.minutes} min · {len(s.prompts)} prompts" + ("" if s.source == "transcript" else " · prompts only"))
        if s.tools:
            out.append("- tools: " + ", ".join(f"{k}×{v}" for k, v in s.tools.most_common(8)))
        if s.files:
            out.append("- files touched by area: " + ", ".join(f"{k} {v}" for k, v in s.files.most_common()))
        if s.errors:
            out.append(f"- errors: {len(s.errors)}; first: {s.errors[0]!r}")
        if s.prompts:
            out.append("- opened with: " + repr(s.prompts[0][:140]))
        out.append("")

    out.append("## Corrections (prompts that look like 'no, not that')\n")
    found = 0
    for s in ordered:
        for p in s.prompts:
            if CORRECTION.search(p):
                when = s.start.astimezone().strftime("%b %-d") if s.start else "?"
                out.append(f"- {when} · {s.tool}: {p[:200]!r}")
                found += 1
    if not found:
        out.append("- none matched the pattern (check the sessions above by hand; the pattern is narrow on purpose)")

    out.append("\n## Recurring errors\n")
    errs = Counter()
    for s in ordered:
        for e in s.errors:
            key = re.sub(r"\d+", "#", e.split("\n")[0])[:100]
            errs[key] += 1
    repeated = [(k, v) for k, v in errs.most_common() if v > 1]
    out.extend(f"- ×{v}: {k!r}" for k, v in repeated) or out.append("- none repeated")

    out.append("\n## Where the time went\n")
    by_tool = Counter({s.tool: s.minutes for s in ordered})
    tmp: Dict[str, int] = defaultdict(int)
    for s in ordered:
        tmp[s.tool] += s.minutes
    out.append("- minutes by tool: " + ", ".join(f"{k} {v}" for k, v in sorted(tmp.items(), key=lambda kv: -kv[1])))
    areas = Counter()
    for s in ordered:
        areas.update(s.files)
    out.append("- file touches by area: " + (", ".join(f"{k} {v}" for k, v in areas.most_common()) or "none seen"))
    calls = Counter()
    for s in ordered:
        calls.update(s.tools)
    out.append("- tool calls overall: " + (", ".join(f"{k} {v}" for k, v in calls.most_common(10)) or "none seen"))

    dest = args.out or (REPO / "context" / "digests" / f"{today}.md")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"wrote {dest.relative_to(REPO) if dest.is_relative_to(REPO) else dest} — {len(ordered)} sessions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
