/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SystemSettings, DEFAULT_TRANSLATIONS } from "../types";
import { Save, RefreshCw, Layout, Smartphone, CheckSquare, Sparkles } from "lucide-react";

interface SettingsPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  lang: "en" | "bn";
}

export default function SettingsPanel({ settings, onUpdateSettings, lang }: SettingsPanelProps) {
  const t = DEFAULT_TRANSLATIONS[lang];
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [showStatus, setShowStatus] = useState<string | null>(null);

  const colors = [
    { name: "Indigo Modern", value: "indigo", bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-600" },
    { name: "Emerald Serene (Best)", value: "emerald", bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-600" },
    { name: "Amber Business", value: "amber", bg: "bg-amber-600", border: "border-amber-600", text: "text-amber-600" },
    { name: "Cyan Technical", value: "cyan", bg: "bg-cyan-600", border: "border-cyan-600", text: "text-cyan-600" },
    { name: "Rose Premium", value: "rose", bg: "bg-rose-600", border: "border-rose-600", text: "text-rose-600" },
  ];

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMenuToggle = (menuName: keyof SystemSettings["activeMenus"]) => {
    setFormData((prev) => ({
      ...prev,
      activeMenus: {
        ...prev.activeMenus,
        [menuName]: !prev.activeMenus[menuName],
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setShowStatus(lang === "bn" ? "কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!" : "Configuration saved successfully!");
    setTimeout(() => {
      setShowStatus(null);
    }, 3000);
  };

  const handleReset = () => {
    // Standard default settings
    const defaultData: SystemSettings = {
      appNameEN: "Property & Rent Manager",
      appNameBN: "বাসাবাড়ি ও ভাড়া হিসাব",
      logoTextEN: "🏢 bashaBari",
      logoTextBN: "🏢 বাসাবাড়ি",
      primaryColor: "indigo",
      ownerNameEN: "Al-Amin Hossain",
      ownerNameBN: "আল-আমিন হোসেন",
      contactPhone: "01712345678",
      bdtSymbol: "৳",
      termsTemplateEN: "1. The tenant must pay the monthly rent within the 10th of every month.\n2. Security deposit is refundable upon tenancy termination after utility clearance.\n3. Modification of structural fittings is prohibited.",
      termsTemplateBN: "১. প্রতি মাসের ১০ তারিখের মধ্যে ভাড়াটিয়া মাসিক ভাড়া পরিশোধ করিতে বাধ্য থাকিবেন।\n২. চুক্তি শেষে গ্যাস, বিদুৎ ও অন্যান্য ইউটিলিটি বিল সমন্বয় পূর্বক সিকিউরিটি জামানত ফেরতযোগ্য।\n৩. বাড়িওয়ালার অনুমতি ব্যতীত ফ্লাটে কোনো প্রকার কাঠামোগত পরিবর্তন করা যাইবে না।",
      activeMenus: {
        dashboard: true,
        properties: true,
        tenants: true,
        agreements: true,
        rentCollection: true,
        userManagement: true,
        settings: true,
      },
    };
    setFormData(defaultData);
    onUpdateSettings(defaultData);
  };

  // Quick theme helper
  const primaryBg = `bg-${settings.primaryColor}-600`;
  const primaryText = `text-${settings.primaryColor}-600`;
  const primaryBorder = `border-${settings.primaryColor}-600`;
  const primaryHover = `hover:bg-${settings.primaryColor}-700`;

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {lang === "bn" ? "⚙️ সিস্টেম সেটিংস প্যানেল" : "⚙️ System Settings Panel"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "bn"
              ? "সফটওয়্যারের নাম, লোগো, কালার থিম এবং চুক্তিপত্রের ডেমো শর্তাবলী এখান থেকে কাস্টমাইজ করুন।"
              : "Customize application names, logos, primary theme color, and agreement templates here."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {lang === "bn" ? "ডিফল্ট সেট করুন" : "Reset Default"}
          </button>
        </div>
      </div>

      {showStatus && (
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{showStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings: Brand & Titles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 lg:col-span-2 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Smartphone className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-800 text-base">
              {lang === "bn" ? "ব্র্যান্ডিং ও সফটওয়্যার আইডেন্টিটি" : "Branding & Software Identity"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "সভ্যওয়্যার নাম (ইংরেজি)" : "Software Name (English)"}
              </label>
              <input
                type="text"
                value={formData.appNameEN}
                onChange={(e) => handleInputChange("appNameEN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "সফটওয়্যার নাম (বাংলা)" : "Software Name (Bengali)"}
              </label>
              <input
                type="text"
                value={formData.appNameBN}
                onChange={(e) => handleInputChange("appNameBN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "লোগো টেক্সট (ইংরেজি)" : "Logo Text (English)"}
              </label>
              <input
                type="text"
                value={formData.logoTextEN}
                onChange={(e) => handleInputChange("logoTextEN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "লোগো টেক্সট (বাংলা)" : "Logo Text (Bengali)"}
              </label>
              <input
                type="text"
                value={formData.logoTextBN}
                onChange={(e) => handleInputChange("logoTextBN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "বাড়িওয়ালা / মালিকের নাম (ইংরেজি)" : "Owner / Landlord Name (English)"}
              </label>
              <input
                type="text"
                value={formData.ownerNameEN}
                onChange={(e) => handleInputChange("ownerNameEN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "বাড়িওয়ালা / মালিকের নাম (বাংলা)" : "Owner / Landlord Name (Bengali)"}
              </label>
              <input
                type="text"
                value={formData.ownerNameBN}
                onChange={(e) => handleInputChange("ownerNameBN", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "মোবাইল / কন্টাক্ট নম্বর" : "Contact Phone Number"}
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "মুদ্রা প্রতীক" : "Currency Symbol"}
              </label>
              <select
                value={formData.bdtSymbol}
                onChange={(e) => handleInputChange("bdtSymbol", e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="৳">৳ (BDT Taka)</option>
                <option value="TK">TK (Taka)</option>
                <option value="$">$ (USD)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "ডিফল্ট চুক্তিপত্র শর্তাবলী (বাংলা)" : "Default Agreement Terms (Bengali)"}
              </label>
              <textarea
                value={formData.termsTemplateBN}
                onChange={(e) => handleInputChange("termsTemplateBN", e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {lang === "bn" ? "ডিফল্ট চুক্তিপত্র শর্তাবলী (ইংরেজি)" : "Default Agreement Terms (English)"}
              </label>
              <textarea
                value={formData.termsTemplateEN}
                onChange={(e) => handleInputChange("termsTemplateEN", e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Theme & Menu Config */}
        <div className="space-y-6">
          {/* Color theme config */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Sparkles className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-base">
                {t.accentColor}
              </h2>
            </div>
            <div className="space-y-3">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleInputChange("primaryColor", c.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    formData.primaryColor === c.value
                      ? `border-slate-800 bg-${c.value}-50/30 ring-2 ring-${c.value}-500/10`
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-4 w-4 rounded-full ${c.bg}`}></span>
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  </div>
                  {formData.primaryColor === c.value && (
                    <span className={`text-xs font-semibold uppercase tracking-wider bg-${c.value}-100 text-${c.value}-800 px-2.5 py-0.5 rounded-full`}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Menus visibility configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Layout className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-800 text-base">
                {lang === "bn" ? "মেনু নেভিগেশন কন্ট্রোল" : "Menu Navigation Control"}
              </h2>
            </div>

            <p className="text-xs text-slate-400">
              {lang === "bn"
                ? "বামদিকের সাইডবার মেনু থেকে যে পেজগুলো আপনি লুকিয়ে রাখতে চান, সেগুলোর টিকচিহ্ন তুলে দিন।"
                : "Toggle individual features to enable or disable sections from your sidebar navigation."}
            </p>

            <div className="space-y-3 pt-1">
              {Object.entries(formData.activeMenus).map(([menuKey, val]) => {
                const label = t[menuKey as keyof typeof t] || menuKey;
                return (
                  <label
                    key={menuKey}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-600 capitalize">
                      {label}
                    </span>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={() => handleMenuToggle(menuKey as keyof SystemSettings["activeMenus"])}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <p className="text-xs font-mono text-slate-500">
            {lang === "bn" ? "প্রোফাইল সেটিংস ব্রাউজার লোকাল মেমোরি সংরক্ষণ করে" : "Properties save locally under browser's sandbox profile."}
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
          >
            <Save className="h-4 w-4" />
            {t.saveSettings}
          </button>
        </div>
      </form>
    </div>
  );
}
