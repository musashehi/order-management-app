"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { localDateString, addDaysString } from "@/lib/date";
import type { Order, Notification, OrderStatus } from "@/lib/types";
import Link from "next/link";
import { Plus, Search, Bell, CalendarDays, Package, CheckCircle2, Trash2, Pencil, Phone, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const statuses: OrderStatus[] = ["Pending","Preparing","Ready","Delivered"];

export default function Dashboard({ user, initialOrders, initialNotifications }: {user:any; initialOrders:Order[]; initialNotifications:Notification[]}) {
  const [orders, setOrders] = useState(initialOrders);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Order|null>(null);
  const [toast, setToast] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const today = localDateString(), tomorrow = addDaysString(today,1);

  const filtered = useMemo(() => orders.filter(o => {
    const s = `${o.customer_name} ${o.customer_phone} ${o.product_description}`.toLowerCase();
    if (q && !s.includes(q.toLowerCase())) return false;
    if (filter==="Today") return o.delivery_date===today;
    if (filter==="Tomorrow") return o.delivery_date===tomorrow;
    if (filter==="Upcoming") return o.delivery_date>tomorrow && o.status!=="Delivered";
    if (filter==="Delivered") return o.status==="Delivered";
    if (statuses.includes(filter as OrderStatus)) return o.status===filter;
    return true;
  }), [orders,q,filter,today,tomorrow]);

  const todayOrders=orders.filter(o=>o.delivery_date===today && o.status!=="Delivered");
  const tomorrowOrders=orders.filter(o=>o.delivery_date===tomorrow && o.status!=="Delivered");
  const upcoming=orders.filter(o=>o.delivery_date>tomorrow && o.status!=="Delivered");
  const completed=orders.filter(o=>o.status==="Delivered");

  async function logout(){ await supabase.auth.signOut(); router.push("/login"); }

  async function saveOrder(data: Partial<Order>) {
    const payload = {
      customer_name: data.customer_name?.trim(),
      customer_phone: data.customer_phone?.trim(),
      product_description: data.product_description?.trim(),
      delivery_date: data.delivery_date,
      status: data.status || "Pending",
      ...(editing ? {} : { user_id: user.id })
    };
    if (!payload.customer_name || !payload.customer_phone || !payload.product_description || !payload.delivery_date) {
      setToast("Please complete all required fields."); return;
    }
    if (!editing && payload.delivery_date < today) { setToast("Delivery date cannot be in the past."); return; }
    const result = editing
      ? await supabase.from("orders").update({...payload, reminder_sent:false, updated_at:new Date().toISOString()}).eq("id",editing.id).select().single()
      : await supabase.from("orders").insert(payload).select().single();
    if (result.error) setToast("Could not save the order. Please try again.");
    else {
      setOrders(prev => editing ? prev.map(o=>o.id===editing.id?result.data:o) : [...prev,result.data].sort((a,b)=>a.delivery_date.localeCompare(b.delivery_date)));
      setShowAdd(false); setEditing(null); setToast("Order saved successfully.");
    }
  }

  async function deleteOrder(id:string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    const {error}=await supabase.from("orders").delete().eq("id",id);
    if(error) setToast("Could not delete the order.");
    else {setOrders(prev=>prev.filter(o=>o.id!==id));setToast("Order deleted.");}
  }

  async function markDelivered(o:Order) {
    const {data,error}=await supabase.from("orders").update({status:"Delivered",updated_at:new Date().toISOString()}).eq("id",o.id).select().single();
    if(error) setToast("Could not update the order."); else setOrders(prev=>prev.map(x=>x.id===o.id?data:x));
  }

  async function markRead(id:string){
    await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id);
    setNotifications(prev=>prev.filter(n=>n.id!==id));
  }

  const OrderRow=({o}:{o:Order})=><div className="card p-4 flex flex-col md:flex-row md:items-center gap-3">
    <div className="flex-1">
      <div className="font-black">{o.customer_name}</div>
      <div className="text-sm text-gray-500 flex items-center gap-2"><Phone size={14}/><a className="text-blue-600" href={`tel:${o.customer_phone}`}>{o.customer_phone}</a></div>
      <div className="mt-2 text-sm">{o.product_description}</div>
    </div>
    <div className="text-sm font-bold">{o.delivery_date}</div>
    <span className={`status status-${o.status}`}>{o.status}</span>
    <div className="flex gap-2">
      <button className="btn btn-secondary" onClick={()=>setEditing(o)}><Pencil size={16}/></button>
      {o.status!=="Delivered" && <button className="btn btn-secondary" onClick={()=>markDelivered(o)} title="Mark delivered"><CheckCircle2 size={16}/></button>}
      <button className="btn btn-danger" onClick={()=>deleteOrder(o.id)}><Trash2 size={16}/></button>
    </div>
  </div>;

  return <main className="min-h-screen">
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="font-black text-xl mr-auto">Store Orders</div>
        <span className="hidden md:block text-sm text-gray-500">{user.email}</span>
        <button className="btn btn-primary flex items-center gap-2" onClick={()=>{setEditing(null);setShowAdd(true)}}><Plus size={18}/> Add Order</button>
        <button className="btn btn-secondary" onClick={logout} title="Logout"><LogOut size={18}/></button>
      </div>
    </header>
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Orders Today",todayOrders.length,Package],
          ["Orders Tomorrow",tomorrowOrders.length,CalendarDays],
          ["Upcoming",upcoming.length,CalendarDays],
          ["Completed",completed.length,CheckCircle2]
        ].map(([label,count,Icon]:any)=><div className="card p-4" key={label}><div className="text-sm text-gray-500 flex gap-2"><Icon size={16}/>{label}</div><div className="text-3xl font-black mt-1">{count}</div></div>)}
      </div>

      {notifications.length>0 && <section className="card p-4 border-orange-200">
        <h2 className="font-black flex items-center gap-2 mb-3"><Bell size={18}/> Reminders</h2>
        <div className="space-y-2">{notifications.map(n=><div key={n.id} className="p-3 rounded-xl bg-orange-50 flex gap-3 items-start"><Bell size={18}/><div className="flex-1"><b>{n.title}</b><div className="text-sm text-gray-700 whitespace-pre-line">{n.body}</div></div><button className="text-sm text-blue-600" onClick={()=>markRead(n.id)}>Dismiss</button></div>)}</div>
      </section>}

      <section className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 text-gray-400" size={18}/><input className="input pl-10" placeholder="Search customer, phone or product..." value={q} onChange={e=>setQ(e.target.value)}/></div>
          <select className="input lg:w-52" value={filter} onChange={e=>setFilter(e.target.value)}>
            {["All","Today","Tomorrow","Upcoming","Delivered",...statuses].map(x=><option key={x}>{x}</option>)}
          </select>
          <Link className="btn btn-secondary flex items-center justify-center gap-2" href="/calendar"><CalendarDays size={18}/> Calendar</Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">All Orders</h2>
        {filtered.length ? filtered.map(o=><OrderRow key={o.id} o={o}/>) :
          <div className="card p-10 text-center"><div className="font-bold">No orders yet.</div><button className="btn btn-primary mt-4" onClick={()=>setShowAdd(true)}>+ Add Your First Order</button></div>}
      </section>
    </div>

    {(showAdd||editing) && <OrderModal order={editing} onClose={()=>{setShowAdd(false);setEditing(null)}} onSave={saveOrder}/>}
    {toast && <button onClick={()=>setToast("")} className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl">{toast}</button>}
  </main>;
}

function OrderModal({order,onClose,onSave}:{order:Order|null;onClose:()=>void;onSave:(x:Partial<Order>)=>void}) {
  const [form,setForm]=useState<Partial<Order>>(order || {status:"Pending"});
  const set=(k:keyof Order,v:any)=>setForm(f=>({...f,[k]:v}));
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="card w-full max-w-lg p-6">
      <h2 className="text-2xl font-black mb-5">{order?"Edit Order":"Add Order"}</h2>
      <div className="space-y-4">
        <input className="input" placeholder="Customer Name" value={form.customer_name||""} onChange={e=>set("customer_name",e.target.value)}/>
        <input className="input" placeholder="Customer Phone Number" value={form.customer_phone||""} onChange={e=>set("customer_phone",e.target.value)}/>
        <textarea className="input min-h-28" placeholder="Product Description" value={form.product_description||""} onChange={e=>set("product_description",e.target.value)}/>
        <input className="input" type="date" value={form.delivery_date||""} onChange={e=>set("delivery_date",e.target.value)}/>
        {order && <select className="input" value={form.status||"Pending"} onChange={e=>set("status",e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>}
      </div>
      <div className="flex gap-2 justify-end mt-6"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(form)}>Save Order</button></div>
    </div>
  </div>;
}
