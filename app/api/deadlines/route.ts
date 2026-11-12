import {processDeadlines} from "@/lib/pact/deadlines";
import {authorizedJob} from "@/lib/pact/job-auth";
import {owner,origin,json,failure} from "@/lib/pact/http";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function POST(req:Request){try{
 const service=authorizedJob(req.headers.get("authorization"),process.env.CRON_SECRET);
 let uid:string|undefined;
 if(!service){origin(req);uid=await owner();}
 return json(await processDeadlines(new URL(req.url).origin,uid));
}catch(e){return failure(e);}}
export async function GET(req:Request){
 if(!authorizedJob(req.headers.get("authorization"),process.env.CRON_SECRET))return json({error:"Unauthorized."},401);
 try{return json(await processDeadlines(new URL(req.url).origin));}catch(e){return failure(e);}
}
