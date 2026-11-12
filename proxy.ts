import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
export async function proxy(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{
  cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax"},
  cookies:{getAll:()=>request.cookies.getAll(),setAll(values,headers){
   for(const v of values)request.cookies.set(v.name,v.value);
   response=NextResponse.next({request});
   for(const v of values)response.cookies.set(v.name,v.value,v.options);
   for(const [name,value] of Object.entries(headers||{}))response.headers.set(name,value);
  }}
 });
 await supabase.auth.getClaims();
 response.headers.set("Cache-Control","private, no-store");
 return response;
}
export const config={matcher:["/","/signin","/auth/:path*","/api/pacts","/api/ai"]};
