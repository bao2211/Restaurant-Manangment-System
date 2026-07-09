"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-16 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EE4D2D]/50 to-transparent" />

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-[#EE4D2D] to-[#FF6633] rounded-2xl flex items-center justify-center shadow-lg shadow-[#EE4D2D]/20">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg tracking-tight">RMS</h3>
                <p className="text-[10px] text-gray-500 font-medium">Quản Lý Nhà Hàng</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Nhà hàng yêu thích của bạn, được giao hàng nhanh chóng. Đặt món trực tuyến và tận hưởng món ngon tại nhà.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { label: "f", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "i", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 3h11A3.5 3.5 0 0121 6.5v11a3.5 3.5 0 01-3.5 3.5h-11A3.5 3.5 0 013 17.5v-11A3.5 3.5 0 016.5 3z" },
                { label: "t", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 bg-gray-800/50 hover:bg-[#EE4D2D] rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#EE4D2D]/20"
                >
                  <span className="text-xs text-gray-400 hover:text-white font-bold uppercase">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Liên kết nhanh</h4>
            <ul className="space-y-3 text-sm">
              {["Về chúng tôi", "Thực đơn", "Liên hệ", "Blog"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#EE4D2D] transition-colors duration-200 hover:pl-1 inline-block">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              {["Trung tâm trợ giúp", "An toàn", "Điều khoản dịch vụ", "Chính sách riêng tư"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#EE4D2D] transition-colors duration-200 hover:pl-1 inline-block">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span>support@rms.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span>123 Lê Lợi, Quận 1, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 mt-10 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; 2026 RMS - Hệ Thống Quản Lý Nhà Hàng. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-[#EE4D2D] transition-colors">Chính sách</a>
            <span className="text-gray-800">·</span>
            <a href="#" className="hover:text-[#EE4D2D] transition-colors">Điều khoản</a>
            <span className="text-gray-800">·</span>
            <a href="#" className="hover:text-[#EE4D2D] transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
