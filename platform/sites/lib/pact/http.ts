import {getChatGPTUser} from "@/app/chatgpt-auth";
export async function owner(){const user=await getChatGPTUser();if(user)return user.userId;if(import.meta.env.DEV)return "local-preview-only";throw new Error("Sign in to open your Pact workspace.");}
export function origin(req:Request){if(req.headers.get("origin")!==new URL(req.url).origin)throw new Error("Only same-origin requests are allowed.");}
export async function body(req:Request){const s=await req.text();if(s.length>16000)throw new Error("Request too large.");return JSON.parse(s);}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}});}
export function failure(e:unknown){return json({error:e instanceof Error?e.message:"Something went wrong."},400);}
