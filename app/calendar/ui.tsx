"use client";
import type {Order} from "@/lib/types";
import Link from "next/link";
import {ArrowLeft, CalendarDays} from "lucide-react";

export default function CalendarClient({orders}:{orders:Order[]}) {
  const groups=orders.reduce<Record<string,Order[]>>((a,o)=>{(a[o.delivery_date]??=[]).push(o);return a},{});
  return <main className="max-w-4xl mx-auto p-4 md:p-8">
    <Link href="/dashboard" className="btn btn-secondary inline-flex items-center gap-2 mb-6"><ArrowLeft size={17}/> Dashboard</Link>
    <h1 className="text-3xl font-black mb-6 flex gap-2 items-center"><CalendarDays/> Delivery Calendar</h1>
    <div className="space-y-4">{Object.keys(groups).map(date=><section className="card p-5" key={date}><h2 className="font-black text-lg mb-3">{date}</h2>{groups[date].map(o=><div className="border-t py-3 flex flex-col sm:flex-row sm:items-center gap-2" key={o.id}><b className="flex-1">{o.customer_name}</b><span className="text-gray-600">{o.product_description}</span><span className={`status status-${o.status}`}>{o.status}</span></div>)}</section>)}</div>
    {!orders.length && <div className="card p-10 text-center">No orders yet.</div>}
  </main>;
}
