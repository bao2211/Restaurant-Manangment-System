"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Database, Globe, CheckCircle, AlertCircle, RefreshCw, Save } from "lucide-react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useToast } from "@/contexts/toast-context";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";

const presetConfigs = [
  { label: "Local Development", url: "http://192.168.192.85:8080", desc: "Docker container local" },
  { label: "Remote Server", url: "http://46.250.231.129:8080", desc: "Production server" },
  { label: "Localhost", url: "http://localhost:8080", desc: "Local development" },
  { label: "Custom", url: "", desc: "Enter your own URL" },
];

export default function ConfigPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_BASE);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [savedUrl, setSavedUrl] = useState(API_BASE);

  useEffect(() => {
    setMounted(true);
    // Load saved config from localStorage
    const saved = localStorage.getItem("rms_api_url");
    if (saved) {
      setApiUrl(saved);
      setSavedUrl(saved);
    }
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${apiUrl}/api/Table`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestResult("success");
        showToast("Kết nối thành công!");
      } else {
        setTestResult("error");
        showToast(`Kết nối thất bại: ${res.status}`);
      }
    } catch (e) {
      setTestResult("error");
      showToast("Không thể kết nối đến server");
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = () => {
    if (!apiUrl.trim()) {
      showToast("Vui lòng nhập URL");
      return;
    }
    localStorage.setItem("rms_api_url", apiUrl);
    setSavedUrl(apiUrl);
    showToast("Đã lưu cấu hình! Reload trang để áp dụng.");
  };

  const selectPreset = (url: string) => {
    setApiUrl(url);
    setTestResult(null);
  };

  const hasChanges = apiUrl !== savedUrl;

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#EE4D2D] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Cấu hình hệ thống</h1>
              <p className="text-white/60 text-sm">Database & API Settings</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Trạng thái hiện tại
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API URL đang dùng:</span>
                <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-800">
                  {savedUrl}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Environment:</span>
                <span className="text-sm font-medium text-green-600">{process.env.NODE_ENV}</span>
              </div>
            </div>
          </motion.div>

          {/* Preset Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Chọn cấu hình nhanh
            </h2>
            <div className="grid gap-3">
              {presetConfigs.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => selectPreset(preset.url)}
                  className={`w-full bg-white rounded-2xl p-5 shadow-sm border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                    apiUrl === preset.url && preset.url !== ""
                      ? "border-[#EE4D2D] bg-[#EE4D2D]/5"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      apiUrl === preset.url && preset.url !== ""
                        ? "bg-[#EE4D2D] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {preset.label === "Custom" ? (
                      <Settings className="w-5 h-5" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{preset.label}</h3>
                    <p className="text-xs text-gray-500">{preset.desc}</p>
                    {preset.url && (
                      <code className="text-xs text-gray-400 font-mono">{preset.url}</code>
                    )}
                  </div>
                  {apiUrl === preset.url && preset.url !== "" && (
                    <CheckCircle className="w-5 h-5 text-[#EE4D2D]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Manual Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Hoặc nhập URL tùy chỉnh
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => {
                    setApiUrl(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="http://192.168.192.85:8080"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#EE4D2D] focus:ring-2 focus:ring-[#EE4D2D]/20 outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">
                  URL phải trỏ đến server API (không có / ở cuối)
                </p>
              </div>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 ${
                    testResult === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {testResult === "success" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Kết nối thành công!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Kết nối thất bại</span>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={testConnection}
                  disabled={testing || !apiUrl.trim()}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang test...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Test kết nối
                    </>
                  )}
                </button>
                <button
                  onClick={saveConfig}
                  disabled={!hasChanges || !apiUrl.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#EE4D2D] text-white font-semibold hover:bg-[#D64018] disabled:opacity-50 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {hasChanges ? "Lưu thay đổi" : "Đã lưu"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
          >
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Lưu ý quan trọng
            </h3>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Thay đổi sẽ có hiệu lực sau khi reload trang</li>
              <li>Đảm bảo server API đang chạy tại địa chỉ trên</li>
              <li>URL cần bao gồm port (ví dụ: :8080)</li>
              <li>Nếu dùng HTTPS, đảm bảo chứng chỉ hợp lệ</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
