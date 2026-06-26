"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Loader2, CheckCircle, ChefHat, RefreshCw, ChevronDown, ChevronUp, User, MapPin, ArrowUpDown } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface OrderDetail {
  foodId: string;
  foodName?: string;
  quantity: number;
  unitPrice?: number;
  status?: string;
  orderId?: string;
}

interface Order {
  orderId: string;
  tableName: string;
  userName: string;
  createdTime: string;
  status: string;
  total: number;
  note?: string;
  orderDetails: OrderDetail[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h${mins % 60}p`;
  return `${Math.floor(hrs / 24)}d`;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function urgencyLevel(dateStr: string): "critical" | "warning" | "normal" {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins > 30) return "critical";
  if (mins > 15) return "warning";
  return "normal";
}

function OrderCard({ order, onCompleteItem, onCompleteAll }: {
  order: Order;
  onCompleteItem: (orderId: string, detail: OrderDetail) => void;
  onCompleteAll: (orderId: string, items: OrderDetail[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pendingDetails = order.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất");
  const doneDetails = order.orderDetails.filter((d) => (d.status || "") === "Hoàn tất");
  const allDone = pendingDetails.length === 0;
  const urgency = urgencyLevel(order.createdTime);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ${
        urgency === "critical" ? "border-red-300" :
        urgency === "warning" ? "border-orange-300" :
        "border-gray-100"
      } ${allDone ? "opacity-50" : ""}`}
    >
      <div className={`px-4 py-3 border-b ${
        urgency === "critical" ? "bg-red-50 border-red-100" :
        urgency === "warning" ? "bg-orange-50 border-orange-100" :
        "bg-gray-50 border-gray-100"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">{order.orderId}</span>
            {timeAgo(order.createdTime) && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                urgency === "critical" ? "bg-red-100 text-red-600" :
                urgency === "warning" ? "bg-orange-100 text-orange-600" :
                "bg-gray-200 text-gray-500"
              }`}>{timeAgo(order.createdTime)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3 h-3" /> {order.tableName || "Mang về"}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" /> {order.userName || `User ${order.note?.match(/userId:(\d+)/)?.[1] || "?"}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatTime(order.createdTime)}
          </span>
        </div>
        {order.note && (
          <p className="text-[10px] text-gray-400 mt-1 truncate">{order.note}</p>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        {pendingDetails.slice(0, expanded ? 99 : 4).map((detail) => (
          <div key={detail.foodId} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[11px] font-black text-white bg-[#FF8C42] w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                {detail.quantity}
              </span>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-gray-800 block truncate">{detail.foodName || `Món ${detail.foodId}`}</span>
                {detail.unitPrice ? (
                  <span className="text-[10px] text-gray-400">{new Intl.NumberFormat("vi-VN").format(detail.unitPrice)}đ</span>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => onCompleteItem(order.orderId, detail)}
              className="shrink-0 ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-bold hover:bg-green-600 active:scale-95 transition-all shadow-sm shadow-green-500/20"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Xong
            </button>
          </div>
        ))}

        {doneDetails.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 pt-1 text-green-500">
            <CheckCircle className="w-3 h-3" />
            <span className="text-[10px] font-medium">{doneDetails.length}/{order.orderDetails.length} món đã xong</span>
          </div>
        )}
      </div>

      {pendingDetails.length > 4 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-1.5 text-[10px] font-semibold text-gray-400 hover:text-[#FF8C42] border-t border-gray-50 transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Thu gọn" : `+${pendingDetails.length - 4} món nữa`}
        </button>
      )}

      {!allDone && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onCompleteAll(order.orderId, pendingDetails)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Hoàn tất tất cả ({pendingDetails.length})
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function KitchenPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(20);
  const [sortDesc, setSortDesc] = useState(true);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const fetchOrders = async () => {
    try {
      const listRes = await fetch(`${API_BASE}/api/Order`);
      if (!listRes.ok) return;
      const list = await listRes.json();

      const pendingIds: string[] = list
        .filter((o: Record<string, unknown>) => {
          const s = ((o.status as string) || "").toLowerCase();
          return s === "pending" || s === "chưa làm";
        })
        .map((o: Record<string, unknown>) => (o.id as string) || (o.orderId as string))
        .filter(Boolean);

      const detailed = await Promise.all(
        pendingIds.map(async (id: string) => {
          try {
            const res = await fetch(`${API_BASE}/api/Order/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return {
              orderId: data.orderId || data.id,
              tableName: data.tableName || data.tableId || "",
              userName: data.userName || data.userId || "",
              createdTime: data.createdTime || data.orderDate || "",
              status: data.status || "",
              total: data.total || 0,
              note: data.note || "",
              orderDetails: (data.orderDetails || []).map((d: Record<string, unknown>) => ({
                foodId: d.foodId || "",
                foodName: d.foodName || "",
                quantity: d.quantity || 0,
                unitPrice: d.unitPrice || 0,
                status: d.status || "",
                orderId: d.orderId || data.orderId || id,
              })),
            } as Order;
          } catch { return null; }
        })
      );

      setOrders(detailed.filter(Boolean) as Order[]);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        (o.orderId || "").toLowerCase().includes(q) ||
        (o.tableName || "").toLowerCase().includes(q) ||
        (o.userName || "").toLowerCase().includes(q) ||
        (o.note || "").toLowerCase().includes(q) ||
        o.orderDetails.some((d) => (d.foodName || "").toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      const da = new Date(a.createdTime).getTime();
      const db = new Date(b.createdTime).getTime();
      return sortDesc ? db - da : da - db;
    });
    return result.slice(0, showCount);
  }, [orders, search, showCount, sortDesc]);

  const totalPendingItems = orders.reduce((sum, o) => sum + o.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất").length, 0);

  const completeItem = async (orderId: string, detail: OrderDetail) => {
    try {
      const res = await fetch(`${API_BASE}/api/OrderDetail/food/${detail.foodId}/order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: detail.foodId, orderId, quantity: detail.quantity,
          unitPrice: detail.unitPrice || 0, status: "Hoàn tất",
        }),
      });
      if (res.ok) {
        showToast(`${detail.foodName || detail.foodId} - Xong`);

        const updated = orders.map((o) => o.orderId === orderId
          ? { ...o, orderDetails: o.orderDetails.map((d) => d.foodId === detail.foodId ? { ...d, status: "Hoàn tất" } : d) }
          : o
        );
        setOrders(updated);

        const order = updated.find((o) => o.orderId === orderId);
        if (order) {
          const allDone = order.orderDetails.every((d) => (d.status || "") === "Hoàn tất");
          if (allDone) {
            showToast(`Đơn ${orderId} - Tất cả món đã hoàn tất!`);
            try {
              await fetch(`${API_BASE}/api/Order/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: "Hoàn tất" }),
              });
            } catch {}
            setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
          }
        }
      } else showToast("Cập nhật thất bại");
    } catch {}
  };

  const completeAll = async (orderId: string, items: OrderDetail[]) => {
    for (const item of items) {
      if ((item.status || "") !== "Hoàn tất") {
        await completeItem(orderId, item);
      }
    }
    showToast(`Đơn ${orderId} - Hoàn tất!`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        <Footer />
      </div>
    );
  }

  if (!user || (user.role !== "Admin" && user.role !== "Bep")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Bạn không có quyền truy cập</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FFB347] flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black text-gray-900">Bếp</h1>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="font-semibold text-orange-500">{orders.length} đơn chờ</span>
                <span>·</span>
                <span>{totalPendingItems} món</span>
              </div>
            </div>
            <button onClick={() => { setLoading(true); fetchOrders(); }}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Tìm mã đơn, bàn, tên món..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#FF8C42]/40 focus:bg-white transition-all"
                />
              </div>
              <button onClick={() => setSortDesc(!sortDesc)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  sortDesc ? "border-[#FF8C42] bg-[#FF8C42]/5 text-[#FF8C42]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortDesc ? "Mới nhất" : "Cũ nhất"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-4">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-gray-900 font-bold text-lg">
              {search ? "Không tìm thấy đơn" : "Bếp đã xong!"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Thử tìm từ khóa khác" : "Không còn đơn cần xử lý"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((order) => (
                  <OrderCard key={order.orderId} order={order} onCompleteItem={completeItem} onCompleteAll={completeAll} />
                ))}
              </AnimatePresence>
            </div>
            {!search && showCount < orders.length && (
              <div className="text-center mt-6">
                <button onClick={() => setShowCount((p) => p + 20)}
                  className="px-6 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#FF8C42] hover:text-[#FF8C42] transition-all"
                >
                  Xem thêm ({orders.length - showCount} đơn)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}