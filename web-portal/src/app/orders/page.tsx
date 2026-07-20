"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Clock, ChevronDown, ShoppingBag, Loader2, Search, ArrowUpDown, CreditCard } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import PayOSModal from "@/components/ui/payos-modal";
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
  createdTime: string;
  status: string;
  total: number;
  note?: string;
  tableId?: string;
  tableName?: string;
  paymentStatus?: string;
  orderDetails?: OrderDetail[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

const statusColors: Record<string, string> = {
  "Chưa làm": "bg-orange-100 text-orange-600",
  Pending: "bg-orange-100 text-orange-600",
  pending: "bg-orange-100 text-orange-600",
  "Hoàn tất": "bg-green-100 text-green-600",
  completed: "bg-green-100 text-green-600",
};

const statusLabels: Record<string, string> = {
  "Chưa làm": "Chưa làm", Pending: "Chưa làm", pending: "Chưa làm",
  "Hoàn tất": "Hoàn tất", completed: "Hoàn tất",
};

function getGroup(status: string): string {
  if (status === "Hoàn tất" || status === "completed") return "Hoàn tất";
  return "Chưa làm";
}

function isPaid(paymentStatus?: string): boolean {
  const s = (paymentStatus || "").toLowerCase();
  return s === "đã thanh toán" || s === "paid";
}

function isOrderDone(orderStatus: string): boolean {
  const s = (orderStatus || "").toLowerCase();
  return s === "hoàn tất" || s === "completed";
}

function getProgressTag(orderDetails?: OrderDetail[], orderStatus?: string): { label: string; color: string } {
  if (!orderDetails || orderDetails.length === 0) return { label: "Chưa có món", color: "bg-gray-100 text-gray-500" };
  const hasStatusData = orderDetails.some((d) => d.status && d.status.trim() !== "");
  if (hasStatusData) {
    const allDone = orderDetails.every((d) => (d.status || "").trim() === "Hoàn tất");
    return allDone
      ? { label: "Hoàn tất", color: "bg-green-100 text-green-600" }
      : { label: "Chưa hoàn tất", color: "bg-orange-100 text-orange-600" };
  }
  if (isOrderDone(orderStatus || "")) {
    return { label: "Hoàn tất", color: "bg-green-100 text-green-600" };
  }
  return { label: "Chưa hoàn tất", color: "bg-orange-100 text-orange-600" };
}

function getPaymentTag(order?: Order): { label: string; color: string } {
  const s = (order?.paymentStatus || "").toLowerCase();
  if (s === "đã thanh toán" || s === "paid")
    return { label: "Đã thanh toán", color: "bg-blue-100 text-blue-600" };
  return { label: "Chưa thanh toán", color: "bg-red-100 text-red-500" };
}

type SortKey = "date-desc" | "date-asc" | "cost-desc" | "cost-asc";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(!!user);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payosOpen, setPayosOpen] = useState(false);
  const [payosData, setPayosData] = useState({
    qrCode: "",
    checkoutUrl: "",
    orderCode: 0,
    amount: 0,
    orderId: "",
  });
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;
    const uid = user.userId;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Order/user/${uid}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch { /* keep empty */ }
      finally { setLoading(false); }
    })();
  }, [user]);

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");
  const tabs = ["Tất cả", "Chưa làm", "Hoàn tất", "Đã thanh toán", "Chưa thanh toán"];

  let filtered = activeTab === "Tất cả" ? orders 
    : activeTab === "Chưa thanh toán" ? orders.filter((o) => !isPaid(o.paymentStatus))
    : activeTab === "Đã thanh toán" ? orders.filter((o) => isPaid(o.paymentStatus))
    : orders.filter((o) => getGroup(o.status) === activeTab);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        (o.note && o.note.toLowerCase().includes(q)) ||
        statusLabels[o.status]?.toLowerCase().includes(q)
    );
  }

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "date-asc": return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
      case "cost-desc": return (b.total || 0) - (a.total || 0);
      case "cost-asc": return (a.total || 0) - (b.total || 0);
      default: return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-white/70 mt-2 text-sm">Theo dõi lịch sử đặt hàng của bạn</p>
          </motion.div>
        </div>
      </section>

      {/* Search + Sort bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Tìm theo mã đơn, ghi chú..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 focus:outline-none focus:border-[#EE4D2D]/40 cursor-pointer"
              >
                <option value="date-desc">Mới nhất</option>
                <option value="date-asc">Cũ nhất</option>
                <option value="cost-desc">Cao nhất</option>
                <option value="cost-asc">Thấp nhất</option>
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-6 -mb-px overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`shrink-0 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab ? "border-[#EE4D2D] text-[#EE4D2D]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {!user ? (
            <div className="text-center py-20">
              <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Vui lòng đăng nhập để xem đơn hàng</p>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D] mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">{searchQuery ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng nào"}</p>
              <p className="text-gray-300 text-sm mt-1">Hãy đặt món ngay!</p>
            </div>
          ) : (
            filtered.map((order, i) => {
              const isExpanded = expandedId === order.orderId;
              return (
                <motion.div key={order.orderId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80 overflow-hidden"
                >
                  {/* Main card */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#EE4D2D]/10 to-[#FF6633]/10 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#EE4D2D]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{order.orderId}</h3>
                              {(() => {
                                const prog = getProgressTag(order.orderDetails, order.status);
                                const pay = getPaymentTag(order);
                                return (
                                  <>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prog.color}`}>{prog.label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pay.color}`}>{pay.label}</span>
                                  </>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-gray-400">{order.orderDetails?.length || 0} món</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(order.createdTime)}</span>
                          {order.tableName && <span className="flex items-center gap-1">🪑 {order.tableName}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-[#EE4D2D]">{formatPrice(order.total || 0)}</p>
                        <span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isExpanded ? "text-[#EE4D2D]" : "text-gray-400 hover:text-[#EE4D2D]"}`}>
                          {isExpanded ? "Thu gọn" : "Chi tiết"}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-50 mx-5" />
                        <div className="px-5 pb-5 pt-4 space-y-3">
                          {order.orderDetails && order.orderDetails.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Món đã gọi</p>
                              {order.orderDetails.map((detail, di) => (
                                <div key={di} className="flex items-center justify-between py-1.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D]/60" />
                                    <span className="text-sm text-gray-700">{detail.foodName || detail.foodId}</span>
                                    <span className="text-xs text-gray-400">x{detail.quantity}</span>
                                  </div>
                                  {detail.unitPrice && (
                                    <span className="text-sm font-semibold text-gray-900">{formatPrice(detail.unitPrice * detail.quantity)}</span>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                          {order.note && (
                            <div className="bg-gray-50 rounded-xl p-3 mt-2">
                              <p className="text-xs text-gray-400">Ghi chú</p>
                              <p className="text-sm text-gray-600 mt-0.5">{order.note}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className="text-sm font-semibold text-gray-500">Tổng cộng</span>
                            <span className="text-lg font-black text-[#EE4D2D]">{formatPrice(order.total || 0)}</span>
                          </div>

                          {isOrderDone(order.status) && !isPaid(order.paymentStatus) && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setPayingOrderId(order.orderId);
                                try {
                                  const payRes = await fetch(`${API_BASE}/api/PayOS/create-payment`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      orderId: order.orderId,
                                      buyerName: user?.userName || "",
                                      buyerPhone: "",
                                      buyerEmail: user?.email || "",
                                      returnUrl: window.location.origin,
                                      cancelUrl: window.location.origin,
                                    }),
                                  });
                                  if (payRes.ok) {
                                    const payData = await payRes.json();
                                    if (payData.checkoutUrl) {
                                      setPayosData({
                                        qrCode: payData.qrCode || "",
                                        checkoutUrl: payData.checkoutUrl,
                                        orderCode: payData.orderCode || 0,
                                        amount: payData.amount || order.total,
                                        orderId: order.orderId,
                                      });
                                      setPayosOpen(true);
                                    } else {
                                      showToast("Không thể tạo liên kết thanh toán");
                                    }
                                  } else {
                                    showToast("Lỗi tạo thanh toán PayOS");
                                  }
                                } catch {
                                    showToast("Không thể kết nối PayOS");
                                } finally {
                                    setPayingOrderId(null);
                                }
                              }}
                              disabled={payingOrderId === order.orderId}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm hover:bg-[#D64018] disabled:opacity-50 transition-all mt-2"
                            >
                              {payingOrderId === order.orderId ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                              ) : (
                                <><CreditCard className="w-4 h-4" /> Tiếp tục thanh toán</>
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <Footer />

      <PayOSModal
        open={payosOpen}
        onClose={() => setPayosOpen(false)}
        onSuccess={(id) => {
          setPayosOpen(false);
          showToast("Thanh toán thành công!");
          // Refresh orders list
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === id ? { ...o, paymentStatus: "Đã thanh toán" } : o
            )
          );
        }}
        qrCode={payosData.qrCode}
        checkoutUrl={payosData.checkoutUrl}
        orderCode={payosData.orderCode}
        amount={payosData.amount}
        orderId={payosData.orderId}
        apiBase={API_BASE}
      />
    </div>
  );
}