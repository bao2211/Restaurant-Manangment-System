"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CreditCard, CheckCircle, XCircle, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/contexts/toast-context";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function PayOSTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PayOSTestContent />
    </Suspense>
  );
}

function PayOSTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!orderId) {
      showToast("Không tìm thấy mã đơn hàng");
      router.push("/");
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Order/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [orderId, router, showToast]);

  const handleConfirmPayment = async () => {
    if (!orderCode) return;

    setIsProcessing(true);
    try {
      // Call simulate-payment endpoint
      const res = await fetch(`${API_BASE}/api/PayOS/simulate-payment/${orderCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Also call confirm-payment to update order status
        await fetch(`${API_BASE}/api/PayOS/confirm-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            orderCode: orderCode ? parseInt(orderCode) : null,
          }),
        });

        setIsSuccess(true);
        showToast("Thanh toán thành công!");
        
        // Clear session storage
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('pendingOrderCode');

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/tracking/${orderId}`);
        }, 2000);
      } else {
        throw new Error("Payment simulation failed");
      }
    } catch (e) {
      console.error("Payment error:", e);
      showToast("Thanh toán thất bại, vui lòng thử lại");
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelled(true);
    showToast("Đã hủy thanh toán");
    
    // Clear session storage
    sessionStorage.removeItem('pendingOrderId');
    sessionStorage.removeItem('pendingOrderCode');
    
    // Redirect to orders page
    setTimeout(() => {
      router.push("/orders");
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-500 mb-6">Đơn hàng của bạn đã được thanh toán. Đang chuyển hướng...</p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã hủy thanh toán</h2>
          <p className="text-gray-500">Đang chuyển hướng đến trang đơn hàng...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#EE4D2D] px-6 py-4 flex items-center gap-3">
          <Shield className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">PayOS Test Mode</h1>
            <p className="text-white/70 text-xs">Môi trường thanh toán thử nghiệm</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Mã đơn hàng</span>
            <span className="text-sm font-mono font-semibold text-gray-900">{orderCode || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Số tiền thanh toán</span>
            <span className="text-xl font-bold text-[#EE4D2D]">
              {orderDetails ? new Intl.NumberFormat("vi-VN").format(orderDetails.total) + "₫" : "Đang tải..."}
            </span>
          </div>
        </div>

        {/* Test Info Banner */}
        <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Thanh toán thử nghiệm</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Đây là chế độ thử nghiệm. Không có giao dịch thực nào được thực hiện.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Display */}
        <div className="px-6 py-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Phương thức thanh toán</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Thẻ ATM / Internet Banking</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <span className="text-lg">📱</span>
              <span className="text-sm text-gray-600">Ví MoMo</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <span className="text-lg">🏦</span>
              <span className="text-sm text-gray-600">Chuyển khoản</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing || loadingOrder}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Xác nhận thanh toán thành công
              </>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Hủy thanh toán
          </button>

          <button
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            © 2024 PayOS Test Environment
          </p>
        </div>
      </motion.div>
    </div>
  );
}
