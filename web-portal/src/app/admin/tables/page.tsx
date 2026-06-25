"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Users, Check, X } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface Table {
  tableId: string;
  tableName: string;
  numOfSeats?: number;
  status?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function AdminTablesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState(4);
  const [newName, setNewName] = useState("");
  const [newSeats, setNewSeats] = useState(4);
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Table`);
      if (res.ok) setTables(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { (async () => { await fetchTables(); })(); }, []);

  const addTable = async () => {
    if (!newName) return;
    try {
      const res = await fetch(`${API_BASE}/api/Table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: `T${Date.now()}`.slice(0, 10), tableName: newName, numOfSeats: newSeats, status: "Available" }),
      });
      if (res.ok) { showToast("Thêm bàn thành công"); setNewName(""); setShowNew(false); fetchTables(); }
    } catch {}
  };

  const updateTable = async (tableId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/Table/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, tableName: editName, numOfSeats: editSeats }),
      });
      if (res.ok) { showToast("Cập nhật thành công"); setEditing(null); fetchTables(); }
    } catch {}
  };

  const deleteTable = async (tableId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/Table/${tableId}`, { method: "DELETE" });
      if (res.ok) { showToast("Đã xóa bàn"); fetchTables(); }
    } catch {}
  };

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>;
  if (!user || user.role !== "Admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Không có quyền truy cập</p></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="bg-gradient-to-br from-green-500 to-emerald-500">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Quản lý bàn</h1>
              <p className="text-white/70 mt-2 text-sm">Thêm, sửa, xóa bàn ăn</p>
            </div>
            <button onClick={() => setShowNew(!showNew)} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-bold hover:bg-white/30 transition-all">
              <Plus className="w-4 h-4" /> Thêm bàn
            </button>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 space-y-4 max-w-2xl">
          {showNew && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
              <h3 className="font-bold text-gray-900 mb-4">Thêm bàn mới</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="Tên bàn" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-400 transition-all" />
                <input type="number" placeholder="Số ghế" value={newSeats} onChange={(e) => setNewSeats(Number(e.target.value))} min={1}
                  className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-400 transition-all" />
                <button onClick={addTable} className="bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">Thêm</button>
              </div>
            </motion.div>
          )}

          {loading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" /></div>
          : tables.map((t) => (
            <motion.div key={t.tableId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80"
            >
              {editing === t.tableId ? (
                <div className="flex gap-3">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-400" />
                  <input type="number" value={editSeats} onChange={(e) => setEditSeats(Number(e.target.value))} min={1}
                    className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-400" />
                  <button onClick={() => updateTable(t.tableId)} className="bg-green-500 text-white p-2.5 rounded-xl hover:bg-green-600"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditing(null)} className="bg-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-300"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">🪑</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{t.tableName}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> {t.numOfSeats || "?"} khách</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(t.tableId); setEditName(t.tableName); setEditSeats(t.numOfSeats || 4); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteTable(t.tableId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}