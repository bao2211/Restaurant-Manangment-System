"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Eye, Loader2, Search, Filter, Trash2, Printer } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface Bill {
  billId: string;
  orderId: string;
  userId: string;
  userName: string;
  total: number;
  discount: number;
  totalFinal: number;
  payment: string;
  createdTime: string;
}

interface BillDetail {
  billId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  foodName?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function AdminBillsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billDetails, setBillDetails] = useState<BillDetail[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Bill`);
      if (res.ok) setBills(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { (async () => { await fetchBills(); })(); }, []);

  const fetchBillDetail = async (billId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE}/api/BillDetail/bill/${billId}`);
      if (res.ok) setBillDetails(await res.json());
    } catch {}
    finally { setLoadingDetail(false); }
  };

  const handleViewBill = async (bill: Bill) => {
    setSelectedBill(bill);
    await fetchBillDetail(bill.billId);
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm("Bạn có chắc muốn xóa hóa đơn này?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/Bill/${billId}`, { method: "DELETE" });
      if (res.ok) {
        setBills(bills.filter((b) => b.billId !== billId));
        showToast("Xóa hóa đơn thành công");
        if (selectedBill?.billId === billId) setSelectedBill(null);
      } else {
        showToast("Không thể xóa hóa đơn");
      }
    } catch {
      showToast("Lỗi khi xóa hóa đơn");
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchSearch = !searchQuery ||
      bill.billId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPayment = filterPayment === "all" || bill.payment === filterPayment;
    return matchSearch && matchPayment;
  });

  const totalRevenue = filteredBills.reduce((sum, b) => sum + (b.totalFinal || b.total || 0), 0);
  const paymentMethods = [...new Set(bills.map((b) => b.payment).filter(Boolean))];

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Receipt className="w-8 h-8" /> Quản lý hóa đơn
          </h1>
          <p className="text-white/70 mt-1 text-sm">Xem và quản lý tất cả hóa đơn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Tổng hóa đơn</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{filteredBills.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Tổng doanh thu</p>
            <p className="text-2xl font-black text-[#EE4D2D] mt-1">{new Intl.NumberFormat("vi-VN").format(totalRevenue)}₫</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2 md:col-span-1">
            <p className="text-xs font-semibold text-gray-400 uppercase">Phương thức TT</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{paymentMethods.length} loại</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã hóa đơn, mã đơn, tên KH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#EE4D2D]/40 appearance-none"
            >
              <option value="all">Tất cả</option>
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bills Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20">
            <Receipt className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">Không tìm thấy hóa đơn nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Mã HĐ</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Mã đơn hàng</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Khách hàng</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Tổng tiền</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Thanh toán</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Ngày tạo</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.billId} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-gray-900">{bill.billId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{bill.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{bill.userName || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-[#EE4D2D]">
                          {new Intl.NumberFormat("vi-VN").format(bill.totalFinal || bill.total || 0)}₫
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                          bill.payment?.includes("PayOS") ? "bg-blue-100 text-blue-700" :
                          bill.payment?.includes("Chuyển khoản") ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {bill.payment || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {bill.createdTime ? new Date(bill.createdTime).toLocaleDateString("vi-VN") : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleViewBill(bill)} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDeleteBill(bill.billId)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filteredBills.map((bill) => (
                <div key={bill.billId} className="p-4 hover:bg-orange-50/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900 font-mono">{bill.billId}</p>
                      <p className="text-xs text-gray-500">{bill.orderId}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                      bill.payment?.includes("PayOS") ? "bg-blue-100 text-blue-700" :
                      bill.payment?.includes("Chuyển khoản") ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {bill.payment || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{bill.userName || "N/A"}</p>
                      <p className="text-xs text-gray-400">{bill.createdTime ? new Date(bill.createdTime).toLocaleDateString("vi-VN") : "N/A"}</p>
                    </div>
                    <p className="text-sm font-bold text-[#EE4D2D]">{new Intl.NumberFormat("vi-VN").format(bill.totalFinal || bill.total || 0)}₫</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleViewBill(bill)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                      <Eye className="w-3 h-3" /> Chi tiết
                    </button>
                    <button onClick={() => handleDeleteBill(bill.billId)} className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBill(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Chi tiết hóa đơn</h3>
              <button onClick={() => setSelectedBill(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <span className="text-gray-400 text-lg">×</span>
              </button>
            </div>
            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Mã HĐ</p>
                  <p className="text-sm font-bold font-mono text-gray-900">{selectedBill.billId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Đơn hàng</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedBill.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Khách hàng</p>
                  <p className="text-sm text-gray-700">{selectedBill.userName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Thanh toán</p>
                  <p className="text-sm text-gray-700">{selectedBill.payment || "N/A"}</p>
                </div>
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-[#EE4D2D]" />
                </div>
              ) : billDetails.length > 0 ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Chi tiết món</p>
                  <div className="space-y-2">
                    {billDetails.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="text-xs font-bold text-white bg-[#EE4D2D] w-5 h-5 rounded inline-flex items-center justify-center mr-2">
                            {detail.quantity}
                          </span>
                          <span className="text-sm text-gray-700">{detail.foodName || detail.orderId}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(detail.unitPrice * detail.quantity)}₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="text-gray-700">{new Intl.NumberFormat("vi-VN").format(selectedBill.total || 0)}₫</span>
                </div>
                {selectedBill.discount ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm giá</span>
                    <span className="text-green-600">-{new Intl.NumberFormat("vi-VN").format(selectedBill.discount)}₫</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-[#EE4D2D]">{new Intl.NumberFormat("vi-VN").format(selectedBill.totalFinal || selectedBill.total || 0)}₫</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Ngày tạo: {selectedBill.createdTime ? new Date(selectedBill.createdTime).toLocaleString("vi-VN") : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
