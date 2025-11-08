"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BillingForm from "@/app/components/BillingForm";

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrder);
  }, [id]);

  if (!order) return <div className="p-6">Loading...</div>;

  const handleUpdate = async (payload: any) => {
    const token = localStorage.getItem("token");

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    alert("Order Updated Successfully!");
    router.push("/orders");
  };

  return (
    <BillingForm
      initialCustomerName={order.customer_name}
      initialItems={order.items.map((i: any) => ({
        product_id: i.product_id,
        name: i.product.name + ` (${i.stock.sku})`,
        sale_price: i.sale_price,
        qty: i.quantity,
      }))}
      onSubmit={handleUpdate}
    />
  );
}
