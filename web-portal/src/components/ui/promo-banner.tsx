"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
<<<<<<< HEAD
        {/* Daily Deal Card 1 - Bún thịt nướng (Tuesday) */}
=======
        {/* Promo card 1 */}
>>>>>>> origin/my-local-branch
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4, scale: 1.02 }}
<<<<<<< HEAD
          className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80"
            alt="Bún thịt nướng deal"
            className="w-full h-64 md:h-72 object-cover"
          />
          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#FF8C42] text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Deal mỗi ngày!
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="text-sm opacity-90 mb-1">Thứ 3 / Tuesday</p>
            <h3 className="text-2xl md:text-3xl font-black">Bún thịt nướng</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-300 line-through text-sm">85k</span>
              <span className="bg-[#22C55E] text-white font-bold px-3 py-1 rounded-full text-lg">
                deal 66k
              </span>
            </div>
          </div>
        </motion.div>

        {/* Daily Deal Card 2 - Cơm sườn nướng (Monday) */}
=======
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
>>>>>>> origin/my-local-branch
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
<<<<<<< HEAD
          className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
            alt="Cơm sườn nướng deal"
            className="w-full h-64 md:h-72 object-cover"
          />
          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-[#FF5757] text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Deal mỗi ngày!
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="text-sm opacity-90 mb-1">Thứ 2 / Monday</p>
            <h3 className="text-2xl md:text-3xl font-black">Cơm sườn nướng</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-300 line-through text-sm">78k</span>
              <span className="bg-[#22C55E] text-white font-bold px-3 py-1 rounded-full text-lg">
                deal 45k
              </span>
            </div>
=======
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
>>>>>>> origin/my-local-branch
          </div>
        </motion.div>
      </div>
    </section>
  );
}
