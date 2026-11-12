import {env} from "cloudflare:workers";
import type {Pact} from "./domain";
function db(){if(!env.DB)throw new Error("Database is not configured.");return env.DB;}
export async function list(owner:string):Promise<Pact[]>{const r=await db().prepare("SELECT data FROM pacts WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 100").bind(owner).all<{data:string}>();return r.results.map(x=>JSON.parse(x.data));}
export async function read(owner:string,id:string){const r=await db().prepare("SELECT data,version FROM pacts WHERE owner_id = ? AND id = ?").bind(owner,id).first<{data:string;version:number}>();if(!r)throw new Error("Pact not found.");return {pact:JSON.parse(r.data) as Pact,version:r.version};}
export async function insert(owner:string,p:Pact){await db().prepare("INSERT INTO pacts (id,owner_id,data,version,updated_at) VALUES (?,?,?,1,?)").bind(p.id,owner,JSON.stringify(p),new Date().toISOString()).run();}
export async function save(owner:string,p:Pact,version:number){const r=await db().prepare("UPDATE pacts SET data=?,version=version+1,updated_at=? WHERE owner_id=? AND id=? AND version=?").bind(JSON.stringify(p),new Date().toISOString(),owner,p.id,version).run();if(r.meta.changes!==1)throw new Error("This pact changed. Refresh before trying again.");}
export async function change(owner:string,id:string,fn:(p:Pact)=>Pact){const s=await read(owner,id);const p=fn(s.pact);await save(owner,p,s.version);return p;}
