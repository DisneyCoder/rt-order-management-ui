"use client";
import { useState, useEffect } from "react";

interface Stock {
  id: number;
  sku: string;
  sale_price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  stocks: Stock[];
}

interface OrderItem {
  product_id: number;
  name: string;
  sale_price: number;
  qty: number;
}

interface BillingFormProps {
  initialCustomerName?: string;
  initialItems?: OrderItem[];
  onSubmit: (payload: {
    customer_name: string;
    status: string;
    items: { product_id: number; quantity: number }[];
  }) => void;
}

export default function BillingForm({
  initialCustomerName = "",
  initialItems = [],
  onSubmit,
}: BillingFormProps) {
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialItems);

  useEffect(() => {
    if (search.length < 2) return;

    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/search?query=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setResults(data);
    };

    fetchProducts();
  }, [search]);

  const addItem = (product: Product, stock: Stock) => {
    setOrderItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        name: product.name + ` (${stock.sku})`,
        sale_price: stock.sale_price,
        qty: 1,
      },
    ]);
    setResults([]);
    setSearch("");
  };

  const changeQty = (index: number, qty: number) => {
    const updated = [...orderItems];
    updated[index].qty = qty;
    setOrderItems(updated);
  };

  const handleSubmit = () => {
    onSubmit({
      customer_name: customerName,
      status: "Pending",
      items: orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.qty,
      })),
    });
  };

  const totalAmount = orderItems.reduce(
    (sum, i) => sum + i.sale_price * i.qty,
    0
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Billing Page</h2>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Search Product (Name / Barcode / SKU)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {results.length > 0 && (
        <div className="border bg-white shadow p-2 mt-1 max-h-64 overflow-y-auto">
          {results.map((product) => (
            <div key={product.id} className="p-2 border-b">
              <div className="font-semibold">{product.name}</div>
              {product.stocks.map((stock) => (
                <div
                  key={stock.id}
                  onClick={() => addItem(product, stock)}
                  className="p-1 ml-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  SKU: {stock.sku} — {stock.sale_price} Tk (Qty: {stock.quantity})
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.sale_price}</td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  className="w-20 border p-1"
                  onChange={(e) => changeQty(index, Number(e.target.value))}
                />
              </td>
              <td className="border p-2">{item.sale_price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-3 font-semibold text-lg">
        Total: {totalAmount} Tk
      </div>

      <button
        onClick={handleSubmit}
        className="mt-5 w-full bg-black text-white py-2 rounded"
      >
        Submit Order
      </button>
    </div>
  );
}
