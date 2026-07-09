"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Promo card 1 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B35] via-[#FF8C42] to-[#FFB347] p-7 text-white cursor-pointer group"
        >
          <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-4 right-12 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-yellow-900 rounded-full animate-pulse" />
              Ưu đãi hạn chế
            </span>
            <h3 className="text-3xl font-black mt-3 tracking-tight">GIẢM 50%</h3>
            <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-xs">
              Cho đơn hàng đầu tiên. Sử dụng mã{" "}
              <span className="font-bold text-yellow-200 bg-white/15 px-2 py-0.5 rounded-md">WELCOME50</span>
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
            🎁
          </div>
        </motion.div>

        {/* Promo card 2 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7B2FF7] via-[#9B59F7] to-[#C084FC] p-7 text-white cursor-pointer group"
        >
          <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-4 right-12 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Giao hàng miễn phí
            </span>
            <h3 className="text-3xl font-black mt-3 tracking-tight">Miễn Phí Vận Chuyển</h3>
            <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-xs">
              Cho đơn hàng trên <span className="font-bold">200.000₫</span>. Không yêu cầu đơn hàng tối thiểu!
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
            🚀
          </div>
        </motion.div>
      </div>
    </section>
  );
}
