"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Clock, QrCode, Loader2 } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useToast } from "@/contexts/toast-context";

interface TableInfo {
  tableId: string;
  tableName: string;
  capacity?: number;
  status?: string;
  location?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

const statusStyles: Record<string, string> = {
  Available: "bg-green-100 text-green-600 border-green-200",
  Trống: "bg-green-100 text-green-600 border-green-200",
  Occupied: "bg-blue-100 text-blue-600 border-blue-200",
  "Đang dùng": "bg-blue-100 text-blue-600 border-blue-200",
};

const statusLabels: Record<string, string> = {
  Available: "Trống", Occupied: "Đang dùng",
  Trống: "Trống", "Đang dùng": "Đang dùng",
};

export default function TablePage() {
  const { showToast } = useToast();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch(`${API_BASE}/api/Table`);
        if (res.ok) {
          const data = await res.json();
          setTables(data);
        }
      } catch { /* use mock */ }
      finally { setLoading(false); }
    }
    fetchTables();
  }, []);

  const displayStatus = (t: TableInfo) => statusLabels[t.status || ""] || t.status || "Trống";
  const filtered = filter ? tables.filter((t) => displayStatus(t) === filter) : tables;
  const countByStatus = (s: string) => tables.filter((t) => displayStatus(t) === s).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-br from-[#4CAF50] via-[#66BB6A] to-[#81C784]">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Quản lý bàn</h1>
            <p className="text-white/70 mt-2 text-sm">Xem tình trạng và đặt bàn</p>
          </motion.div>
        </div>
      </section>

      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              {[
                { label: "Trống", count: countByStatus("Trống"), color: "bg-green-500" },
                { label: "Đang dùng", count: countByStatus("Đang dùng"), color: "bg-blue-500" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-2xl bg-gray-50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${stat.color}`} />
                    <span className="text-2xl font-black text-gray-900">{stat.count}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 py-3 overflow-x-auto hide-scrollbar">
            {["Tất cả", "Trống", "Đang dùng"].map((s) => (
              <button key={s} onClick={() => setFilter(filter === s || (s === "Tất cả" && !filter) ? null : s === "Tất cả" ? null : s)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  (s === "Tất cả" && !filter) || filter === s ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((table, i) => {
                const status = displayStatus(table);
                return (
                  <motion.div key={table.tableId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          status === "Trống" ? "bg-green-50" : "bg-blue-50"
                        }`}>🪑</div>
                        <div>
                          <h3 className="font-bold text-gray-900">{table.tableName}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <Users className="w-3 h-3" />
                            <span>{table.capacity || "-"} khách</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyles[status] || statusStyles[table.status || ""] || "bg-gray-100 text-gray-500"}`}>
                        {status}
                      </span>
                    </div>
                    {status === "Trống" && (
                      <button onClick={() => showToast(`Đã đặt ${table.tableName} thành công!`)}
                        className="w-full mt-4 bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white text-sm font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#4CAF50]/30 transition-all duration-300 flex items-center justify-center gap-1.5"
                      ><QrCode className="w-4 h-4" /> Đặt bàn</button>
                    )}
                    {status === "Đang dùng" && (
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Đang phục vụ</span>
                        <button className="text-blue-600 font-semibold hover:underline">Xem đơn</button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Không có bàn nào</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}