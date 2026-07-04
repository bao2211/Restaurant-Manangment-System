"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, Plus, Minus, LogOut, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";

interface FoodItem {
  foodId: string;
  foodName: string;
  unitPrice: number;
  foodImage: string;
  categoryName: string;
}

interface HeaderProps {
  onSearch?: (query: string) => void;
  foodItems?: FoodItem[];
  onSearchSelect?: (foodId: string, foodName: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

function SearchDropdown({ query, items, onSelect, onClose }: {
  query: string;
  items: FoodItem[];
  onSelect: (foodId: string, foodName: string) => void;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (!query.trim()) return null;

  const q = query.toLowerCase();
  const matches = items.filter(
    (item) => item.foodName.toLowerCase().includes(q) || item.categoryName.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    return (
      <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
        <div className="p-6 text-center">
          <p className="text-gray-400 text-sm">Không tìm thấy món ăn nào</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
      {matches.slice(0, 8).map((item) => (
        <button
          key={item.foodId}
          onClick={() => { onSelect(item.foodId, item.foodName); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
        >
          <img src={item.foodImage} alt={item.foodName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.foodName}</p>
            <p className="text-xs text-gray-400">{item.categoryName}</p>
          </div>
          <span className="text-sm font-black text-[#EE4D2D] shrink-0">{formatPrice(item.unitPrice)}</span>
        </button>
      ))}
      {matches.length > 8 && (
        <div className="p-3 text-center border-t border-gray-50">
          <span className="text-xs text-gray-400">+{matches.length - 8} kết quả khác</span>
        </div>
      )}
    </div>
  );
}

interface TableInfo {
  tableId: string;
  tableName: string;
  numOfSeats?: number;
  status?: string;
}

function PayOSModal({ open, onClose, orderId, orderCode, qrCode, checkoutUrl, amount }: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: number;
  qrCode: string;
  checkoutUrl: string;
  amount: number;
}) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<"waiting" | "paid" | "cancelled">("waiting");
  const [elapsed, setElapsed] = useState(0);
  const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p) + "đ";

  useEffect(() => {
    if (!open) return;
    setStatus("waiting");
    setElapsed(0);
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/PayOS/status/${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            setStatus("paid");
            try { await fetch(`${API_BASE}/api/PayOS/confirm/${orderCode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) }); } catch {};
            try { await fetch(`${API_BASE}/api/Order/${orderId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, paymentStatus: "Đã thanh toán" }) }); } catch {}
            showToast("Thanh toán thành công!");
            clearInterval(poll);
            clearInterval(timer);
          } else if (data.status === "CANCELLED" || data.status === "EXPIRED") {
            setStatus("cancelled");
            clearInterval(poll);
            clearInterval(timer);
          }
        }
      } catch {}
    }, 5000);
    return () => { clearInterval(poll); clearInterval(timer); };
  }, [open, orderCode, orderId, showToast]);

  if (!open) return null;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>

        {status === "waiting" && (
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 mb-1">Quét mã QR để thanh toán</p>
            <p className="text-xs text-gray-400 mb-4">{fmt(elapsed)}</p>
            <div className="w-56 h-56 mx-auto rounded-2xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
              {(qrCode || checkoutUrl) && (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode || checkoutUrl)}&size=224x224&margin=10`} alt="PayOS QR" className="w-full h-full object-contain" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Quét bằng app ngân hàng hoặc ví điện tử</p>
            <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-1.5 text-left">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Đơn hàng</span><span className="font-mono font-semibold text-gray-700">{orderId}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Số tiền</span><span className="font-bold text-[#EE4D2D]">{formatPrice(amount)}</span></div>
            </div>
            {checkoutUrl && (
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
                className="mt-4 block w-full py-3 rounded-xl bg-[#EE4D2D] text-white text-sm font-bold hover:bg-[#D73211] transition-colors text-center">
                Mở trang thanh toán
              </a>
            )}
            <p className="text-[10px] text-gray-300 mt-3">Tự động kiểm tra sau mỗi 5 giây</p>
          </div>
        )}

        {status === "paid" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-500" /></div>
            <p className="text-lg font-black text-gray-900">Thanh toán thành công!</p>
            <p className="text-sm text-gray-400 mt-1">Đơn hàng {orderId}</p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors">Đóng</button>
          </div>
        )}

        {status === "cancelled" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><X className="w-8 h-8 text-red-500" /></div>
            <p className="text-lg font-black text-gray-900">Thanh toán thất bại</p>
            <p className="text-sm text-gray-400 mt-1">Vui lòng thử lại</p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors">Đóng</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function CartSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, addItem, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Tiền mặt");
  const [payosData, setPayosData] = useState<{ orderId: string; orderCode: number; qrCode: string; checkoutUrl: string; amount: number } | null>(null);
  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const paymentMethods = [
    { value: "Tiền mặt", label: "Tiền mặt", icon: "💵" },
    { value: "Chuyển khoản", label: "Chuyển khoản", icon: "🏦" },
    { value: "Thẻ tín dụng", label: "Thẻ tín dụng", icon: "💳" },
    { value: "Ví điện tử", label: "Ví điện tử", icon: "📱" },
    { value: "PayOS - Online", label: "PayOS Online", icon: "🌐" },
  ];

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE}/api/Table`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => { setTables(data || []); if (data?.length) setSelectedTable(data[0].tableId); })
        .catch(() => {});
    }
  }, [open]);

  const handleCheckout = async () => {
    if (!user) { showToast("Vui lòng đăng nhập để thanh toán"); return; }
    if (!selectedTable) { showToast("Vui lòng chọn bàn"); return; }
    if (!selectedPayment) { showToast("Vui lòng chọn phương thức thanh toán"); return; }
    setCheckingOut(true);
    try {
      const orderRes = await fetch(`${API_BASE}/api/Order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          tableId: selectedTable,
          status: "Chưa làm",
          total: totalPrice,
          discount: 0,
          note: `Thanh toán: ${selectedPayment}`,
          paymentStatus: "Chưa thanh toán",
        }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      const orderId = order.orderId;

      for (const item of items) {
        await fetch(`${API_BASE}/api/OrderDetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            foodId: item.foodId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }),
        });
      }

      if (selectedPayment === "PayOS - Online") {
        try {
          const payRes = await fetch(`${API_BASE}/api/PayOS/create-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              buyerName: user.fullName || user.userName,
              buyerPhone: user.phone?.toString() || "",
              buyerEmail: user.email || "",
              returnUrl: window.location.origin,
              cancelUrl: window.location.origin,
            }),
          });
          if (payRes.ok) {
            const payData = await payRes.json();
            setPayosData({ orderId, orderCode: payData.orderCode, qrCode: payData.qrCode, checkoutUrl: payData.checkoutUrl, amount: payData.amount });
            clearCart();
            onClose();
            return;
          }
        } catch {}
      } else {
        try {
          await fetch(`${API_BASE}/api/Order/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              paymentStatus: "Đã thanh toán",
            }),
          });
        } catch {}
      }

      showToast(`Đặt hàng thành công! Mã: ${orderId} - ${tables.find(t => t.tableId === selectedTable)?.tableName}`);
      clearCart();
      onClose();
    } catch {
      showToast("Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Giỏ hàng</h2>
                <p className="text-xs text-gray-400">{totalItems} món</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Giỏ hàng trống</p>
                  <p className="text-gray-300 text-sm mt-1">Hãy thêm món ăn vào giỏ hàng</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.foodId} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                    <img src={item.foodImage} alt={item.foodName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.foodName}</p>
                      <p className="text-xs font-black text-[#EE4D2D] mt-0.5">{formatPrice(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeItem(item.foodId);
                            showToast(`Đã xóa ${item.foodName} khỏi giỏ hàng`);
                          } else {
                            updateQuantity(item.foodId, item.quantity - 1);
                          }
                        }}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <span className="text-sm font-bold text-gray-900 min-w-[22px] text-center">{item.quantity}</span>
                      <button onClick={() => addItem(item)} className="w-7 h-7 bg-[#EE4D2D] text-white rounded-lg flex items-center justify-center hover:bg-[#D73211] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 shrink-0">Chọn bàn</span>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#EE4D2D]/40 transition-all"
                  >
                    {tables.filter((t) => t.status === "Available").map((t) => (
                      <option key={t.tableId} value={t.tableId}>{t.tableName} ({t.numOfSeats || "?"} khách)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.value}
                        onClick={() => setSelectedPayment(pm.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                          selectedPayment === pm.value
                            ? "border-[#EE4D2D] bg-[#EE4D2D]/5 text-[#EE4D2D] shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-base">{pm.icon}</span>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tạm tính</span>
                  <span className="text-lg font-black text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-gradient-to-r from-[#EE4D2D] to-[#FF6633] text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-[#EE4D2D]/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {checkingOut ? "Đang xử lý..." : user ? "Thanh toán" : "Đăng nhập để thanh toán"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    {payosData && <PayOSModal open onClose={() => setPayosData(null)} {...payosData} />}
    </>
  );
}

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register, loading } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    if (!username || !password) { showToast("Vui lòng điền đầy đủ thông tin"); return; }
    let success: boolean;
    if (mode === "login") {
      success = await login(username, password);
      if (success) { showToast("Đăng nhập thành công"); onClose(); setUsername(""); setPassword(""); }
      else showToast("Sai tên đăng nhập hoặc mật khẩu");
    } else {
      if (!fullName) { showToast("Vui lòng nhập họ tên"); return; }
      if (!address) { showToast("Vui lòng nhập địa chỉ"); return; }
      success = await register(username, password, fullName, email, undefined, address);
      if (success) { showToast("Đăng ký thành công"); onClose(); setMode("login"); setUsername(""); setPassword(""); setFullName(""); setEmail(""); setAddress(""); }
      else showToast("Đăng ký thất bại, tên đăng nhập có thể đã tồn tại");
    }
  };

  if (!open) return null;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative" onClick={(e) => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#EE4D2D] to-[#FF6633] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#EE4D2D]/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login" ? "Đăng nhập để đặt món dễ dàng hơn" : "Tạo tài khoản mới"}
            </p>
          </div>

          <div className="space-y-3">
            {mode === "register" && (
              <input
                type="text" placeholder="Họ tên" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
              />
            )}
            <input
              type="text" placeholder="Tên đăng nhập" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
            />
            <input
              type="password" placeholder="Mật khẩu" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
            />
            {mode === "register" && (
              <input
                type="email" placeholder="Email (không bắt buộc)" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
              />
            )}
            {mode === "register" && (
              <input
                type="text" placeholder="Địa chỉ" value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
              />
            )}
            <button
              onClick={handleSubmit} disabled={loading}
              className="w-full bg-gradient-to-r from-[#EE4D2D] to-[#FF6633] text-white font-bold py-3 rounded-2xl hover:shadow-lg hover:shadow-[#EE4D2D]/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>

          <div className="mt-5 text-center">
            {mode === "login" ? (
              <p className="text-xs text-gray-400">
                Chưa có tài khoản?{" "}
                <button onClick={() => setMode("register")} className="text-[#EE4D2D] font-semibold hover:underline">Đăng ký</button>
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Đã có tài khoản?{" "}
                <button onClick={() => setMode("login")} className="text-[#EE4D2D] font-semibold hover:underline">Đăng nhập</button>
              </p>
            )}
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default function Header({ onSearch, foodItems = [], onSearchSelect }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    onSearch?.(value);
  };

  const handleSelect = (foodId: string, foodName: string) => {
    setSearchQuery(foodName);
    onSearch?.(foodName);
    onSearchSelect?.(foodId, foodName);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-lg shadow-black/5" : "bg-white"}`}>
        <div className="h-1 bg-gradient-to-r from-[#EE4D2D] via-[#FF6633] to-[#FF8C42] animate-gradient" />

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#EE4D2D] to-[#FF6633] rounded-2xl flex items-center justify-center shadow-lg shadow-[#EE4D2D]/25 group-hover:shadow-[#EE4D2D]/40 transition-all group-hover:scale-105">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-[#EE4D2D] leading-tight tracking-tight">RMS</h1>
                <p className="text-[10px] text-gray-400 -mt-0.5 font-medium">Quản Lý Nhà Hàng</p>
              </div>
            </Link>

            <div className="flex-1 max-w-xl relative">
              <motion.div
                className={`relative transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}
                animate={searchFocused ? { boxShadow: "0 8px 30px rgba(238,77,45,0.15)" } : { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" placeholder="Tìm kiếm nhà hàng hoặc món ăn..."
                  value={searchQuery} onChange={handleSearchChange}
                  onFocus={() => { setSearchFocused(true); setShowDropdown(true); }}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/80 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); onSearch?.(""); setShowDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
              {showDropdown && <SearchDropdown query={searchQuery} items={foodItems} onSelect={handleSelect} onClose={() => setShowDropdown(false)} />}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCartOpen(true)} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-gray-600 hover:text-[#EE4D2D] hover:bg-[#EE4D2D]/5 transition-all duration-300 relative group">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden lg:inline font-medium">Giỏ hàng</span>
                {totalItems > 0 && (
                  <motion.span key={totalItems} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#EE4D2D] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm"
                  >{totalItems}</motion.span>
                )}
              </button>

              {mounted && user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/profile" className="text-sm font-semibold text-gray-700 px-3 py-2 hover:text-[#EE4D2D] transition-colors">{user.fullName || user.userName}</Link>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-gray-100" title="Đăng xuất">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : mounted ? (
                <button onClick={() => setLoginOpen(true)} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-gray-600 hover:text-[#EE4D2D] hover:bg-[#EE4D2D]/5 transition-all duration-300">
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline font-medium">Đăng nhập</span>
                </button>
              ) : null}

              <button className="md:hidden p-2 text-gray-600 hover:text-[#EE4D2D] transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100/80">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1 -mb-px overflow-x-auto hide-scrollbar">
              {[
                { href: "/", label: "Trang chủ", icon: "🏠" },
                { href: "/menu", label: "Thực đơn", icon: "🍽️" },
                { href: "/orders", label: "Đơn hàng", icon: "📋" },
                { href: "/reservations", label: "Đặt bàn", icon: "📅" },
                ...(mounted && user?.role === "Admin" ? [{ href: "/table", label: "Bàn", icon: "🪑" }] : []),
                ...(mounted && (user?.role === "Admin" || user?.role === "Bep") ? [{ href: "/kitchen", label: "Bếp", icon: "👨‍🍳" }] : []),
                ...(mounted && user?.role === "Admin" ? [{ href: "/account", label: "Quản lý", icon: "⚙️" }] : []),
              ].map((nav) => {
                const isActive = pathname === nav.href || (nav.href !== "/" && pathname.startsWith(nav.href));
                return (
                  <Link key={nav.href} href={nav.href}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 ${
                      isActive ? "border-[#EE4D2D] text-[#EE4D2D]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm">{nav.icon}</span> {nav.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t bg-white overflow-hidden">
              <div className="px-4 py-3 space-y-1">
                {[
                  { href: "/", label: "Trang chủ", icon: "🏠" },
                  { href: "/menu", label: "Thực đơn", icon: "🍽️" },
                  { href: "/orders", label: "Đơn hàng", icon: "📋" },
                  { href: "/reservations", label: "Đặt bàn", icon: "📅" },
                  ...(mounted && user?.role === "Admin" ? [{ href: "/table", label: "Bàn", icon: "🪑" }] : []),
                  ...(mounted && (user?.role === "Admin" || user?.role === "Bep") ? [{ href: "/kitchen", label: "Bếp", icon: "👨‍🍳" }] : []),
                  ...(mounted && user?.role === "Admin" ? [{ href: "/account", label: "Quản lý", icon: "⚙️" }] : []),
                ].map((nav) => (
                  <Link key={nav.href} href={nav.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 text-sm py-3 px-3 rounded-xl transition-colors ${
                      pathname === nav.href || (nav.href !== "/" && pathname.startsWith(nav.href))
                        ? "bg-[#EE4D2D]/5 text-[#EE4D2D] font-semibold" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{nav.icon}</span> {nav.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <button onClick={() => { setCartOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 text-sm text-gray-600 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left">
                    <ShoppingCart className="w-4 h-4" /> Giỏ hàng
                    {totalItems > 0 && <span className="bg-[#EE4D2D] text-white text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto">{totalItems}</span>}
                  </button>
                  {mounted && user ? (
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 text-sm text-red-500 py-3 px-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  ) : mounted ? (
                    <button onClick={() => { setLoginOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 text-sm text-gray-600 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left">
                      <User className="w-4 h-4" /> Đăng nhập / Đăng ký
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}