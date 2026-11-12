import "server-only";
import {createServerClient} from "@supabase/ssr";
import {createClient} from "@supabase/supabase-js";
import {cookies} from "next/headers";

export function authConfigured(){return !!(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY);}
export async function userClient(){
 if(!authConfigured())throw new Error("Account connection is not configured.");
 const jar=await cookies();
 return createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{
  cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax"},
  cookies:{getAll:()=>jar.getAll(),setAll(values){try{for(const v of values)jar.set(v.name,v.value,v.options);}catch{/* The proxy refreshes cookies for Server Components. */}}}
 });
}
export function database(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
 if(!url||!key)throw new Error("Database connection is not configured.");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store"})}});
}
export async function currentUser(){
 if(!authConfigured())return null;
 const {data,error}=await (await userClient()).auth.getUser();
 const allowed=process.env.PACT_OWNER_EMAIL?.trim().toLowerCase();
 const ownerMatches=!!allowed&&data.user?.email?.toLowerCase()===allowed;
 if(error||!data.user||!ownerMatches){
  // Never log tokens, cookie values, email addresses, or callback codes.
  console.info("PACT_AUTH_CHECK",{errorCode:error?.code||null,hasUser:!!data.user,ownerMatches,sessionCookieCount:(await cookies()).getAll().filter(c=>/-auth-token(?:\.\d+)?$/.test(c.name)).length});
  return null;
 }
 return data.user;
}
