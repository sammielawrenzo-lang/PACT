import "server-only";
import {database} from "@/lib/supabase/server";
import type {Pact} from "./domain";
export async function list(owner:string):Promise<Pact[]>{
 const {data,error}=await database().from("pacts").select("data").eq("owner_id",owner).order("updated_at",{ascending:false}).limit(100);
 if(error)throw new Error("Your pacts could not be loaded. Try again shortly.");
 return (data||[]).map(row=>row.data as Pact);
}
export async function read(owner:string,id:string){
 const {data,error}=await database().from("pacts").select("data,version").eq("owner_id",owner).eq("id",id).maybeSingle();
 if(error)throw new Error("This pact could not be loaded. Try again shortly.");
 if(!data)throw new Error("Pact not found.");
 return {pact:data.data as Pact,version:data.version as number};
}
export async function insert(owner:string,p:Pact){
 const {error}=await database().from("pacts").insert({id:p.id,owner_id:owner,data:p,version:1,deadline:p.deadline,terminal:!!p.terminal,updated_at:new Date().toISOString()});
 if(error)throw new Error("Your pact could not be saved. Try again shortly.");
}
export async function save(owner:string,p:Pact,version:number){
 // The version predicate and update are atomic: stale requests cannot overwrite payment state.
 const {data,error}=await database().from("pacts").update({data:p,version:version+1,deadline:p.deadline,terminal:!!p.terminal,updated_at:new Date().toISOString()}).eq("owner_id",owner).eq("id",p.id).eq("version",version).select("id");
 if(error)throw new Error("Your pact could not be saved. Reconcile before trying again.");
 if(data?.length!==1)throw new Error("This pact changed. Refresh before trying again.");
}
export async function change(owner:string,id:string,fn:(p:Pact)=>Pact){const s=await read(owner,id);const p=fn(s.pact);await save(owner,p,s.version);return p;}
export async function due(ownerId?:string){
 let query=database().from("pacts").select("owner_id,data").lte("deadline",new Date().toISOString()).or("terminal.eq.false,data->>phase.eq.refunding").order("deadline").limit(20);
 if(ownerId)query=query.eq("owner_id",ownerId);
 const {data,error}=await query;
 if(error)throw new Error("Refund deadlines could not be checked.");
 return (data||[]) as {owner_id:string;data:Pact}[];
}
