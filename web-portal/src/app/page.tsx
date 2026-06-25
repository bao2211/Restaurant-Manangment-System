"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/ui/header";
import HeroBanner from "@/components/ui/hero-banner";
import CategoryGrid from "@/components/ui/category-grid";
import PromoBanner from "@/components/ui/promo-banner";
import FoodGrid from "@/components/ui/food-grid";
import Footer from "@/components/ui/footer";

interface FoodItem {
  foodId: string;
  foodName: string;
  unitPrice: number;
  foodImage: string;
  categoryName: string;
  description?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function Home() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const foodRes = await fetch(`${API_BASE}/api/FoodInfo`);
        if (!foodRes.ok) throw new Error(`HTTP ${foodRes.status}`);
        const foodData = await foodRes.json();
        setFoodItems(foodData);
      } catch {
        setFoodItems([
          { foodId: "1", foodName: "Cơm gà xối mỡ", unitPrice: 56000, foodImage: "https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=400&auto=format&fit=crop", categoryName: "Cơm" },
          { foodId: "2", foodName: "Cơm sườn", unitPrice: 450000, foodImage: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=400&auto=format&fit=crop", categoryName: "Cơm" },
          { foodId: "3", foodName: "Cơm bò", unitPrice: 50000, foodImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=400&auto=format&fit=crop", categoryName: "Cơm" },
          { foodId: "10", foodName: "Mì xào bò", unitPrice: 40000, foodImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop", categoryName: "Mì Xào" },
          { foodId: "15", foodName: "Gà quay", unitPrice: 120000, foodImage: "https://images.unsplash.com/photo-1598103442097-8b74df4f2a4e?q=80&w=400&auto=format&fit=crop", categoryName: "Gà" },
          { foodId: "17", foodName: "Nước suối", unitPrice: 7000, foodImage: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop", categoryName: "Thức uống" },
          { foodId: "19", foodName: "Canh bí đỏ", unitPrice: 55000, foodImage: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop", categoryName: "Canh" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let items = foodItems;
    if (selectedCategory) {
      items = items.filter((item) => item.categoryName === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.foodName.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
      );
    }
    return items;
  }, [foodItems, selectedCategory, searchQuery]);

  const handleCategorySelect = (name: string) => {
    setSelectedCategory(selectedCategory === name ? null : name);
  };

  const handleSearchSelect = (foodId: string, foodName: string) => {
    setSearchQuery(foodName);
    setSelectedCategory(null);
    setHighlightedId(foodId);
    setTimeout(() => setHighlightedId(null), 4000);
  };

  const features = [
    { icon: "🚀", title: "Giao Hàng Nhanh", desc: "Chỉ trong 30 phút" },
    { icon: "💳", title: "Thanh Toán Đa Dạng", desc: "Online / COD" },
    { icon: "🔥", title: "Ưu Đãi Mỗi Ngày", desc: "Giảm đến 50%" },
    { icon: "⭐", title: "Đánh Giá Cao", desc: "4.8/5 sao trung bình" },
  ];

  const steps = [
    { icon: "🍽️", title: "Chọn món ăn", desc: "Duyệt qua nhiều món ăn từ các nhà hàng hàng đầu" },
    { icon: "📱", title: "Đặt hàng", desc: "Thêm món vào giỏ hàng và thanh toán theo cách bạn thích" },
    { icon: "🎉", title: "Thưởng thức món ngon", desc: "Theo dõi giao hàng thời gian thực và tận hưởng dịch vụ nhanh chóng" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} foodItems={foodItems} onSearchSelect={handleSearchSelect} />
      <HeroBanner />

      {/* Features bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 justify-center"
              >
                <span className="text-2xl">{feat.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">{feat.title}</p>
                  <p className="text-[10px] text-gray-400">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <CategoryGrid onSelect={handleCategorySelect} selectedCategory={selectedCategory} />
      <PromoBanner />

      {loading ? (
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                  <div className="h-5 bg-gray-100 rounded-lg w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <FoodGrid
          items={filteredItems}
          highlightedId={highlightedId}
          title={
            selectedCategory
              ? `Món ${selectedCategory}`
              : searchQuery
              ? `Kết quả tìm "${searchQuery}"`
              : "Phổ biến gần bạn"
          }
        />
      )}

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cách thức đặt hàng</h2>
          <p className="text-gray-400 mt-2 text-sm">Đơn giản, nhanh chóng, tiện lợi</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#EE4D2D]/20 via-[#FF6633]/40 to-[#EE4D2D]/20" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center p-6 relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#EE4D2D] to-[#FF6633] rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#EE4D2D]/20 relative z-10">
                <span className="text-3xl">{step.icon}</span>
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-[#EE4D2D] rounded-full flex items-center justify-center text-xs font-black text-[#EE4D2D] z-20">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Download CTA */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-[#EE4D2D] via-[#FF6633] to-[#FF8C42] rounded-3xl p-10 md:p-14 text-white text-center animate-gradient"
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
              Đặt món từ nhà hàng tốt nhất
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Tải ứng dụng của chúng tôi và nhận ưu đãi độc quyền cho đơn hàng đầu tiên!
            </p>
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-black/50 transition-colors border border-white/10"
              >
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <p className="text-[10px] text-white/60">Tải trên</p>
                  <p className="text-sm font-bold -mt-0.5">App Store</p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-black/50 transition-colors border border-white/10"
              >
                <span className="text-2xl">▶️</span>
                <div className="text-left">
                  <p className="text-[10px] text-white/60">Tải trên</p>
                  <p className="text-sm font-bold -mt-0.5">Google Play</p>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
