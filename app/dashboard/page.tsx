import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Dashboard from "./ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: orders } = await supabase.from("orders").select("*").order("delivery_date", { ascending: true });
  const { data: notifications } = await supabase.from("notifications").select("*").is("read_at", null).order("created_at", { ascending: false });
  return <Dashboard user={user} initialOrders={orders ?? []} initialNotifications={notifications ?? []} />;
}
