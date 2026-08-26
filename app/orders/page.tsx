import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import OrdersPageClient from "./ui";

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("delivery_date", { ascending: true });

  return (
    <OrdersPageClient
      user={user}
      initialOrders={orders ?? []}
    />
  );
}