"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const categories = [
  { id: 1, name: "Cơm", icon: "🍚", gradient: "from-orange-400 to-amber-400", bg: "bg-orange-50" },
  { id: 2, name: "Canh", icon: "🍜", gradient: "from-red-400 to-rose-400", bg: "bg-red-50" },
  { id: 3, name: "Súp", icon: "🥣", gradient: "from-yellow-400 to-amber-400", bg: "bg-yellow-50" },
  { id: 4, name: "Mì Xào", icon: "🍝", gradient: "from-amber-400 to-orange-400", bg: "bg-amber-50" },
  { id: 5, name: "Rau", icon: "🥬", gradient: "from-green-400 to-emerald-400", bg: "bg-green-50" },
  { id: 6, name: "Gà", icon: "🍗", gradient: "from-yellow-400 to-orange-400", bg: "bg-amber-50" },
  { id: 7, name: "Thức uống", icon: "🧋", gradient: "from-purple-400 to-pink-400", bg: "bg-purple-50" },
  { id: 8, name: "Cá", icon: "🐟", gradient: "from-blue-400 to-cyan-400", bg: "bg-blue-50" },
];

interface CategoryGridProps {
  onSelect?: (categoryName: string) => void;
  selectedCategory?: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function CategoryGrid({ onSelect, selectedCategory }: CategoryGridProps) {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Danh mục</h2>
          <p className="text-sm text-gray-400 mt-0.5">Khám phá các món ăn yêu thích</p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelect?.(selectedCategory)}
            className="text-sm text-gray-500 hover:text-[#EE4D2D] font-semibold flex items-center gap-1 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <motion.div
        className="grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <motion.button
              key={cat.id}
              variants={item}
              onClick={() => onSelect?.(cat.name)}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                isActive
                  ? "border-[#EE4D2D] bg-[#EE4D2D]/5 shadow-lg shadow-[#EE4D2D]/10"
                  : `border-gray-100 ${cat.bg} hover:shadow-lg hover:border-transparent`
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} ${isActive ? "opacity-15" : "opacity-0 group-hover:opacity-10"} transition-opacity duration-300`} />
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EE4D2D] rounded-full flex items-center justify-center z-20">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
              <span className="text-3xl md:text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span className={`text-[10px] md:text-xs font-semibold text-center leading-tight relative z-10 ${isActive ? "text-[#EE4D2D]" : "text-gray-700"}`}>{cat.name}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
