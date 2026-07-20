"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Loader2, CheckCircle, Copy, Clock } from "lucide-react";

interface PayOSModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  qrCode: string;
  checkoutUrl: string;
  orderCode: number;
  amount: number;
  orderId: string;
  apiBase: string;
}

export default function PayOSModal({
  open,
  onClose,
  onSuccess,
  qrCode,
  checkoutUrl,
  orderCode,
  amount,
  orderId,
  apiBase,
}: PayOSModalProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "failed" | "cancelled">("pending");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll payment status
  useEffect(() => {
    if (!open || orderCode <= 0) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/PayOS/status/${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            setStatus("paid");
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setTimeout(() => onSuccess(orderId), 2000);
          } else if (data.status === "CANCELLED") {
            setStatus("cancelled");
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [open, orderCode, apiBase, orderId, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!open || status !== "pending") return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStatus("cancelled");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [open, status]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStatus("pending");
      setCountdown(300);
      setCopied(false);
    }
  }, [open]);

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open checkout URL
      window.open(checkoutUrl, "_blank");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={status === "pending" ? undefined : onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Thanh toán PayOS</h3>
            <p className="text-xs text-gray-400 mt-0.5">Quét mã QR để thanh toán</p>
          </div>
          {status !== "pending" && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          {status === "pending" && (
            <>
              {/* Amount */}
              <div className="text-center mb-4">
                <p className="text-xs text-gray-400 uppercase font-semibold">Số tiền thanh toán</p>
                <p className="text-2xl font-black text-[#EE4D2D] mt-1">
                  {new Intl.NumberFormat("vi-VN").format(amount)}₫
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-inner">
                  <img
                    src={qrCode}
                    alt="PayOS QR Code"
                    className="w-52 h-52 object-contain"
                    onError={(e) => {
                      // If QR code image fails, try showing checkout URL as QR
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(checkoutUrl)}`;
                    }}
                  />
                </div>
              </div>

              {/* Copy QR data */}
              <button
                onClick={handleCopyQR}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all mb-4"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Đã sao chép!" : "Sao chép mã QR"}
              </button>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-gray-500">Hết hạn sau </span>
                <span className={`font-mono font-bold ${countdown < 60 ? "text-red-500" : "text-gray-900"}`}>
                  {formatTime(countdown)}
                </span>
              </div>

              {/* Open in new tab */}
              <button
                onClick={() => window.open(checkoutUrl, "_blank")}
                className="w-full mt-4 py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm hover:bg-[#D64018] transition-all"
              >
                Mở trang thanh toán
              </button>
            </>
          )}

          {status === "paid" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Thanh toán thành công!</h4>
              <p className="text-sm text-gray-500">Đơn hàng đang được xử lý...</p>
            </div>
          )}

          {status === "cancelled" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Thanh toán thất bại</h4>
              <p className="text-sm text-gray-500 mb-4">Giao dịch đã hết hạn hoặc bị hủy</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all"
              >
                Đóng
              </button>
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {status === "pending" && (
          <div className="px-5 pb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Đang chờ xác nhận thanh toán...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
