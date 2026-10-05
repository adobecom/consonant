// southleft adapter — the interop format (contract.json).
//
// Conforms to the contract schema vendored from southleft/ds-contracts-poc,
// which is the closest thing to a standard for component contracts today. It is
// strict (additionalProperties:false everywhere), so everything our working
// format carries that it has no field for is dropped here rather than smuggled
// in. That is the trade: this file is the one a second party can validate.
//
// If a different schema becomes the recommended one, it is a sibling of this
// file, not a change to the pipeline.
import { contractJson } from "../lib/formats/contract-json.mjs";

export default {
  name: "southleft",
  artifacts(ir) {
    return [{
      name: `${ir.component.slug}.contract`,
      data: contractJson(ir, { id: `s2a.${ir.component.slug}` }),
      note: "interop — validates against the vendored external schema",
    }];
  },
};
