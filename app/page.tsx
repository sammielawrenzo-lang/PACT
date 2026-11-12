import {redirect} from "next/navigation";
import {currentUser} from "@/lib/supabase/server";
import PactApp from "@/components/pact-app";
export const dynamic="force-dynamic";
export default async function Page(){if(!await currentUser())redirect("/signin");return <PactApp/>;}
