import {env} from "cloudflare:workers";
import {processDeadlines} from "@/lib/pact/deadlines";
import {owner,origin,json,failure} from "@/lib/pact/http";
export const dynamic="force-dynamic";
export async function POST(req:Request){try{
 // This writer relies on the owner-private Sites access boundary. Disable it before changing the Site audience.
 const enabled=(env as unknown as {PACT_PRIVATE_REFUND_JOB?:string}).PACT_PRIVATE_REFUND_JOB==="enabled";
 const service=enabled&&req.headers.get("x-pact-job")==="deadline-refunds";
 let uid:string|undefined;
 if(!service){origin(req);uid=await owner();}
 return json(await processDeadlines(new URL(req.url).origin,uid));
}catch(e){return failure(e);}}
