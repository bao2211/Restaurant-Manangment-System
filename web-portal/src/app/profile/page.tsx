"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, ArrowLeft } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone?.toString() || "");
      setAddress(user.address || "");
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Vui lòng đăng nhập để xem hồ sơ</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!fullName.trim()) { showToast("Vui lòng nhập họ tên"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/User/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone ? parseInt(phone) : null,
          address: address.trim(),
        }),
      });
      if (res.ok) {
        updateUser({ fullName: fullName.trim(), email: email.trim(), phone: phone ? parseInt(phone) : undefined, address: address.trim() });
        showToast("Cập nhật hồ sơ thành công");
      } else {
        showToast("Cập nhật thất bại");
      }
    } catch {
      showToast("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { showToast("Vui lòng nhập đầy đủ mật khẩu"); return; }
    if (newPassword !== confirmPassword) { showToast("Mật khẩu mới không khớp"); return; }
    if (newPassword.length < 4) { showToast("Mật khẩu mới phải có ít nhất 4 ký tự"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/User/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          password: newPassword,
        }),
      });
      if (res.ok) {
        showToast("Đổi mật khẩu thành công");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("Đổi mật khẩu thất bại");
      }
    } catch {
      showToast("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <Link href="/account" className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-2xl">{user.fullName?.[0] || user.userName[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl font-black">{user.fullName || user.userName}</h1>
                <p className="text-white/70 text-sm">{user.role === "Admin" ? "Quản trị viên" : user.role === "Bep" ? "Đầu bếp" : user.role === "NV" ? "Nhân viên" : "Khách hàng"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#EE4D2D]" /> Thông tin cá nhân
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Họ tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all resize-none" />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full bg-gradient-to-r from-[#EE4D2D] to-[#FF6633] text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-[#EE4D2D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#EE4D2D]" /> Đổi mật khẩu
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Mật khẩu hiện tại</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Xác nhận mật khẩu mới</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all" />
            </div>
            <button onClick={handleChangePassword} disabled={saving}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
