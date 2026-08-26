import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AppSidebar from "@/app/components/AppSidebar";
import SettingsUI from "./ui";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <AppSidebar />
      <SettingsUI email={user.email ?? ""} />
    </>
  );
}