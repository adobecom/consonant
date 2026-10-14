// The renderer registry. A target is anything that can turn one IR into files:
// { id, description, files(ir, slug, extras) -> { relativePath: contents } }.
//
// Adding a third target — React, Web Components, whatever comes next — is a new
// module here and one line in this list. Nothing upstream of the contract
// changes, which is the point of having a contract at all.
import { lit } from "./lit.mjs";
import { milo } from "./milo.mjs";

export const renderers = { lit, milo };
export const targets = Object.keys(renderers);
