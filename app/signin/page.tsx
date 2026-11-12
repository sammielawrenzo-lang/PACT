import {authConfigured,currentUser} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import SignIn from "./sign-in";
export const dynamic="force-dynamic";
export default async function Page(){if(await currentUser())redirect("/");return <SignIn ready={authConfigured()}/>;}
