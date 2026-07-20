"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-white/5 rounded-full animate-float-slow" />
        <div className="absolute top-1/3 right-1/5 w-60 h-60 bg-white/5 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-white/10 rounded-full animate-float-slow" style={{ animationDelay: "2s" }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative container mx-auto px-4 py-14 md:py-24">
        <div className="max-w-2xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Giao hàng miễn phí cho đơn hàng đầu tiên!
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-black leading-[1.1] mb-5 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Món ngon,
            <br />
            <span className="relative">
              giao đến bạn
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/80 mb-8 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Đặt món từ nhà hàng yêu thích và tận hưởng dịch vụ giao hàng nhanh
            chóng, đáng tin cậy đến ngay nhà bạn.
          </motion.p>

          {/* Search bar */}
          <motion.div
            className="flex bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/15 max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <div className="flex items-center px-4 text-gray-400">
              <MapPinIcon />
            </div>
            <input
              type="text"
              placeholder="Nhập địa chỉ giao hàng của bạn"
              className="flex-1 py-4 px-2 text-gray-700 text-sm focus:outline-none font-medium"
            />
            <button className="bg-gradient-to-r from-[#EE4D2D] to-[#FF6633] hover:from-[#D73211] hover:to-[#EE4D2D] text-white px-7 py-4 font-bold text-sm transition-all duration-300 shrink-0 shadow-lg shadow-[#EE4D2D]/30 hover:shadow-[#EE4D2D]/50">
              Tìm Món Ăn
            </button>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex gap-10 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {[
              { value: "500+", label: "Nhà hàng" },
              { value: "10K+", label: "Khách hàng hài lòng" },
              { value: "30 phút", label: "Thời gian giao hàng TB" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-black">{stat.value}</p>
                <p className="text-xs text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
