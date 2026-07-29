"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* MÓN HEALTHY Title */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-none tracking-tight">
                MÓN
              </h1>
              <h2 className="text-5xl md:text-7xl font-black text-[#22C55E] leading-none tracking-tight">
                HEALTHY
              </h2>
            </div>

            {/* ORDER NGAY Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/menu"
                className="inline-block bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-lg px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ORDER NGAY
              </Link>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="mt-8 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start text-gray-700">
                <Phone className="w-5 h-5 text-gray-900" />
                <span className="font-medium">+123-456-7890</span>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start text-gray-700">
                <MapPin className="w-5 h-5 text-gray-900" />
                <span className="font-medium">828 Sư Văn Hạnh, quận 10, tp HCM</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Food Image */}
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Decorative green shapes */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-[#22C55E] rounded-3xl transform rotate-3" />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#22C55E] rounded-full opacity-20" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#22C55E] rounded-full opacity-30" />

              {/* Decorative elements */}
              <div className="absolute -top-6 right-1/4">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="28" stroke="#22C55E" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>
              <div className="absolute bottom-10 -left-8">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="5" y="5" width="30" height="30" rx="8" fill="#22C55E" opacity="0.3" />
                </svg>
              </div>

              {/* Food Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
                  alt="Healthy Food"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
