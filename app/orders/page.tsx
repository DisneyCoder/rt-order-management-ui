"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  stock_id: number;
  quantity: number;
  sale_price: number;
  sub_total: number;
  profit: number;
};

export type Order = {
  id: number;
  invoice_number: string;
  total_amount: number;
  customer_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

type ApiResponse = {
  current_page: number;
  data: Order[];
  per_page: number;
  total: number;
  last_page: number;
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [perPage, setPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token") ?? "";
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data: ApiResponse = await res.json();
        setOrders(data.data ?? []);
      } catch (err) {
        console.error("fetch orders error", err);
      }
    };

    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (o) =>
          (o.customer_name ?? "").toLowerCase().includes(s) ||
          (o.invoice_number ?? "").toLowerCase().includes(s)
      );
    }

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate).endOf("day");

      list = list.filter((o) => {
        const created = dayjs(o.created_at);
        return created.isSame(start) || created.isSame(end) || (created.isAfter(start) && created.isBefore(end));
      });
    }

    return list;
  }, [orders, search, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const startIdx = (page - 1) * perPage;
    return filtered.slice(startIdx, startIdx + perPage);
  }, [filtered, page, perPage]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Delete failed");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-1/3"
          placeholder="Search customer or invoice"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={() => {
            setPage(1);
          }}
          className="bg-black text-white px-4 rounded"
        >
          Apply
        </button>
      </div>

      <div className="mb-3">
        <label className="mr-2">Per page:</label>
        <select
          value={perPage.toString()}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="border p-1"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Invoice</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No orders
                </td>
              </tr>
            ) : (
              pageData.map((o) => (
                <tr key={o.id}>
                  <td className="border p-2">{o.invoice_number}</td>
                  <td className="border p-2">{o.customer_name}</td>
                  <td className="border p-2">{dayjs(o.created_at).format("YYYY-MM-DD")}</td>
                  <td className="border p-2">{o.status}</td>
                  <td className="border p-2">{o.total_amount}</td>
                  <td className="border p-2">
                    <a
                      className="text-white bg-blue-600 p-2 rounded-md"
                      href={`/orders/${o.id}/edit`}
                    >
                      Edit
                    </a>
                    <button className="text-white bg-red-500 p-2 rounded-md ml-4" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} -{" "}
          {Math.min(page * perPage, filtered.length)} of {filtered.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <div>
            Page {page} / {totalPages}
          </div>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
