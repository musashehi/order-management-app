import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addDaysString, localDateString } from "@/lib/date";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const tomorrow = addDaysString(localDateString(),1);
  const {data: orders,error}=await db.from("orders").select("*").eq("delivery_date",tomorrow).eq("reminder_sent",false).neq("status","Delivered");
  if(error) return NextResponse.json({error:error.message},{status:500});
  let created=0;
  for(const order of orders??[]) {
    const {error: nError}=await db.from("notifications").insert({
      user_id:order.user_id,
      order_id:order.id,
      title:"🔔 Order Reminder",
      body:`Tomorrow you have an order to deliver.\nCustomer: ${order.customer_name}\nProduct: ${order.product_description}\nDelivery date: ${order.delivery_date}`
    });
    if(!nError) {
      await db.from("orders").update({reminder_sent:true,updated_at:new Date().toISOString()}).eq("id",order.id);
      created++;
    }
  }
  return NextResponse.json({ok:true,created,checked:orders?.length??0});
}
