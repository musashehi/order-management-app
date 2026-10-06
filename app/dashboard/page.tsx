import { addDaysString, localDateString } from "@/lib/date";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Dashboard from "./ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("delivery_date", { ascending: true });

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .is("read_at", null)
    .order("created_at", { ascending: false });

  const today = localDateString();
  const tomorrow = addDaysString(today, 1);
  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));

  // Reminder notifications are only valid while the referenced order is
  // actually due tomorrow. This prevents old "Tomorrow..." notifications
  // from remaining visible after the delivery date has passed.
  const validNotifications = (notifications ?? []).filter((notification) => {
    if (notification.title !== "🔔 Order Reminder") return true;

    const order = notification.order_id
      ? orderMap.get(notification.order_id)
      : null;

    return Boolean(
      order &&
      order.status !== "Delivered" &&
      order.delivery_date === tomorrow
    );
  });

  return (
    <Dashboard
      user={user}
      initialOrders={orders ?? []}
      initialNotifications={validNotifications}
    />
  );
}
