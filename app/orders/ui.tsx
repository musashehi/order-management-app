"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Order, OrderStatus } from "@/lib/types";
import AppSidebar from "@/app/components/AppSidebar";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  CalendarDays,
  X,
  PackageCheck,
} from "lucide-react";

const statuses: OrderStatus[] = [
  "Pending",
  "Ready",
  "Delivered",
];

export default function OrdersPageClient({
  user,
  initialOrders,
}: {
  user: any;
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [toast, setToast] = useState("");

  const supabase = createClient();

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const text =
        `${o.customer_name} ${o.customer_phone} ${o.product_description}`.toLowerCase();

      if (q && !text.includes(q.toLowerCase())) return false;

      if (filter !== "All" && o.status !== filter) return false;

      return true;
    });
  }, [orders, q, filter]);

  async function saveOrder(data: Partial<Order>) {
    const payload = {
      customer_name: data.customer_name?.trim(),
      customer_phone: data.customer_phone?.trim(),
      product_description: data.product_description?.trim(),
      delivery_date: data.delivery_date,
      status: data.status || "Pending",
      ...(editing ? {} : { user_id: user.id }),
    };

    if (
      !payload.customer_name ||
      !payload.customer_phone ||
      !payload.product_description ||
      !payload.delivery_date
    ) {
      setToast("Please complete all required fields.");
      return;
    }

    const result = editing
      ? await supabase
          .from("orders")
          .update({
            ...payload,
            reminder_sent: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id)
          .select()
          .single()
      : await supabase
          .from("orders")
          .insert(payload)
          .select()
          .single();

    if (result.error) {
      setToast("Could not save the order.");
      return;
    }

    setOrders((prev) =>
      editing
        ? prev.map((o) =>
            o.id === editing.id ? result.data : o
          )
        : [...prev, result.data].sort((a, b) =>
            a.delivery_date.localeCompare(b.delivery_date)
          )
    );

    setEditing(null);
    setShowAdd(false);
    setToast("Order saved successfully.");
  }

  async function deleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      setToast("Could not delete the order.");
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    setToast("Order deleted.");
  }

  async function updateStatus(
    order: Order,
    status: OrderStatus
  ) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .select()
      .single();

    if (error) {
      setToast("Could not update the order.");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? data : o
      )
    );

    setToast(`Order status changed to ${status}.`);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="lg:pl-[260px]">
        <header className="bg-white border-b border-slate-200">
          <div className="px-5 sm:px-8 py-5 flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                All Orders
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Search, filter and manage every customer order.
              </p>
            </div>

            <button
              className="btn btn-primary ml-auto"
              onClick={() => {
                setEditing(null);
                setShowAdd(true);
              }}
            >
              <Plus size={18} />
              Add Order
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="input !pl-11"
                  placeholder="Search customer, phone or product..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <select
                className="input md:!w-52"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>

                {statuses.map((status) => (
                  <option key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center">
              <div>
                <h2 className="font-black text-lg">
                  Orders
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {filtered.length} orders found
                </p>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="font-black text-lg">
                          {order.customer_name}
                        </h3>

                        <span
                          className={`status status-${order.status}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-3">
                        {order.product_description}
                      </p>

                      <a
                        href={`tel:${order.customer_phone}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 mt-3"
                      >
                        <Phone size={14} />
                        {order.customer_phone}
                      </a>
                    </div>

                    <div className="xl:w-40">
                      <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Delivery
                      </div>

                      <div className="flex items-center gap-2 mt-1 font-bold">
                        <CalendarDays size={15} />
                        {order.delivery_date}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditing(order)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      {order.status === "Pending" && (
                        <button
                          className="btn bg-blue-50 text-blue-700 hover:bg-blue-100"
                          onClick={() =>
                            updateStatus(order, "Ready")
                          }
                        >
                          <PackageCheck size={15} />
                          Mark Ready
                        </button>
                      )}

                      {order.status === "Ready" && (
                        <button
                          className="btn bg-green-50 text-green-700 hover:bg-green-100"
                          onClick={() =>
                            updateStatus(order, "Delivered")
                          }
                        >
                          <CheckCircle2 size={15} />
                          Mark Delivered
                        </button>
                      )}

                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          deleteOrder(order.id)
                        }
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="font-black text-lg">
                  No orders found
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  Try changing the search or filter.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {(showAdd || editing) && (
        <OrderModal
          order={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={saveOrder}
        />
      )}

      {toast && (
        <button
          onClick={() => setToast("")}
          className="fixed z-[70] bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold"
        >
          {toast}
        </button>
      )}
    </main>
  );
}

function OrderModal({
  order,
  onClose,
  onSave,
}: {
  order: Order | null;
  onClose: () => void;
  onSave: (data: Partial<Order>) => void;
}) {
  const [form, setForm] =
    useState<Partial<Order>>(
      order || { status: "Pending" }
    );

  const set = (key: keyof Order, value: any) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center">
          <div>
            <h2 className="text-xl font-black">
              {order
                ? "Edit Order"
                : "Add New Order"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter the customer and delivery details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="ml-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <Field label="Customer Name">
            <input
              className="input"
              value={form.customer_name || ""}
              onChange={(e) =>
                set("customer_name", e.target.value)
              }
            />
          </Field>

          <Field label="Phone Number">
            <input
              className="input"
              value={form.customer_phone || ""}
              onChange={(e) =>
                set("customer_phone", e.target.value)
              }
            />
          </Field>

          <Field label="Product Description">
            <textarea
              className="input min-h-28"
              value={form.product_description || ""}
              onChange={(e) =>
                set(
                  "product_description",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="Delivery Date">
            <input
              className="input"
              type="date"
              value={form.delivery_date || ""}
              onChange={(e) =>
                set("delivery_date", e.target.value)
              }
            />
          </Field>

          {order && (
            <Field label="Status">
              <select
                className="input"
                value={form.status || "Pending"}
                onChange={(e) =>
                  set("status", e.target.value)
                }
              >
                {statuses.map((status) => (
                  <option key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="flex gap-3 pt-2">
            <button
              className="btn btn-secondary flex-1"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary flex-1"
              onClick={() => onSave(form)}
            >
              {order
                ? "Save Changes"
                : "Save Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </span>

      {children}
    </label>
  );
}