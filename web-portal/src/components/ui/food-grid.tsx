"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Plus, Heart, Minus } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";

interface FoodItem {
  foodId: string;
  foodName: string;
  unitPrice: number;
  foodImage: string;
  categoryName: string;
  description?: string;
}

interface FoodCardProps {
  item: FoodItem;
  index: number;
  highlighted?: boolean;
}

function FoodCard({ item, index, highlighted }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const cartItem = items.find((i) => i.foodId === item.foodId);
  const quantity = cartItem?.quantity ?? 0;

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      foodId: item.foodId,
      foodName: item.foodName,
      unitPrice: item.unitPrice,
      foodImage: item.foodImage,
      categoryName: item.categoryName,
    });
    showToast(`Đã thêm ${item.foodName} vào giỏ hàng`);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity <= 1) {
      removeItem(item.foodId);
      showToast(`Đã xóa ${item.foodName} khỏi giỏ hàng`);
    } else {
      updateQuantity(item.foodId, quantity - 1);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer border ${
        highlighted ? "border-[#EE4D2D] ring-2 ring-[#EE4D2D]/30" : "border-gray-100/80"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.foodImage}
          alt={item.foodName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-[#EE4D2D] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {item.categoryName}
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#EE4D2D] transition-colors">
          {item.foodName}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-700">4.8</span>
          </div>
          <span className="text-gray-300">·</span>
          <div className="flex items-center gap-0.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">15-25 phút</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-base font-black text-[#EE4D2D]">
            {formatPrice(item.unitPrice)}
          </span>
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-gray-900 min-w-[22px] text-center">{quantity}</span>
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 bg-[#EE4D2D]/10 hover:bg-[#EE4D2D] text-[#EE4D2D] hover:text-white rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 bg-[#EE4D2D]/10 hover:bg-[#EE4D2D] text-[#EE4D2D] hover:text-white rounded-xl flex items-center justify-center transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface FoodGridProps {
  items: FoodItem[];
  title?: string;
  highlightedId?: string | null;
}

export default function FoodGrid({ items, title = "Phổ biến gần bạn", highlightedId }: FoodGridProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Được yêu thích nhất hôm nay</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Không tìm thấy món ăn nào</p>
          <p className="text-gray-300 text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {items.map((item, index) => (
            <FoodCard key={item.foodId} item={item} index={index} highlighted={item.foodId === highlightedId} />
          ))}
        </div>
      )}
    </section>
  );
}