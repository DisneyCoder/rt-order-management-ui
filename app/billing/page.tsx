"use client";

import { useRouter } from "next/navigation";
import BillingForm from "@/app/components/BillingForm";

export default function BillingPage() {
  const router = useRouter();

  const handleSubmit = async (payload: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Order Created Successfully!");
      router.push("/orders"); 
    }
  };

  return <BillingForm onSubmit={handleSubmit} />;
}
