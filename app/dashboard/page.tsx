"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-6">Dashboard</h2>

        <button
          onClick={() => router.push("/billing")}
          className="py-2 px-3 text-left hover:bg-green-500 rounded bg-green-600"
        >
          Billing Page
        </button>

        <button
          onClick={() => router.push("/orders")}
          className="py-2 px-3 text-left hover:bg-amber-400 rounded bg-amber-500"
        >
          Orders
        </button>
      </div>

      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-4">Welcome to  Dashboard</h1>
        <p className="text-gray-600">Select an option from the left menu to continue.</p>
      </div>
    </div>
  );
}
