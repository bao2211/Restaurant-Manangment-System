"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Daily Deal Card 1 - Bún thịt nướng (Tuesday) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4, scale: 1.02 }}
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
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
