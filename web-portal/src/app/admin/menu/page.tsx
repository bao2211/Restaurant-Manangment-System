"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface FoodItem {
  foodId: string;
  foodName: string;
  unitPrice: number;
  foodImage: string;
  cateId: string;
  categoryName?: string;
  description?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function AdminMenuPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<{ cateId: string; cateName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editCate, setEditCate] = useState("");
  const [editImage, setEditImage] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newCate, setNewCate] = useState("");
  const [newImage, setNewImage] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const fetchData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/FoodInfo`),
        fetch(`${API_BASE}/api/Category`),
      ]);
      if (foodRes.ok) setItems(await foodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { (async () => { await fetchData(); })(); }, []);

  const addItem = async () => {
    if (!newName || !newCate) return;
    try {
      const res = await fetch(`${API_BASE}/api/FoodInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: `F${Date.now()}`.slice(0, 10), foodName: newName, unitPrice: newPrice,
          cateId: newCate, foodImage: newImage || "https://placehold.co/400x300/f3f4f6/9ca3af?text=Món+ăn",
        }),
      });
      if (res.ok) { showToast("Thêm món thành công"); setNewName(""); setShowNew(false); fetchData(); }
    } catch {}
  };

  const updateItem = async (foodId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/FoodInfo/${foodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId, foodName: editName, unitPrice: editPrice, cateId: editCate, foodImage: editImage }),
      });
      if (res.ok) { showToast("Cập nhật thành công"); setEditing(null); fetchData(); }
    } catch {}
  };

  const deleteItem = async (foodId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/FoodInfo/${foodId}`, { method: "DELETE" });
      if (res.ok) { showToast("Đã xóa món"); fetchData(); }
    } catch {}
  };

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!user || user.role !== "Admin") return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Không có quyền truy cập</p></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="bg-gradient-to-br from-orange-500 to-red-500">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Quản lý thực đơn</h1>
              <p className="text-white/70 mt-2 text-sm">Thêm, sửa, xóa món ăn</p>
            </div>
            <button onClick={() => setShowNew(!showNew)} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-bold hover:bg-white/30 transition-all">
              <Plus className="w-4 h-4" /> Thêm món
            </button>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 space-y-4 max-w-3xl">
          {showNew && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80">
              <h3 className="font-bold text-gray-900 mb-4">Thêm món mới</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Tên món" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400" />
                <input type="number" placeholder="Giá" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400" />
                <select value={newCate} onChange={(e) => setNewCate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400">
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.cateId} value={c.cateId}>{c.cateName}</option>)}
                </select>
                <input type="text" placeholder="URL hình ảnh" value={newImage} onChange={(e) => setNewImage(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <button onClick={addItem} className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all">Thêm</button>
            </motion.div>
          )}

          {loading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" /></div>
          : items.map((item, i) => (
            <motion.div key={item.foodId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80"
            >
              {editing === item.foodId ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
                    <select value={editCate} onChange={(e) => setEditCate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm">
                      {categories.map((c) => <option key={c.cateId} value={c.cateId}>{c.cateName}</option>)}
                    </select>
                    <input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateItem(item.foodId)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Lưu</button>
                    <button onClick={() => setEditing(null)} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 flex items-center gap-1"><X className="w-4 h-4" /> Hủy</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={item.foodImage} alt={item.foodName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{item.foodName}</h3>
                    <p className="text-xs text-gray-400">{item.categoryName || "Không danh mục"} · {new Intl.NumberFormat("vi-VN").format(item.unitPrice)}₫</p>
                  </div>
                  <button onClick={() => { setEditing(item.foodId); setEditName(item.foodName); setEditPrice(item.unitPrice); setEditCate(item.cateId); setEditImage(item.foodImage || ""); }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteItem(item.foodId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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