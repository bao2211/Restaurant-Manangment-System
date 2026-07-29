"use client";

import React from "react";
import { motion } from "framer-motion";
import { Table2, Utensils, ClipboardList, ChefHat, ShoppingBag, User, Settings, Database, CalendarDays } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setMounted(true); }, []);

  const adminLinks = [
    { href: "/admin/tables", label: "Quản lý bàn", icon: Table2, desc: "Thêm, sửa, xóa bàn", color: "from-green-500 to-emerald-500" },
    { href: "/admin/menu", label: "Quản lý thực đơn", icon: Utensils, desc: "Thêm, sửa, xóa món ăn", color: "from-orange-500 to-red-500" },
    { href: "/orders", label: "Tất cả đơn hàng", icon: ClipboardList, desc: "Xem toàn bộ đơn hàng", color: "from-blue-500 to-cyan-500" },
    { href: "/table", label: "Sơ đồ bàn", icon: Table2, desc: "Xem tình trạng bàn", color: "from-purple-500 to-pink-500" },
    { href: "/kitchen", label: "Quản lý bếp", icon: ChefHat, desc: "Cập nhật trạng thái món", color: "from-amber-500 to-yellow-500" },
    { href: "/config", label: "Cấu hình hệ thống", icon: Settings, desc: "Database & API settings", color: "from-slate-500 to-slate-700" },
  ];

  const userLinks = [
    { href: "/profile", label: "Hồ sơ cá nhân", icon: User, desc: "Chỉnh sửa thông tin tài khoản", color: "from-gray-500 to-gray-600" },
    { href: "/orders", label: "Đơn hàng của tôi", icon: ShoppingBag, desc: "Lịch sử đặt món", color: "from-[#EE4D2D] to-[#FF6633]" },
    { href: "/reservations", label: "Đặt bàn", icon: CalendarDays, desc: "Đặt bàn trước", color: "from-[#7B2FF7] to-[#9B59F7]" },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center" />
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Vui lòng đăng nhập</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#EE4D2D] to-[#FF6633] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">{user.fullName?.[0] || user.userName[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user.fullName || user.userName}</h1>
              <p className="text-white/60 text-sm">{user.role === "Admin" ? "Quản trị viên" : user.role === "Bep" ? "Đầu bếp" : user.role === "NV" ? "Nhân viên" : "Khách hàng"}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
          {user.role === "Admin" && (
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Quản trị</h2>
              <div className="grid gap-3">
                {adminLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80 flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{link.label}</h3>
                      <p className="text-xs text-gray-400">{link.desc}</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-[#EE4D2D] transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Khách hàng</h2>
            <div className="grid gap-3">
              {userLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80 flex items-center gap-4 group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{link.label}</h3>
                    <p className="text-xs text-gray-400">{link.desc}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#EE4D2D] transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CalendarDays(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> }
