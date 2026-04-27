#!/usr/bin/env node
// Kills any processes occupying dev ports before `npm run dev`.
import { execSync } from 'child_process';

const PORTS = [4002, 6006];

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (pids) {
      pids.split('\n').forEach(pid => {
        try { execSync(`kill -9 ${pid}`); } catch {}
      });
      console.log(`✓ Cleared port ${port}`);
    }
  } catch {}
}
