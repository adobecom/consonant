// s2a adapter — our own working format (spec.json).
//
// This is the SHAPE our tooling reads: resolved token values, evidence hashes,
// open decisions. All three are things an external contract schema forbids and
// all three are things the gate, the MCP server and the docs depend on. It is
// deliberately a superset, and deliberately ours.
import { specJson } from "../lib/formats/spec-json.mjs";

export default {
  name: "s2a",
  artifacts(ir) {
    const slugOf = ir.slugOf ?? ((n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    return [{
      name: `${ir.component.slug}.spec`,
      data: specJson(ir, { slugOf }),
      note: "working format — resolved tokens, evidence, decisions",
    }];
  },
};
