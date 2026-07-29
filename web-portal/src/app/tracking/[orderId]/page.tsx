"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

interface TrackingEvent {
  status: string;
  time: string;
  location?: string;
}

interface OrderDetail {
  orderId: string;
  userId: string;
  userName?: string;
  tableId: string;
  tableName?: string;
  status: string;
  total: number;
  paymentStatus: string;
  deliveryStatus?: string;
  ghtkTrackingId?: string;
  note?: string;
  orderDetails?: { orderDetailId: string; foodId: string; quantity: number; unitPrice: number; foodName?: string; foodImage?: string; status?: string }[];
}

const statusSteps = [
  { key: "Chưa làm", label: "Đã nhận đơn", icon: Clock },
  { key: "Đang làm", label: "Đang chế biến", icon: Package },
  { key: "Hoàn tất", label: "Hoàn tất", icon: CheckCircle },
  { key: "delivering", label: "Đang giao", icon: Truck },
  { key: "delivered", label: "Đã giao", icon: MapPin },
];

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Order/${orderId}`);
        if (res.ok) setOrder(await res.json());
      } catch {}
      setLoading(false);
    };
    fetchOrder();
    // Poll for real-time status updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/ghtk/track/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.events) setTrackingEvents(data.events);
        }
      } catch {}
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!mounted || !mapRef.current || leafletMap.current) return;
    const timer = setTimeout(() => {
      if (!mapRef.current || leafletMap.current) return;
      import("leaflet").then((L) => {
        const map = L.map(mapRef.current!, { zoomControl: false }).setView([10.79798, 106.63956], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        leafletMap.current = map;

        L.marker([10.79798, 106.63956]).addTo(map).bindPopup("🏠 Quán ăn");
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" /></div>
        <Footer />
      </div>
    );
  }

  // Determine current step based on order details and deliveryStatus
  const currentStepIndex = (() => {
    if (!order) return -1;
    
    // Check delivery status first
    if (order.deliveryStatus === "delivered") return 4; // Đã giao
    if (order.deliveryStatus === "delivering") return 3; // Đang giao
    
    // Check order details completion status
    const orderDetails = order.orderDetails || [];
    if (orderDetails.length === 0) {
      return statusSteps.findIndex((s) => s.key === order.status);
    }
    
    const completedItems = orderDetails.filter(
      (item) => (item.status || "").trim() === "Hoàn tất"
    ).length;
    const totalItems = orderDetails.length;
    
    if (completedItems === totalItems) {
      // All items complete → Hoàn tất (step 2)
      return 2;
    } else if (completedItems > 0) {
      // Some items complete → Đang chế biến (step 1)
      return 1;
    } else {
      // No items complete → use order.status
      const stepIndex = statusSteps.findIndex((s) => s.key === order.status);
      return stepIndex >= 0 ? stepIndex : 0;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-white">Theo dõi đơn hàng</h1>
          <p className="text-white/70 mt-1 text-sm">Mã đơn: {orderId}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1">
        {order && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Trạng thái</p>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-[#EE4D2D] text-white" : "bg-gray-100 text-gray-400"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? "text-[#EE4D2D]" : "text-gray-400"}`}>{step.label}</span>
                      </div>
                      {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? "bg-[#EE4D2D]" : "bg-gray-200"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Thông tin</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Mã đơn hàng</span><span className="font-bold text-gray-900 font-mono">{orderId}</span></div>
                {order.ghtkTrackingId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã vận chuyển</span>
                    <span className="font-bold text-blue-600 font-mono">{order.ghtkTrackingId}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-gray-500">Tổng cộng</span><span className="font-bold text-[#EE4D2D]">{new Intl.NumberFormat("vi-VN").format(order.total)}₫</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Thanh toán</span><span className={`font-semibold ${order.paymentStatus === "Đã thanh toán" ? "text-green-600" : "text-amber-600"}`}>{order.paymentStatus || "Chưa thanh toán"}</span></div>
                {order.note && <div className="flex justify-between"><span className="text-gray-500">Ghi chú</span><span className="text-gray-700 text-right max-w-[60%]">{order.note}</span></div>}
              </div>
            </div>

            {/* Order Items */}
            {order.orderDetails && order.orderDetails.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Món đã đặt</p>
                <div className="space-y-3">
                  {order.orderDetails.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                      {/* Food Image */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {item.foodImage ? (
                          <img 
                            src={item.foodImage}
                            alt={item.foodName || "Food"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-2xl">🍽️</span>';
                                parent.className += ' flex items-center justify-center';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>
                      {/* Food Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{item.foodName || `Món ${item.foodId}`}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{new Intl.NumberFormat("vi-VN").format(item.unitPrice || 0)}₫</span>
                        </div>
                      </div>
                      {/* Status */}
                      <div className="flex items-center gap-2 shrink-0">
                        {(item.status || "").trim() === "Hoàn tất" ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                            <CheckCircle className="w-4 h-4" /> Hoàn tất
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-orange-500">
                            <Clock className="w-4 h-4" /> Đang làm
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Bản đồ</p>
              <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden border border-gray-200" />
            </div>

            {trackingEvents.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Lịch sử vận chuyển</p>
                <div className="space-y-3">
                  {trackingEvents.map((evt, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${i === 0 ? "bg-[#EE4D2D]" : "bg-gray-300"}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{evt.status}</p>
                        <p className="text-xs text-gray-400">{evt.time}{evt.location ? ` · ${evt.location}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!order && !loading && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Không tìm thấy đơn hàng</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
