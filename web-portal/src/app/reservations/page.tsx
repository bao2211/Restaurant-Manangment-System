"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Phone, Check } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useToast } from "@/contexts/toast-context";

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];

const today = new Date().toISOString().split("T")[0];

export default function ReservationsPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!name || !phone || !time) return;
    showToast(`Đặt bàn thành công! ${date} lúc ${time}, ${guests} khách`);
    setStep(3);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-gradient-to-br from-[#7B2FF7] via-[#9B59F7] to-[#C084FC]">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Đặt bàn trước</h1>
            <p className="text-white/70 mt-2 text-sm">Đảm bảo chỗ ngồi cho bữa ăn của bạn</p>
          </motion.div>
        </div>
      </section>

      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s ? "bg-[#7B2FF7] text-white shadow-lg shadow-[#7B2FF7]/30" : "bg-gray-200 text-gray-400"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-1 rounded-full transition-all duration-300 ${step > s ? "bg-[#7B2FF7]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/80"
              >
                <h2 className="text-xl font-black text-gray-900 mb-6">Chọn thời gian</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Ngày</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={today}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#7B2FF7]/40 focus:bg-white transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Giờ</label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            time === t
                              ? "bg-[#7B2FF7] text-white shadow-md shadow-[#7B2FF7]/20"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Số khách</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-bold text-gray-600"
                      >-</button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-black text-gray-900">{guests}</span>
                        <p className="text-xs text-gray-400 mt-0.5">khách</p>
                      </div>
                      <button
                        onClick={() => setGuests(Math.min(20, guests + 1))}
                        className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-xl font-bold text-gray-600"
                      >+</button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!time}
                  className="w-full mt-8 bg-gradient-to-r from-[#7B2FF7] to-[#9B59F7] text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-[#7B2FF7]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp tục
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/80"
              >
                <h2 className="text-xl font-black text-gray-900 mb-6">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Họ tên</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#7B2FF7]/40 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="090 123 4567"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#7B2FF7]/40 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Ghi chú (không bắt buộc)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm..."
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#7B2FF7]/40 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition-all duration-300">Quay lại</button>
                  <button onClick={handleSubmit} disabled={!name || !phone} className="flex-1 bg-gradient-to-r from-[#7B2FF7] to-[#9B59F7] text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-[#7B2FF7]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Xác nhận</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100/80 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Đặt bàn thành công!</h2>
                <p className="text-gray-400 mt-2 text-sm">Thông tin đặt bàn của bạn</p>
                <div className="bg-gray-50 rounded-2xl p-5 mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#7B2FF7]" />
                    <span className="text-gray-600">{new Date(date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-[#7B2FF7]" />
                    <span className="text-gray-600">{time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-[#7B2FF7]" />
                    <span className="text-gray-600">{guests} khách</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[#7B2FF7]" />
                    <span className="text-gray-600">RMS - 123 Lê Lợi, Quận 1</span>
                  </div>
                </div>
                <button onClick={() => { setStep(1); setTime(""); setName(""); setPhone(""); setNote(""); }} className="w-full mt-6 bg-gradient-to-r from-[#7B2FF7] to-[#9B59F7] text-white font-bold py-3.5 rounded-2xl hover:shadow-lg transition-all duration-300">
                  Đặt bàn khác
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}