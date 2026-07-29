"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Loader2, CheckCircle, ChefHat, RefreshCw, ChevronDown, ChevronUp, User, MapPin, ArrowUpDown, Truck } from "lucide-react";
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
  deliveryStatus?: string;
  ghtkTrackingId?: string;
  paymentStatus?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

function fmtTime(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(d: string) {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút`;
  return `${Math.floor(m / 60)}h${m % 60}p`;
}

function urg(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m > 30) return "critical";
  if (m > 15) return "warning";
  return "normal";
}

export default function KitchenPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "ready" | "shipped">("all");

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch ──
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/Order`);
      if (!r.ok) return;
      const all: Record<string, unknown>[] = await r.json();

      // Get cooking + completed delivery (including shipped)
      const ids: string[] = all
        .filter((o: Record<string, unknown>) => {
          const s = ((o.status as string) || "").toLowerCase();
          const deliveryStatus = ((o.deliveryStatus as string) || "").toLowerCase();
          
          // Include shipped orders (delivering/delivered)
          if (deliveryStatus && deliveryStatus !== "pending") return true;
          
          // Include pending/cooking orders
          if (s === "pending" || s === "chưa làm") return true;
          
          // Include completed orders that are delivery orders
          if (s === "hoàn tất" || s === "completed") {
            const t = ((o.tableId as string) || "").toLowerCase();
            const n = (o.note as string) || "";
            return t === "giao_hang" || n.includes("Giao đến");
          }
          return false;
        })
        .map((o: Record<string, unknown>) => (o.id as string) || (o.orderId as string))
        .filter(Boolean);

      const dets = await Promise.all(
        ids.map(async (id: string) => {
          try {
            const r2 = await fetch(`${API_BASE}/api/Order/${id}`);
            if (!r2.ok) return null;
            const d = await r2.json();
            console.log(`Order ${id} data:`, { deliveryStatus: d.deliveryStatus, status: d.status, paymentStatus: d.paymentStatus });
            
            // Skip orders that haven't been paid
            const paymentStatus = (d.paymentStatus || "").toLowerCase();
            if (paymentStatus === "chưa thanh toán" || paymentStatus === "unpaid") {
              console.log(`Skipping unpaid order ${id}`);
              return null;
            }
            
            return {
              orderId: d.orderId || d.id,
              tableName: d.tableName || d.tableId || "",
              userName: d.userName || d.userId || "",
              createdTime: d.createdTime || "",
              status: d.status || "",
              total: d.total || 0,
              note: d.note || "",
              deliveryStatus: d.deliveryStatus || "pending",
              ghtkTrackingId: d.ghtkTrackingId || "",
              paymentStatus: d.paymentStatus || "",
              orderDetails: (d.orderDetails || []).map((od: Record<string, unknown>) => ({
                foodId: od.foodId || "",
                foodName: od.foodName || "",
                quantity: od.quantity || 0,
                unitPrice: od.unitPrice || 0,
                status: od.status || "",
              })),
            } as Order;
          } catch { return null; }
        })
      );
      console.log("Fetched orders:", dets.filter(Boolean).length);
      setOrders(dets.filter(Boolean) as Order[]);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Helpers ──
  const isDeliv = (o: Order) =>
    o.tableName?.toLowerCase() === "giao_hang" || o.note?.toLowerCase().includes("giao đến");

  // ── Sort / Filter ──
  const visible = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.tableName.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        (o.note || "").toLowerCase().includes(q) ||
        o.orderDetails.some((d) => (d.foodName || "").toLowerCase().includes(q))
      );
    }
    // Apply status filter
    if (filterStatus === "pending") {
      // Show orders that are still cooking (not all items done)
      list = list.filter((o) => {
        const pendingItems = o.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất");
        return pendingItems.length > 0 && (!o.deliveryStatus || o.deliveryStatus === "pending");
      });
    } else if (filterStatus === "ready") {
      // Show orders that are ready to ship (all items done, not shipped yet)
      list = list.filter((o) => {
        const pendingItems = o.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất");
        const allDone = pendingItems.length === 0;
        const isDelivery = o.tableName?.toLowerCase() === "giao_hang" || o.note?.toLowerCase().includes("giao đến");
        return allDone && isDelivery && (!o.deliveryStatus || o.deliveryStatus === "pending");
      });
    } else if (filterStatus === "shipped") {
      // Show orders that have been shipped
      list = list.filter((o) => o.deliveryStatus && o.deliveryStatus !== "pending");
    }
    // Sort: cooking first, then ready-to-ship, then shipped
    list.sort((a, b) => {
      const aDone = a.deliveryStatus && a.deliveryStatus !== "pending" ? 2 : 0;
      const bDone = b.deliveryStatus && b.deliveryStatus !== "pending" ? 2 : 0;
      const aReady = !aDone && (a.status === "Hoàn tất" || a.status === "completed");
      const bReady = !bDone && (b.status === "Hoàn tất" || b.status === "completed");
      const aS = aDone + (aReady ? 1 : 0);
      const bS = bDone + (bReady ? 1 : 0);
      if (aS !== bS) return aS - bS;
      const da = new Date(a.createdTime).getTime();
      const db = new Date(b.createdTime).getTime();
      return sortNewest ? db - da : da - db;
    });
    return list;
  }, [orders, search, sortNewest, filterStatus]);

  // Debug: Log orders to console
  useEffect(() => {
    console.log("Total orders:", orders.length);
    console.log("Shipped orders:", orders.filter((o) => o.deliveryStatus && o.deliveryStatus !== "pending").map(o => ({ id: o.orderId, status: o.status, deliveryStatus: o.deliveryStatus })));
    console.log("Visible shipped:", visible.filter((o) => o.deliveryStatus && o.deliveryStatus !== "pending").map(o => o.orderId));
  }, [orders, visible]);

  // Counts
  const nCook = visible.filter((o) => (o.status || "").toLowerCase() === "chưa làm" || (o.status || "").toLowerCase() === "pending").length;
  const nPending = visible.reduce((s, o) => s + o.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất").length, 0);
  const nReady = visible.filter((o) => (o.status === "Hoàn tất" || o.status === "completed") && isDeliv(o) && (!o.deliveryStatus || o.deliveryStatus === "pending")).length;
  const nShipped = visible.filter((o) => o.deliveryStatus && o.deliveryStatus !== "pending").length;

  // ── Actions ──
  const markOne = useCallback(async (orderId: string, item: OrderDetail) => {
    try {
      const r = await fetch(`${API_BASE}/api/OrderDetail/food/${item.foodId}/order/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: item.foodId, orderId, quantity: item.quantity,
          unitPrice: item.unitPrice || 0, status: "Hoàn tất",
        }),
      });
      if (!r.ok) { showToast("Thất bại"); return; }
      showToast(`${item.foodName || item.foodId} ✅`);

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId !== orderId ? o : {
            ...o,
            orderDetails: o.orderDetails.map((d) =>
              d.foodId === item.foodId ? { ...d, status: "Hoàn tất" } : d
            ),
          }
        )
      );

      // After a tick, check if all done → update status
      setTimeout(() => {
        setOrders((prev) => {
          const targetOrder = prev.find((o) => o.orderId === orderId);
          if (!targetOrder || targetOrder.status === "Hoàn tất" || targetOrder.status === "completed") return prev;
          if (!targetOrder.orderDetails.every((d) => (d.status || "") === "Hoàn tất")) return prev;
          
          // Show toast outside of state update
          setTimeout(() => showToast(`Đơn ${orderId} - Hoàn tất!`), 0);
          
          fetch(`${API_BASE}/api/Order/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ OrderId: orderId, Status: "Hoàn tất" }),
          }).catch(() => {});
          
          return prev.map((o) => o.orderId === orderId ? { ...o, status: "Hoàn tất" } : o);
        });
      }, 100);
    } catch {}
  }, [showToast]);

  const markAll = useCallback(async (orderId: string, items: OrderDetail[]) => {
    for (const it of items) {
      if ((it.status || "") !== "Hoàn tất") await markOne(orderId, it);
    }
  }, [markOne]);

  const ship = useCallback(async (order: Order) => {
    showToast(`Đang gửi GHTK ${order.orderId}...`);
    try {
      const payload = {
        products: order.orderDetails.map((d) => ({
          name: d.foodName || `Món ${d.foodId}`, weight: 0.5,
          quantity: d.quantity || 1, product_code: d.foodId,
        })),
        order: {
          id: order.orderId,
          pick_name: "RMS Quản Lý Nhà Hàng",
          pick_address: "590 Cách Mạng Tháng 8, P.11, Q.3",
          pick_province: "TP. Hồ Chí Minh",
          pick_district: "Quận 3",
          pick_ward: "Phường 1",
          pick_tel: "0909123456",
          tel: "0911222333",
          name: order.userName || "Khách",
          address: order.note?.match(/Giao đến: (.*?)(?:\||$)/)?.[1]?.trim() || "",
          province: "TP. Hồ Chí Minh",
          district: "Quận 1",
          ward: "Phường Bến Nghé",
          hamlet: "Khác",
          pick_money: 0,
          value: Math.round(order.total || 50000),
        },
      };
      const r = await fetch("/api/ghtk/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      console.log("GHTK response:", data);
      if (!data.success) { showToast("❌ " + (data.message || "Lỗi GHTK")); return; }
      const code = data.tracking_code || data.tracking_id || "";
      console.log("GHTK tracking code:", code, "type:", typeof code);
      showToast(`✅ Đã gửi - Mã: ${code}`);
      
      // Update order status in backend - use PATCH endpoint
      try {
        const updatePayload = { 
          DeliveryStatus: "delivering",
          GhtkTrackingId: code ? String(code) : "PENDING"
        };
        console.log("PATCH payload:", updatePayload);
        const updateRes = await fetch(`${API_BASE}/api/Order/${order.orderId}/delivery`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error("Failed to update order:", updateRes.status, errorText);
          showToast(`⚠️ GHTK OK nhưng lỗi cập nhật đơn: ${updateRes.status}`);
        } else {
          showToast("✅ Đã cập nhật trạng thái đơn hàng");
        }
      } catch (e) {
        console.error("Error updating order:", e);
        showToast("⚠️ GHTK OK nhưng lỗi cập nhật đơn");
      }
      
      // Update local state regardless
      setOrders((prev) =>
        prev.map((o) => o.orderId === order.orderId ? { ...o, deliveryStatus: "delivering", ghtkTrackingId: code } : o)
      );
    } catch { showToast("❌ Lỗi kết nối GHTK"); }
  }, [showToast]);

  // ── Early returns ──
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

  // ── Render ──
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FFB347] flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-gray-900">Bếp</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 flex-wrap">
                <span className="font-semibold text-orange-500">{nCook} đơn · {nPending} món</span>
                {nReady > 0 && <><span>·</span><span className="font-semibold text-blue-500">{nReady} chờ giao</span></>}
                {nShipped > 0 && <><span>·</span><span className="font-semibold text-green-500">{nShipped} đã giao</span></>}
              </div>
            </div>
            <button onClick={fetchOrders} className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors shrink-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="pb-3 space-y-3">
            {/* Search bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Tìm đơn hàng..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#FF8C42]/40 focus:bg-white transition-all"
                />
              </div>
              <button onClick={() => setSortNewest(!sortNewest)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  sortNewest ? "border-[#FF8C42] bg-[#FF8C42]/5 text-[#FF8C42]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortNewest ? "Mới nhất" : "Cũ nhất"}
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterStatus("all")}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === "all"
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>Tất cả</span>
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px]">{orders.length}</span>
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === "pending"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Chưa hoàn tất</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === "pending" ? "bg-orange-400/30 text-white" : "bg-orange-100 text-orange-600"}`}>
                  {orders.filter((o) => o.orderDetails.some((d) => (d.status || "") !== "Hoàn tất") && (!o.deliveryStatus || o.deliveryStatus === "pending")).length}
                </span>
              </button>
              <button
                onClick={() => setFilterStatus("ready")}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === "ready"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Sẵn sàng giao</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === "ready" ? "bg-blue-400/30 text-white" : "bg-blue-100 text-blue-600"}`}>
                  {orders.filter((o) => {
                    const allDone = o.orderDetails.every((d) => (d.status || "") === "Hoàn tất");
                    const isDelivery = o.tableName?.toLowerCase() === "giao_hang" || o.note?.toLowerCase().includes("giao đến");
                    return allDone && isDelivery && (!o.deliveryStatus || o.deliveryStatus === "pending");
                  }).length}
                </span>
              </button>
              <button
                onClick={() => setFilterStatus("shipped")}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === "shipped"
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Đã giao</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === "shipped" ? "bg-green-400/30 text-white" : "bg-green-100 text-green-600"}`}>
                  {orders.filter((o) => o.deliveryStatus && o.deliveryStatus !== "pending").length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-4">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm text-gray-400">Đang tải...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-gray-900 font-bold text-lg">{search ? "Không tìm thấy" : "Bếp đã xong!"}</p>
            <p className="text-gray-400 text-sm mt-1">{search ? "Thử từ khóa khác" : "Không còn đơn nào"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {visible.map((order) => {
                const pendingItems = order.orderDetails.filter((d) => (d.status || "") !== "Hoàn tất");
                const allDone = pendingItems.length === 0;
                const deliv = isDeliv(order);
                const canShip = allDone && deliv && (!order.deliveryStatus || order.deliveryStatus === "pending");
                const shipped = order.deliveryStatus && order.deliveryStatus !== "pending";
                const urgency = urg(order.createdTime);

                const border = shipped ? "border-green-300" : canShip ? "border-blue-300 ring-1 ring-blue-200" : urgency === "critical" ? "border-red-300" : urgency === "warning" ? "border-orange-300" : "border-gray-100";
                const hBg = shipped ? "bg-green-50 border-green-100" : canShip ? "bg-blue-50 border-blue-100" : urgency === "critical" ? "bg-red-50 border-red-100" : urgency === "warning" ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100";

                const badge = shipped
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-600">{order.deliveryStatus === "delivered" ? "Đã giao" : "Đang giao"}</span>
                  : canShip
                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-600">Chờ giao</span>
                  : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${urgency === "critical" ? "bg-red-100 text-red-600" : urgency === "warning" ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"}`}>{timeAgo(order.createdTime)}</span>;

                return (
                  <motion.div key={order.orderId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ${border}`}
                  >
                    {/* Header */}
                    <div className={`px-4 py-3 border-b ${hBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {(canShip || shipped) && <Truck className={`w-4 h-4 ${shipped ? "text-green-500" : "text-blue-500"}`} />}
                          <span className="text-xs font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">{order.orderId}</span>
                          {badge}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold"><MapPin className="w-3 h-3" /> {order.tableName || "Mang về"}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.userName || "?"}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(order.createdTime)}</span>
                      </div>
                      {order.note && <p className="text-[10px] text-gray-400 mt-1 truncate">{order.note}</p>}
                    </div>

                    {/* All items */}
                    <div className="p-3 space-y-1.5">
                      {order.orderDetails.map((item) => {
                        const done = (item.status || "") === "Hoàn tất";
                        return (
                          <div key={item.foodId} className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${done ? "bg-green-50/50" : "bg-gray-50/80 hover:bg-gray-50"}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`text-[11px] font-black text-white w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-green-400" : "bg-[#FF8C42]"}`}>{item.quantity}</span>
                              <div className="min-w-0">
                                <span className={`text-sm font-semibold block truncate ${done ? "text-green-700" : "text-gray-800"}`}>{item.foodName || `Món ${item.foodId}`}</span>
                                {item.unitPrice ? <span className="text-[10px] text-gray-400">{new Intl.NumberFormat("vi-VN").format(item.unitPrice)}đ</span> : null}
                              </div>
                            </div>
                            {done
                              ? <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Hoàn tất</span>
                              : <button onClick={() => markOne(order.orderId, item)} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-bold hover:bg-green-600 active:scale-95 transition-all shadow-sm shadow-green-500/20"><CheckCircle className="w-3.5 h-3.5" /> Xong</button>
                            }
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-3 pb-3">
                      {shipped ? (
                        <div className="w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center justify-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>{order.deliveryStatus === "delivered" ? "Đã giao hàng" : "Đang giao hàng"}{order.ghtkTrackingId ? ` — Mã: ${order.ghtkTrackingId}` : ""}</span>
                        </div>
                      ) : canShip ? (
                        <button onClick={() => ship(order)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                          <Truck className="w-4 h-4" /> Giao hàng (GHTK)
                        </button>
                      ) : !allDone ? (
                        <button onClick={() => markAll(order.orderId, pendingItems)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Hoàn tất tất cả ({pendingItems.length})
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
