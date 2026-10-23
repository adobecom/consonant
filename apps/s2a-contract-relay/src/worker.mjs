// Cloudflare Worker entry. Secrets: GITHUB_TOKEN (fine-grained PAT: contents
// read/write, actions read/write, pull requests read/write on the repo),
// optional RELAY_KEY. Vars: REPO, BASE_BRANCH, WORKFLOW.
import { createRelay } from "./relay.mjs";

export default {
  async fetch(request, env) {
    const handle = createRelay({ token: env.GITHUB_TOKEN, repo: env.REPO || "adobecom/consonant", baseBranch: env.BASE_BRANCH || "main", workflow: env.WORKFLOW || "contract-sync.yml", relayKey: env.RELAY_KEY || "" });
    return handle(request);
  },
};
