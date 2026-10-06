import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addDaysString, localDateString } from "@/lib/date";

const REMINDER_TITLE = "🔔 Order Reminder";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = localDateString();
  const tomorrow = addDaysString(today, 1);
  const now = new Date().toISOString();


  const { data: oldReminders, error: oldRemindersError } = await db
    .from("notifications")
    .select("id, order_id")
    .eq("title", REMINDER_TITLE)
    .is("read_at", null);

  if (oldRemindersError) {
    return NextResponse.json(
      { error: oldRemindersError.message },
      { status: 500 }
    );
  }

  const oldOrderIds = (oldReminders ?? [])
    .map((notification) => notification.order_id)
    .filter(Boolean);

  let reminderOrders: Array<{
    id: string;
    delivery_date: string;
    status: string;
  }> = [];

  if (oldOrderIds.length > 0) {
    const { data, error } = await db
      .from("orders")
      .select("id, delivery_date, status")
      .in("id", oldOrderIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    reminderOrders = data ?? [];
  }

  const reminderOrderMap = new Map(
    reminderOrders.map((order) => [order.id, order])
  );

  for (const notification of oldReminders ?? []) {
    const order = notification.order_id
      ? reminderOrderMap.get(notification.order_id)
      : null;

    const stillValid =
      order &&
      order.status !== "Delivered" &&
      order.delivery_date === tomorrow;

    if (!stillValid) {
      await db
        .from("notifications")
        .update({ read_at: now })
        .eq("id", notification.id);
    }
  }


  const { data: orders, error } = await db
    .from("orders")
    .select("*")
    .eq("delivery_date", tomorrow)
    .eq("reminder_sent", false)
    .neq("status", "Delivered");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let created = 0;

  for (const order of orders ?? []) {
    const { error: notificationError } = await db
      .from("notifications")
      .insert({
        user_id: order.user_id,
        order_id: order.id,
        title: REMINDER_TITLE,
        body:
          `Tomorrow you have an order to deliver.\\nCustomer: ${order.customer_name}\\nProduct: ${order.product_description}\\nDelivery date: ${order.delivery_date}`,
      });

    if (!notificationError) {
      await db
        .from("orders")
        .update({
          reminder_sent: true,
          updated_at: now,
        })
        .eq("id", order.id);

      created++;
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    checked: orders?.length ?? 0,
  });
}
