"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { localDateString, addDaysString } from "@/lib/date";
import type { Order, Notification, OrderStatus } from "@/lib/types";
import {
  Plus,
  Search,
  Bell,
  CalendarDays,
  Package,
  CheckCircle2,
  Pencil,
  Trash2,
  Phone,
  ArrowRight,
  Clock3,
  X,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";

const statuses: OrderStatus[] = [
  "Pending",
  "Ready",
  "Delivered",
];

export default function Dashboard({
  user,
  initialOrders,
  initialNotifications,
}: {
  user: any;
  initialOrders: Order[];
  initialNotifications: Notification[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [notifications, setNotifications] =
    useState(initialNotifications);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [toast, setToast] = useState("");

  const supabase = createClient();

  const today = localDateString();
  const tomorrow = addDaysString(today, 1);

  const todayOrders = orders.filter(
    (o) =>
      o.delivery_date === today &&
      o.status !== "Delivered"
  );

  const tomorrowOrders = orders.filter(
    (o) =>
      o.delivery_date === tomorrow &&
      o.status !== "Delivered"
  );

  const upcomingOrders = orders.filter(
    (o) =>
      o.delivery_date > tomorrow &&
      o.status !== "Delivered"
  );

  const completedOrders = orders.filter(
    (o) => o.status === "Delivered"
  );

  async function saveOrder(data: Partial<Order>) {
    const payload = {
      customer_name: data.customer_name?.trim(),
      customer_phone: data.customer_phone?.trim(),
      product_description:
        data.product_description?.trim(),
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

    if (!editing && payload.delivery_date < today) {
      setToast("Delivery date cannot be in the past.");
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
      setToast(
        "Could not save the order. Please try again."
      );
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

    setShowAdd(false);
    setEditing(null);
    setToast("Order saved successfully.");
  }

  async function deleteOrder(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this order?"
      )
    )
      return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      setToast("Could not delete the order.");
      return;
    }

    setOrders((prev) =>
      prev.filter((o) => o.id !== id)
    );

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

  async function markRead(id: string) {
    await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppSidebar />

      <div className="lg:pl-[260px]">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Here’s what’s happening with your orders.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/orders"
              className="hidden sm:flex btn btn-secondary"
            >
              <Search size={17} />
              All Orders
            </Link>

            <button
              className="btn btn-primary"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Today"
              value={todayOrders.length}
              description="Orders to deliver today"
              icon={<Package size={20} />}
              accent="blue"
            />

            <StatCard
              title="Tomorrow"
              value={tomorrowOrders.length}
              description="Orders due tomorrow"
              icon={<CalendarDays size={20} />}
              accent="violet"
            />

            <StatCard
              title="Upcoming"
              value={upcomingOrders.length}
              description="Future pending orders"
              icon={<Clock3 size={20} />}
              accent="orange"
            />

            <StatCard
              title="Completed"
              value={completedOrders.length}
              description="Delivered orders"
              icon={<CheckCircle2 size={20} />}
              accent="green"
            />
          </section>

          <section className="grid xl:grid-cols-2 gap-6">
            <OrderSection
              title="Today's Orders"
              subtitle="These orders need your attention today."
              orders={todayOrders}
              emptyText="No orders to deliver today."
              onEdit={setEditing}
              onStatusChange={updateStatus}
              onDelete={deleteOrder}
            />

            <OrderSection
              title="Tomorrow's Orders"
              subtitle="Prepare these orders for tomorrow."
              orders={tomorrowOrders}
              emptyText="No orders scheduled for tomorrow."
              onEdit={setEditing}
              onStatusChange={updateStatus}
              onDelete={deleteOrder}
            />
          </section>

          <section
            id="reminders"
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Bell
                    size={19}
                    className="text-orange-500"
                  />

                  <h2 className="font-black text-lg">
                    Reminders
                  </h2>

                  {notifications.length > 0 && (
                    <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Orders that need attention soon.
                </p>
              </div>
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-5 sm:p-6 flex gap-4 bg-orange-50/40"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Bell size={18} />
                    </div>

                    <div className="flex-1">
                      <div className="font-black text-slate-900">
                        {notification.title}
                      </div>

                      <div className="text-sm text-slate-600 whitespace-pre-line mt-2 leading-6">
                        {notification.body}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        markRead(notification.id)
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={21} />
                </div>

                <div className="font-black mt-4">
                  Nothing needs attention
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  No upcoming reminders right now.
                </p>
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-black">
                  Manage all orders
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Search customers, filter statuses and
                  manage your full order history.
                </p>
              </div>

              <Link
                href="/orders"
                className="btn btn-primary"
              >
                Open All Orders
                <ArrowRight size={17} />
              </Link>
            </div>
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

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent: "blue" | "violet" | "orange" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[accent]}`}
      >
        {icon}
      </div>

      <div className="text-3xl font-black mt-5">
        {value}
      </div>

      <div className="font-black mt-1">
        {title}
      </div>

      <div className="text-xs sm:text-sm text-slate-500 mt-1">
        {description}
      </div>
    </div>
  );
}

function OrderSection({
  title,
  subtitle,
  orders,
  emptyText,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  title: string;
  subtitle: string;
  orders: Order[];
  emptyText: string;
  onEdit: (order: Order) => void;
  onStatusChange: (
    order: Order,
    status: OrderStatus
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
        <h2 className="font-black text-lg">
          {title}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {subtitle}
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 5).map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package size={21} />
          </div>

          <div className="font-bold mt-4">
            {emptyText}
          </div>
        </div>
      )}
    </section>
  );
}

function OrderItem({
  order,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  onEdit: (order: Order) => void;
  onStatusChange: (
    order: Order,
    status: OrderStatus
  ) => void;
  onDelete: (id: string) => void;
}) {
  const nextAction = getNextStatusAction(order.status);

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-slate-900">
            {order.customer_name}
          </h3>

          <span
            className={`status status-${order.status}`}
          >
            {order.status}
          </span>
        </div>

        <div className="text-sm text-slate-500 mt-2 line-clamp-2">
          {order.product_description}
        </div>

        <a
          href={`tel:${order.customer_phone}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 mt-2"
        >
          <Phone size={14} />
          {order.customer_phone}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn btn-secondary"
          onClick={() => onEdit(order)}
        >
          <Pencil size={15} />
          Edit
        </button>

        {nextAction && (
          <button
            className={nextAction.className}
            onClick={() =>
              onStatusChange(
                order,
                nextAction.nextStatus
              )
            }
          >
            {nextAction.icon}
            {nextAction.label}
          </button>
        )}

        <button
          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
          onClick={() =>
            onDelete(order.id)
          }
          title="Delete order"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function getNextStatusAction(
  status: OrderStatus
): {
  nextStatus: OrderStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
} | null {
  if (status === "Pending") {
    return {
      nextStatus: "Ready",
      label: "Mark Ready",
      icon: <PackageCheck size={15} />,
      className:
        "btn bg-blue-50 text-blue-700 hover:bg-blue-100",
    };
  }

  if (status === "Ready") {
    return {
      nextStatus: "Delivered",
      label: "Mark Delivered",
      icon: <CheckCircle2 size={15} />,
      className:
        "btn bg-green-50 text-green-700 hover:bg-green-100",
    };
  }

  return null;
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
    setForm((previous) => ({
      ...previous,
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
            className="ml-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <Field label="Customer Name">
            <input
              className="input"
              value={
                form.customer_name || ""
              }
              placeholder="e.g. Ardit Hoxha"
              onChange={(e) =>
                set(
                  "customer_name",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="Phone Number">
            <input
              className="input"
              value={
                form.customer_phone || ""
              }
              placeholder="e.g. 0691234567"
              onChange={(e) =>
                set(
                  "customer_phone",
                  e.target.value
                )
              }
            />
          </Field>

          <Field label="Product Description">
            <textarea
              className="input min-h-28"
              value={
                form.product_description ||
                ""
              }
              placeholder="Describe the customer order"
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
              value={
                form.delivery_date || ""
              }
              onChange={(e) =>
                set(
                  "delivery_date",
                  e.target.value
                )
              }
            />
          </Field>

          {order && (
            <Field label="Status">
              <select
                className="input"
                value={
                  form.status || "Pending"
                }
                onChange={(e) =>
                  set(
                    "status",
                    e.target.value
                  )
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