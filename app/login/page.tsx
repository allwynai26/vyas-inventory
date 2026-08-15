"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobile || !password) {
      alert("Enter Mobile Number and Password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
          password,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {

  localStorage.setItem(
    "vyas_user",
    JSON.stringify(result.user)
  );

  document.cookie =
    "vyas_logged_in=true; path=/";

  router.push("/");
}
    } catch (error) {
      console.error(error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-2xl font-bold mb-5">
          Vyas Inventory Login
        </h1>

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full border p-3 rounded-xl mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

      </div>
    </main>
  );
}