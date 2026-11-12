import {requestOrigin} from "@/lib/pact/http";
import {NextResponse} from "next/server";
import {userClient,currentUser} from "@/lib/supabase/server";
export async function GET(req:Request){
 const url=new URL(req.url),code=url.searchParams.get("code");
 if(code){const client=await userClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error&&await currentUser())return NextResponse.redirect(new URL("/",requestOrigin(req)));await client.auth.signOut();}
 return NextResponse.redirect(new URL("/signin",requestOrigin(req)));
}
