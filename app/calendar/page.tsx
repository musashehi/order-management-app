import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CalendarClient from "./ui";

export default async function CalendarPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data}=await supabase.from("orders").select("*").order("delivery_date",{ascending:true});
  return <CalendarClient orders={data??[]}/>;
}
