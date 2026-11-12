import {test} from "node:test";
import assert from "node:assert/strict";
import {authorizedJob} from "../lib/pact/job-auth.ts";
const secret="a".repeat(48);
test("scheduled refund requests fail closed without a configured strong secret",()=>{
 assert.equal(authorizedJob("Bearer "+secret,undefined),false);
 assert.equal(authorizedJob("Bearer short","short"),false);
 assert.equal(authorizedJob(null,secret),false);
});
test("scheduled refund authorization requires an exact bearer credential",()=>{
 assert.equal(authorizedJob("Bearer "+secret,secret),true);
 assert.equal(authorizedJob("Bearer "+"b".repeat(48),secret),false);
 assert.equal(authorizedJob("bearer "+secret,secret),false);
 assert.equal(authorizedJob("deadline-refunds",secret),false);
});
