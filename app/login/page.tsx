"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
      });
      if (error) setMessage(error.message);
      else setMessage("Account created. Check your email if confirmation is enabled.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message); else router.push("/dashboard");
    }
    setLoading(false);
  }

  async function reset() {
    if (!email) return setMessage("Enter your email first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setMessage(error ? error.message : "Password reset email sent.");
  }

  return <main className="min-h-screen flex items-center justify-center p-5">
    <div className="card w-full max-w-md p-7">
      <h1 className="text-3xl font-black mb-2">Store Orders</h1>
      <p className="text-gray-500 mb-6">Fast, private order management.</p>
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required />}
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? "Please wait..." : mode==="login" ? "Log in" : "Create account"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      <div className="mt-5 flex flex-col gap-2 text-sm">
        <button onClick={()=>setMode(mode==="login"?"signup":"login")} className="text-blue-600 text-left">
          {mode==="login" ? "Create a new account" : "Already have an account? Log in"}
        </button>
        {mode==="login" && <button onClick={reset} className="text-blue-600 text-left">Forgot password?</button>}
      </div>
    </div>
  </main>;
}
