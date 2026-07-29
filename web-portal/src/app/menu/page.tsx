"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import CategoryGrid from "@/components/ui/category-grid";
import FoodGrid from "@/components/ui/food-grid";

interface FoodItem {
  foodId: string;
  foodName: string;
  unitPrice: number;
  foodImage: string;
  categoryName: string;
  description?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

export default function MenuPage() {
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
          { foodId: "4", foodName: "Cơm tấm sườn", unitPrice: 48000, foodImage: "https://images.unsplash.com/photo-1633945274405-b0c3fe8b94e2?q=80&w=400&auto=format&fit=crop", categoryName: "Cơm" },
          { foodId: "5", foodName: "Cơm chiên dương châu", unitPrice: 45000, foodImage: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400&auto=format&fit=crop", categoryName: "Cơm" },
          { foodId: "6", foodName: "Canh chua cá lóc", unitPrice: 55000, foodImage: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop", categoryName: "Canh" },
          { foodId: "7", foodName: "Canh rau củ", unitPrice: 35000, foodImage: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400&auto=format&fit=crop", categoryName: "Canh" },
          { foodId: "8", foodName: "Súp cua", unitPrice: 42000, foodImage: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e1?q=80&w=400&auto=format&fit=crop", categoryName: "Súp" },
          { foodId: "9", foodName: "Súp gà", unitPrice: 38000, foodImage: "https://images.unsplash.com/photo-1541076480636-f1d274f1385e?q=80&w=400&auto=format&fit=crop", categoryName: "Súp" },
          { foodId: "10", foodName: "Mì xào bò", unitPrice: 40000, foodImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop", categoryName: "Mì Xào" },
          { foodId: "11", foodName: "Mì xào hải sản", unitPrice: 55000, foodImage: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=400&auto=format&fit=crop", categoryName: "Mì Xào" },
          { foodId: "12", foodName: "Rau muống xào tỏi", unitPrice: 32000, foodImage: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?q=80&w=400&auto=format&fit=crop", categoryName: "Rau" },
          { foodId: "13", foodName: "Rau cải luộc", unitPrice: 28000, foodImage: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=400&auto=format&fit=crop", categoryName: "Rau" },
          { foodId: "14", foodName: "Gà xào sả ớt", unitPrice: 65000, foodImage: "https://images.unsplash.com/photo-1598103442097-8b74df4f2a4e?q=80&w=400&auto=format&fit=crop", categoryName: "Gà" },
          { foodId: "15", foodName: "Gà quay", unitPrice: 120000, foodImage: "https://images.unsplash.com/photo-1598103442097-8b74df4f2a4e?q=80&w=400&auto=format&fit=crop", categoryName: "Gà" },
          { foodId: "16", foodName: "Gà rán", unitPrice: 55000, foodImage: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop", categoryName: "Gà" },
          { foodId: "17", foodName: "Nước suối", unitPrice: 7000, foodImage: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop", categoryName: "Thức uống" },
          { foodId: "18", foodName: "Trà đào", unitPrice: 25000, foodImage: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=400&auto=format&fit=crop", categoryName: "Thức uống" },
          { foodId: "19", foodName: "Cá kho tộ", unitPrice: 65000, foodImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop", categoryName: "Cá" },
          { foodId: "20", foodName: "Cá chiên sốt me", unitPrice: 75000, foodImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop", categoryName: "Cá" },
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header foodItems={foodItems} onSearch={setSearchQuery} onSearchSelect={(id) => setHighlightedId(id)} />

      {/* Page header */}
<<<<<<< HEAD
      <section className="bg-[#F5EDE4]">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Top Label */}
            <p className="text-gray-800 text-sm md:text-base font-medium tracking-wide mb-2">Restaurant Management System</p>
            
            {/* Divider Line */}
            <div className="w-full max-w-4xl mx-auto border-b-2 border-[#E8943A] mb-6" />
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-4">
              THỰC ĐƠN
            </h1>
            
            {/* Bottom Divider Line */}
            <div className="w-64 md:w-96 mx-auto border-b-2 border-[#E8943A] mb-8" />

            {/* Food Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-6"
            >
              {[
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop",
              ].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative group"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={src}
                      alt={`Food ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
=======
      <section className="bg-gradient-to-br from-[#EE4D2D] via-[#FF6633] to-[#FF8C42]">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Thực đơn</h1>
            <p className="text-white/70 mt-2 text-sm">Khám phá tất cả món ngon tại nhà hàng</p>
>>>>>>> origin/my-local-branch
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm trong thực đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#EE4D2D]/40 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc</span>
          </div>
        </div>
      </div>

      <CategoryGrid onSelect={(name) => setSelectedCategory(selectedCategory === name ? null : name)} selectedCategory={selectedCategory} />

      <div className="border-t border-gray-100" />

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
              : "Tất cả món ăn"
          }
        />
      )}

      <Footer />
    </div>
  );
}