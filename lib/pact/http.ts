import {currentUser} from "@/lib/supabase/server";
export async function owner(){const user=await currentUser();if(user)return user.id;throw new Error("Sign in to open your Pact workspace.");}
export function requestOrigin(req:Request){const url=new URL(req.url);const host=req.headers.get("host");if(host)url.host=host;if(process.env.VERCEL==="1")url.protocol="https:";return url.origin;}
export function origin(req:Request){if(req.headers.get("origin")!==requestOrigin(req))throw new Error("Only same-origin requests are allowed.");}
export async function body(req:Request){const s=await req.text();if(s.length>16000)throw new Error("Request too large.");return JSON.parse(s);}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});}
export function failure(e:unknown){return json({error:e instanceof Error?e.message:"Something went wrong."},400);}
