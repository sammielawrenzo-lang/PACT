import {z} from "zod";
import {userClient} from "@/lib/supabase/server";
import {origin,requestOrigin,body,json,failure} from "@/lib/pact/http";
export async function POST(req:Request){try{
 origin(req);const {email}=z.object({email:z.string().email().max(254)}).parse(await body(req));
 const allowed=process.env.PACT_OWNER_EMAIL?.trim().toLowerCase();
 if(!allowed||email.toLowerCase()!==allowed)return json({error:"This private workspace is available to its owner."},403);
 const {error}=await (await userClient()).auth.signInWithOtp({email,options:{emailRedirectTo:new URL("/auth/callback",requestOrigin(req)).toString()}});
 if(error)return json({error:"The sign-in email could not be sent. Please try again shortly."},400);
 return json({sent:true});
}catch(e){return failure(e);}}
