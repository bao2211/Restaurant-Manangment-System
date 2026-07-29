"use client";

<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
=======
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
>>>>>>> origin/my-local-branch
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, CreditCard, Truck, CheckCircle, Loader2, Navigation, X, Package } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";

interface GeoResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  lat: number;
  lon: number;
}

<<<<<<< HEAD
interface ExistingOrderDetail {
  foodId: string;
  foodName: string;
  foodImage?: string;
  quantity: number;
  unitPrice: number;
  status?: string;
}

interface ExistingOrder {
  orderId: string;
  orderDetails: ExistingOrderDetail[];
  tableName?: string;
  userName?: string;
  total: number;
  note?: string;
  deliveryStatus?: string;
  ghtkTrackingId?: string;
  shippingAddress?: string;
  shippingFee?: number;
}

=======
>>>>>>> origin/my-local-branch
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

const paymentMethods = [
  { value: "Tiền mặt", label: "Tiền mặt", icon: "💵", desc: "Thanh toán khi nhận hàng" },
  { value: "Chuyển khoản", label: "Chuyển khoản", icon: "🏦", desc: "Chuyển khoản ngân hàng" },
<<<<<<< HEAD
  { value: "Thẻ tín dụng", label: "Thẻ tính dụng", icon: "💳", desc: "Visa / Mastercard" },
  { value: "Ví điện tử", label: "Ví điện tử", icon: "📱", desc: "MoMo / ZaloPay" },
  { value: "PayOS - Online", label: "🧪 PayOS Online (Test Mode)", icon: "✅", desc: "Thanh toán test - Click nút xanh bên dưới để xác nhận" },
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
        </div>
        <Footer />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const { user } = useAuth();
  const { items, totalPrice, clearCart, addItem, clearCart: clearCartFn } = useCart();
=======
  { value: "Thẻ tín dụng", label: "Thẻ tín dụng", icon: "💳", desc: "Visa / Mastercard" },
  { value: "Ví điện tử", label: "Ví điện tử", icon: "📱", desc: "MoMo / ZaloPay" },
  { value: "PayOS - Online", label: "PayOS Online", icon: "🌐", desc: "Thanh toán qua PayOS" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
>>>>>>> origin/my-local-branch
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
<<<<<<< HEAD
  const [loadingExistingOrder, setLoadingExistingOrder] = useState(false);
  const [isExistingOrder, setIsExistingOrder] = useState(false);
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null);
=======
>>>>>>> origin/my-local-branch
  const [selectedPayment, setSelectedPayment] = useState("Tiền mặt");
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    lat: 0,
    lon: 0,
  });
  const [tables, setTables] = useState<{ tableId: string; tableName: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [isDelivery, setIsDelivery] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
<<<<<<< HEAD
  
  // Store orderCode for PayOS verification
  const currentOrderCodeRef = useRef<number | null>(null);
  const currentOrderIdRef = useRef<string | null>(null);
=======
>>>>>>> origin/my-local-branch
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

<<<<<<< HEAD
  // Check for payment verification when returning from PayOS
  const verifyPayment = searchParams.get("verifyPayment");
  
  useEffect(() => {
    if (verifyPayment !== "true") return;
    
    const verifyAndRedirect = async () => {
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      const pendingOrderCode = sessionStorage.getItem('pendingOrderCode');
      
      if (!pendingOrderId) {
        showToast("Không tìm thấy thông tin đơn hàng");
        return;
      }
      
      try {
        // Auto-confirm payment since user returned from PayOS
        // This updates the order status to "Đã thanh toán"
        const res = await fetch(`${API_BASE}/api/PayOS/confirm-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: pendingOrderId,
            orderCode: pendingOrderCode ? parseInt(pendingOrderCode) : null,
          }),
        });
        
        // Clear stored data regardless of result
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('pendingOrderCode');
        
        if (res.ok) {
          clearCart();
          showToast("Thanh toán thành công!");
          router.push(`/tracking/${pendingOrderId}`);
        } else {
          // Even if confirm fails, check current order status
          const orderRes = await fetch(`${API_BASE}/api/Order/${pendingOrderId}`);
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            const paymentStatus = (orderData.paymentStatus || "").toLowerCase();
            if (paymentStatus === "đã thanh toán" || paymentStatus === "paid") {
              clearCart();
              showToast("Thanh toán thành công!");
              router.push(`/tracking/${pendingOrderId}`);
            } else {
              showToast("Vui lòng đợi xác nhận thanh toán");
            }
          }
        }
      } catch (e) {
        console.error("Payment confirmation failed:", e);
        showToast("Đã xảy ra lỗi, vui lòng kiểm tra lại đơn hàng");
      }
    };
    
    verifyAndRedirect();
  }, [verifyPayment, router, clearCart, showToast]);

  // Load existing order when orderId is in URL (for payment continuation)
  useEffect(() => {
    if (!orderIdFromUrl) return;
    
    const loadExistingOrder = async () => {
      setLoadingExistingOrder(true);
      try {
        const res = await fetch(`${API_BASE}/api/Order/${orderIdFromUrl}`);
        if (!res.ok) throw new Error("Failed to load order");
        const orderData: ExistingOrder = await res.json();
        
        // Clear cart and load order items
        clearCartFn();
        if (orderData.orderDetails && orderData.orderDetails.length > 0) {
          orderData.orderDetails.forEach((detail) => {
            // Add item multiple times based on quantity (addItem handles quantity internally)
            for (let i = 0; i < detail.quantity; i++) {
              addItem({
                foodId: detail.foodId,
                foodName: detail.foodName,
                foodImage: detail.foodImage || "",
                unitPrice: detail.unitPrice,
                categoryName: "",
              });
            }
          });
        }
        
        setIsExistingOrder(true);
        setExistingOrderId(orderData.orderId);
        
        // Pre-fill address if delivery order
        if (orderData.deliveryStatus && orderData.shippingAddress) {
          setIsDelivery(true);
          // Try to parse shipping address
          const addressParts = orderData.shippingAddress.split(",");
          setAddress((prev) => ({
            ...prev,
            fullName: orderData.userName || user?.fullName || "",
          }));
        }
      } catch (err) {
        showToast("Không thể tải đơn hàng");
        console.error("Failed to load existing order:", err);
      } finally {
        setLoadingExistingOrder(false);
      }
    };
    
    loadExistingOrder();
  }, [orderIdFromUrl, clearCartFn, addItem, user, showToast]);

=======
>>>>>>> origin/my-local-branch
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({ ...prev, fullName: user.fullName || user.userName, phone: user.phone?.toString() || "" }));
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE}/api/Table`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setTables(data || []); if (data?.length) setSelectedTable(data[0].tableId); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    const timer = setTimeout(() => {
      if (!mapRef.current || leafletMap.current) return;
      import("leaflet").then((L) => {
        const map = L.map(mapRef.current!, { zoomControl: false }).setView([10.79798, 106.63956], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        leafletMap.current = map;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [mounted]);

  const updateMapPosition = useCallback((lat: number, lon: number) => {
    if (!leafletMap.current) return;
    import("leaflet").then((L) => {
      leafletMap.current!.setView([lat, lon], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(leafletMap.current!);
      }
    });
  }, []);

  const drawRoute = useCallback(async (destLat: number, destLon: number) => {
    if (!leafletMap.current) return;
    const restaurantLat = 10.79798;
    const restaurantLon = 106.63956;
    try {
      const res = await fetch(`/api/osm/route?lon1=${restaurantLon}&lat1=${restaurantLat}&lon2=${destLon}&lat2=${destLat}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.routes?.[0]?.geometry?.coordinates) {
        const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
        const distance = data.routes[0].distance;
        const duration = data.routes[0].duration;
        import("leaflet").then((L) => {
          if (routeLayerRef.current) leafletMap.current!.removeLayer(routeLayerRef.current);
          routeLayerRef.current = L.polyline(coords, { color: "#EE4D2D", weight: 4, opacity: 0.8 }).addTo(leafletMap.current!);
          const bounds = L.latLngBounds(coords);
          leafletMap.current!.fitBounds(bounds, { padding: [50, 50] });
          const infoDiv = document.getElementById("route-info");
          if (infoDiv) {
            const km = (distance / 1000).toFixed(1);
            const mins = Math.round(duration / 60);
            infoDiv.innerHTML = `<span class="text-sm font-semibold text-[#EE4D2D]">🚚 ${km} km · ~${mins} phút</span>`;
          }
        });
      }
    } catch {}
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/osm/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setSearchResults(await res.json());
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => handleSearch(searchQuery), 250);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, handleSearch]);

  const normalizeGhtkName = (name: string): string => {
    return name
      .replace(/Thành\s+phố\s+/gi, "")
      .replace(/Tỉnh\s+/gi, "")
      .replace(/Thành\s+phố\s+Thủ\s+Đức/gi, "Thủ Đức")
      .replace(/TP\.\s*/g, "")
      .trim();
  };

  const parseAddressFromDisplayName = (displayName: string) => {
    const parts = displayName.split(",").map((s) => s.trim());
    let province = "";
    let district = "";
    let ward = "";
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (lower.startsWith("quận") || lower.startsWith("huyện") || lower.startsWith("thị xã")) {
        district = part;
      } else if (lower.startsWith("phường") || lower.startsWith("xã") || lower.startsWith("thị trấn")) {
        ward = part;
      }
    }
    const fullLower = displayName.toLowerCase();
    if (fullLower.includes("hồ chí minh")) province = "Hồ Chí Minh";
    else if (fullLower.includes("hà nội")) province = "Hà Nội";
    else if (fullLower.includes("đà nẵng")) province = "Đà Nẵng";
    else if (fullLower.includes("hải phòng")) province = "Hải Phòng";
    else if (fullLower.includes("cần thơ")) province = "Cần Thơ";
    return { province, district, ward };
  };

  const calculateShippingFee = useCallback(async (province: string, district: string, ward: string, addressText: string) => {
    setShippingLoading(true);
    setShippingError("");
    setShippingFee(null);
    try {
      const normalizedProvince = normalizeGhtkName(province);
      const normalizedDistrict = normalizeGhtkName(district);
      const normalizedWard = normalizeGhtkName(ward);
      const params = new URLSearchParams({
        pick_province: "Hồ Chí Minh",
        pick_district: "Tân Bình",
        province: normalizedProvince,
        district: normalizedDistrict || "Quận 1",
        ward: normalizedWard,
        address: addressText || "",
        weight: "500",
        value: String(totalPrice || 100000),
      });
      const res = await fetch(`/api/ghtk/fee?${params}`);
      const data = await res.json();
      if (res.ok && data.success && data.fee) {
        setShippingFee(data.fee.fee || 0);
        if (!data.fee.delivery) {
          setShippingError("GHTK chưa hỗ trợ giao đến khu vực này");
        }
      } else {
        setShippingError(data.message || "Không tính được phí ship");
      }
    } catch {
      setShippingError("Không thể kết nối dịch vụ vận chuyển");
    } finally {
      setShippingLoading(false);
    }
  }, [totalPrice]);

  const selectLocation = (r: GeoResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    const parsed = parseAddressFromDisplayName(r.display_name);
    const shortAddress = r.display_name.split(",").slice(0, 2).join(",").trim();
    setAddress({
      ...address,
      address: shortAddress,
      province: parsed.province,
      district: parsed.district,
      ward: parsed.ward,
      lat,
      lon,
    });
    setSearchQuery(shortAddress);
    setSearchResults([]);
    updateMapPosition(lat, lon);
    drawRoute(lat, lon);
    calculateShippingFee(parsed.province, parsed.district, parsed.ward, shortAddress);
  };

<<<<<<< HEAD
  // Handle payment for existing unpaid order
  const handlePayExistingOrder = async () => {
    if (!user || !existingOrderId) { showToast("Không tìm thấy đơn hàng"); return; }
    setPlacing(true);
    try {
      if (selectedPayment === "PayOS - Online") {
        const payRes = await fetch(`${API_BASE}/api/PayOS/create-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: existingOrderId,
            buyerName: address.fullName || user.userName,
            buyerPhone: address.phone || "",
            buyerEmail: user.email || "",
            returnUrl: window.location.origin,
            cancelUrl: window.location.origin,
          }),
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          if (payData.checkoutUrl) {
            // Redirect directly to PayOS checkout page
            window.location.href = payData.checkoutUrl;
            return;
          }
        }
      } else {
        // For non-online payment methods, update order status
        const updateRes = await fetch(`${API_BASE}/api/Order/${existingOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "Đã thanh toán",
            note: `Thanh toán: ${selectedPayment}`,
          }),
        });
        if (updateRes.ok) {
          clearCart();
          showToast("Thanh toán thành công!");
          router.push(`/tracking/${existingOrderId}`);
          return;
        }
      }
      showToast("Thanh toán thất bại, vui lòng thử lại");
    } catch {
      showToast("Thanh toán thất bại, vui lòng thử lại");
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isExistingOrder) {
      await handlePayExistingOrder();
      return;
    }
    
=======
  const handlePlaceOrder = async () => {
>>>>>>> origin/my-local-branch
    if (!user) { showToast("Vui lòng đăng nhập"); return; }
    if (!isDelivery && !selectedTable) { showToast("Vui lòng chọn bàn"); return; }
    if (isDelivery && !address.address) { showToast("Vui lòng chọn địa chỉ giao hàng"); return; }
    setPlacing(true);
    try {
      const noteParts = [`Thanh toán: ${selectedPayment}`];
      if (isDelivery) {
        noteParts.push(`Giao đến: ${searchQuery || address.address}`);
        noteParts.push(`${address.fullName} ${address.phone}`);
      } else {
        noteParts.push(`Bàn: ${selectedTable}`);
      }
      const orderRes = await fetch(`${API_BASE}/api/Order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          tableId: isDelivery ? "GIAO_HANG" : selectedTable,
          status: "Chưa làm",
          total: totalPrice + (isDelivery && shippingFee ? shippingFee : 0),
          discount: 0,
          note: noteParts.join(" | "),
          paymentStatus: selectedPayment === "PayOS - Online" ? "Chưa thanh toán" : "Đã thanh toán",
          orderType: isDelivery ? "delivery" : "dine-in",
          deliveryAddress: isDelivery ? (searchQuery || address.address) : null,
          deliveryPhone: isDelivery ? address.phone : null,
          deliveryFee: isDelivery ? (shippingFee || 0) : 0,
        }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      const orderId = order.orderId;

      for (const item of items) {
        await fetch(`${API_BASE}/api/OrderDetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, foodId: item.foodId, quantity: item.quantity, unitPrice: item.unitPrice }),
        });
      }

      if (selectedPayment === "PayOS - Online") {
        const payRes = await fetch(`${API_BASE}/api/PayOS/create-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            buyerName: address.fullName || user.userName,
            buyerPhone: address.phone || "",
            buyerEmail: user.email || "",
<<<<<<< HEAD
            returnUrl: `${window.location.origin}/checkout?verifyPayment=true&testMode=1`,
=======
            returnUrl: window.location.origin,
>>>>>>> origin/my-local-branch
            cancelUrl: window.location.origin,
          }),
        });
        if (payRes.ok) {
          const payData = await payRes.json();
<<<<<<< HEAD
          if (payData.orderCode) {
            // Save order info for test payment
            sessionStorage.setItem('pendingOrderId', orderId);
            sessionStorage.setItem('pendingOrderCode', payData.orderCode.toString());
            // Redirect to local test payment page instead of PayOS
            router.push(`/payos-test?orderId=${orderId}&orderCode=${payData.orderCode}`);
=======
          if (payData.checkoutUrl) {
            clearCart();
            window.location.href = payData.checkoutUrl;
>>>>>>> origin/my-local-branch
            return;
          }
        }
      }

      clearCart();
      showToast("Đặt hàng thành công!");
      router.push(`/tracking/${orderId}`);
    } catch {
      showToast("Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setPlacing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
<<<<<<< HEAD
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
        </div>
=======
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" /></div>
>>>>>>> origin/my-local-branch
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-black text-white">Thanh toán</h1>
          <p className="text-white/70 mt-1 text-sm">Hoàn tất đơn hàng của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-[#EE4D2D] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-[#EE4D2D]" : "bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>

              <div className="flex gap-3 mb-4">
                <button onClick={() => { setIsDelivery(true); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isDelivery ? "bg-[#EE4D2D] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                  <Truck className="w-4 h-4 inline mr-2" />Giao tận nơi
                </button>
                <button onClick={() => { setIsDelivery(false); setShippingFee(null); setShippingError(""); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isDelivery ? "bg-[#EE4D2D] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                  <Package className="w-4 h-4 inline mr-2" />Tự đến lấy
                </button>
              </div>

              {isDelivery ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Họ tên" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40" />
                    <input type="text" placeholder="Số điện thoại" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40" />
                  </div>

                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Tìm địa chỉ giao hàng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40" />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                    {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" onClick={() => { setSearchQuery(""); setSearchResults([]); }} />
                    )}

                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto" style={{ zIndex: 9999 }}>
                        {searchResults.map((r, i) => (
                          <button key={i} onClick={() => selectLocation(r)} className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 text-sm transition-colors">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-[#EE4D2D] mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-gray-900 font-medium block truncate">{r.display_name.split(",").slice(0, 3).join(", ")}</span>
                                {r.display_name.split(",").length > 3 && (
                                  <span className="text-gray-400 text-xs block truncate">{r.display_name.split(",").slice(3).join(", ")}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="checkout-map-wrapper mb-3">
                    <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden border border-gray-200" />
                  </div>
                  <div id="route-info" className="text-center text-xs text-gray-400 mb-4" />
                </>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn bàn</label>
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40">
                    {tables.map((t) => <option key={t.tableId} value={t.tableId}>{t.tableName || t.tableId}</option>)}
                  </select>
                </div>
              )}

              <button onClick={() => setStep(2)} disabled={isDelivery ? !address.address : !selectedTable}
                className="w-full py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm hover:bg-[#D64018] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                Tiếp tục
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3 mb-6">
                {paymentMethods.map((pm) => (
                  <button key={pm.value} onClick={() => setSelectedPayment(pm.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedPayment === pm.value ? "border-[#EE4D2D] bg-[#EE4D2D]/5" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 text-sm">{pm.label}</div>
                      <div className="text-xs text-gray-400">{pm.desc}</div>
                    </div>
                    {selectedPayment === pm.value && <CheckCircle className="w-5 h-5 text-[#EE4D2D]" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                  Quay lại
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm hover:bg-[#D64018] transition-all">
                  Tiếp tục
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Xác nhận đơn hàng</h2>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Địa chỉ</p>
                {isDelivery ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#EE4D2D] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{address.fullName} · {address.phone}</p>
                      <p className="text-xs text-gray-500">{searchQuery || address.address}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">Tự đến lấy tại quán</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Thanh toán</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{paymentMethods.find((p) => p.value === selectedPayment)?.icon}</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedPayment}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Món đã chọn ({items.length})</p>
                {items.map((item) => (
<<<<<<< HEAD
                  <div key={item.foodId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    {/* Food Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.foodImage ? (
                        <img 
                          src={item.foodImage} 
                          alt={item.foodName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Food';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          🍽️
                        </div>
                      )}
                    </div>
                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.foodName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{new Intl.NumberFormat("vi-VN").format(item.unitPrice)}₫</span>
                      </div>
                    </div>
                    {/* Total Price */}
                    <span className="text-sm font-bold text-gray-900 shrink-0">{new Intl.NumberFormat("vi-VN").format(item.unitPrice * item.quantity)}₫</span>
=======
                  <div key={item.foodId} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-[#EE4D2D] w-5 h-5 rounded flex items-center justify-center">{item.quantity}</span>
                      <span className="text-sm text-gray-700">{item.foodName}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{new Intl.NumberFormat("vi-VN").format(item.unitPrice * item.quantity)}₫</span>
>>>>>>> origin/my-local-branch
                  </div>
                ))}
                {isDelivery && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Phí giao hàng (GHTK)</span>
                    </div>
                    {shippingLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : shippingFee !== null ? (
                      <span className="text-sm font-semibold text-gray-900">{new Intl.NumberFormat("vi-VN").format(shippingFee)}₫</span>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa tính</span>
                    )}
                  </div>
                )}
                {shippingError && isDelivery && (
                  <p className="text-xs text-amber-600 mt-2">{shippingError}</p>
                )}
                <div className="flex justify-between pt-3 mt-1 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-black text-lg text-[#EE4D2D]">{new Intl.NumberFormat("vi-VN").format(totalPrice + (isDelivery && shippingFee ? shippingFee : 0))}₫</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                  Quay lại
                </button>
                <button onClick={handlePlaceOrder} disabled={placing}
                  className="flex-1 py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm hover:bg-[#D64018] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : <>Đặt hàng</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
