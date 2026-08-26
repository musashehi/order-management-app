export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivered";

export type Order = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  product_description: string;
  delivery_date: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  reminder_sent: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  order_id: string | null;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
};
