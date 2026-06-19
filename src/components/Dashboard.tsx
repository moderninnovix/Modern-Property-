/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Property, SubUnit, Tenant, LicenseAgreement, RentCollectionRecord, SystemSettings, DEFAULT_TRANSLATIONS } from "../types";
import { DollarSign, Landmark, Building2, UserCheck, TrendingUp, AlertCircle, Sparkles, LogIn, ArrowUpRight, Percent, Clock } from "lucide-react";

interface DashboardProps {
  properties: Property[];
  subUnits: SubUnit[];
  tenants: Tenant[];
  agreements: LicenseAgreement[];
  rentRecords: RentCollectionRecord[];
  settings: SystemSettings;
  lang: "en" | "bn";
}

export default function Dashboard({
  properties,
  subUnits,
  tenants,
  agreements,
  rentRecords,
  settings,
  lang,
}: DashboardProps) {
  const t = DEFAULT_TRANSLATIONS[lang];

  // Core calculations and analytics
  const totalCollections = rentRecords
    .filter((r) => r.status === "Paid" || r.status === "Partial")
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const totalOutstandingDues = rentRecords
    .reduce((sum, r) => sum + r.amountDue, 0);

  const totalActiveTenants = tenants.length;
  const totalActiveAgreements = agreements.filter((a) => a.status === "Active").length;

  const countOfVacant = subUnits.filter((u) => u.status === "Vacant").length;
  const countOfOccupied = subUnits.filter((u) => u.status === "Occupied").length;
  const countOfMaintenance = subUnits.filter((u) => u.status === "Maintenance").length;
  const totalUnits = subUnits.length;
  const vacancyRate = totalUnits > 0 ? Math.round((countOfVacant / totalUnits) * 100) : 0;
  const occupancyPct = totalUnits > 0 ? Math.round((countOfOccupied / totalUnits) * 1000) / 10 : 0;

  // Let's make category-wise calculations
  const categories = ["House", "Flat", "Shop", "Office"] as const;
  const categoryStats = categories.map((cat) => {
    const categoryUnits = subUnits.filter((u) => u.category === cat);
    const total = categoryUnits.length;
    const occupied = categoryUnits.filter((u) => u.status === "Occupied").length;
    const vacant = categoryUnits.filter((u) => u.status === "Vacant").length;
    return {
      name: cat,
      label: cat === "House" ? t.house : cat === "Flat" ? t.flat : cat === "Shop" ? t.shop : t.office,
      total,
      occupied,
      vacant,
    };
  });

  // Let's create beautiful month-by-month rent aggregates for our visual chart representation
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const monthData = months.map((monthName, index) => {
    // format as YYYY-MM
    const paddedMonthNum = String(index + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${paddedMonthNum}`;
    const collected = rentRecords
      .filter((r) => r.monthString === monthKey)
      .reduce((sum, r) => sum + r.amountPaid, 0);
    return { month: monthName, collected };
  });

  const maxMonthValue = Math.max(...monthData.map((d) => d.collected), 15000);

  // Dynamic calculations for Financial Summary card based on current month
  const today = new Date();
  const currentYearStr = today.getFullYear();
  const currentMonthStr = String(today.getMonth() + 1).padStart(2, "0");
  const currentMonthKey = `${currentYearStr}-${currentMonthStr}`;

  const currentMonthName = today.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    month: "long",
    year: "numeric"
  });

  const currentMonthRecords = rentRecords.filter((r) => r.monthString === currentMonthKey);
  const currentMonthPaid = currentMonthRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const currentMonthDue = currentMonthRecords.reduce((sum, r) => sum + r.amountDue, 0);
  const currentMonthProjected = currentMonthPaid + currentMonthDue;
  const collectedPct = currentMonthProjected > 0 ? Math.round((currentMonthPaid / currentMonthProjected) * 100) : 0;

  const lookUpTenantName = (id: string) => tenants.find((te) => te.id === id)?.name || "N/A";
  const lookUpUnitNo = (id: string) => subUnits.find((u) => u.id === id)?.unitNo || "N/A";
  const lookUpPropertyName = (id: string) => properties.find((p) => p.id === id)?.name || "N/A";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/25 text-xs font-mono tracking-wider font-semibold text-indigo-200">
            <Sparkles className="h-3 w-3 text-indigo-300" />
            <span>{settings.appNameEN}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t.welcome}, {lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN}!
          </h1>
          <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
            {lang === "bn"
              ? "আপনার সকল বাড়ি, ফ্ল্যাট, বাণিজ্যিক দোকান এবং অফিস ভাড়ার হিসাব এবং প্রপার ডিজিটাল চুক্তিপত্র এক জায়গায় কন্ট্রোল করুন।"
              : "Compute rents, verify leases, store tenant credentials, and monitor cash inflows securely."}
          </p>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 rounded-xl bg-white/10 border border-white/5 text-center font-mono shrink-0">
            <span className="block text-2xl font-extrabold">{vacancyRate}%</span>
            <span className="text-[10px] uppercase text-indigo-200 font-semibold">{lang === "bn" ? "খালি থাকার হার" : "Vacancy Rate"}</span>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-bold tracking-wider block uppercase">
              {t.totalCollected}
            </span>
            <strong className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono direct-rent">
              {settings.bdtSymbol} {totalCollections.toLocaleString()}
            </strong>
          </div>
          <span className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Landmark className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-bold tracking-wider block uppercase">
              {t.unpaidAmount}
            </span>
            <strong className="text-2xl font-extrabold tracking-tight text-red-650 font-mono">
              {settings.bdtSymbol} {totalOutstandingDues.toLocaleString()}
            </strong>
          </div>
          <span className={`h-10 w-10 ${totalOutstandingDues > 0 ? "bg-red-50 text-red-650 animate-pulse" : "bg-slate-50 text-slate-400"} rounded-lg flex items-center justify-center`}>
            <AlertCircle className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-bold tracking-wider block uppercase">
              {t.totalProperties}
            </span>
            <strong className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
              {properties.length}
            </strong>
          </div>
          <span className="h-10 w-10 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 font-bold tracking-wider block uppercase">
              {t.activeTenants}
            </span>
            <strong className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
              {totalActiveTenants}
            </strong>
          </div>
          <span className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-6" id="current-month-financial-summary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 text-[10px] bg-indigo-50 text-indigo-700 font-extrabold font-mono rounded-md uppercase tracking-wider border border-indigo-100">
                {currentMonthKey}
              </span>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                {lang === "bn" ? "আর্থিক সারসংক্ষেপ • চলতি মাস" : "Financial Summary • Current Month"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === "bn" 
                ? `চলতি মাস (${currentMonthName})-এর পরিশোধিত ভাড়া, বকেয়া এবং সম্ভাব্য আয়ের স্বয়ংক্রিয় হিসাব`
                : `Automated summary of payments, pending dues, and projected total rent for ${currentMonthName}`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                {lang === "bn" ? "আদায়ের হার:" : "Collected Rate:"} {collectedPct}%
              </span>
            </div>
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden inline-block relative">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${collectedPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card Module 1: Total Monthly Revenue */}
          <div className="bg-slate-50/40 p-4.5 rounded-xl border border-slate-200/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
            <span className="p-2.5 rounded-lg bg-green-50 text-green-700 border border-green-100 shrink-0">
              <DollarSign className="h-5 w-5" />
            </span>
            <div className="space-y-1 flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450 block">
                {lang === "bn" ? "চলতি মাসের মোট আদায়" : "Total Monthly Revenue"}
              </span>
              <strong className="text-xl font-extrabold text-slate-900 font-mono block tracking-tight leading-tight">
                {settings.bdtSymbol} {currentMonthPaid.toLocaleString()}
              </strong>
              <span className="inline-flex text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 rounded px-1.5 py-0.5 mt-1">
                {lang === "bn" ? "আদায় সম্পন্ন" : "Collected successfully"}
              </span>
            </div>
          </div>

          {/* Card Module 2: Pending Rent */}
          <div className="bg-slate-50/40 p-4.5 rounded-xl border border-slate-200/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
            <span className="p-2.5 rounded-lg bg-red-50 text-red-650 border border-red-100 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="space-y-1 flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450 block">
                {lang === "bn" ? "চলতি মাসের বকেয়া" : "Pending Rent"}
              </span>
              <strong className="text-xl font-extrabold text-red-650 font-mono block tracking-tight leading-tight">
                {settings.bdtSymbol} {currentMonthDue.toLocaleString()}
              </strong>
              <span className={`inline-flex text-[10px] font-medium rounded px-1.5 py-0.5 mt-1 border ${
                currentMonthDue > 0 
                  ? "text-red-650 bg-red-50 border-red-100 animate-pulse" 
                  : "text-slate-500 bg-slate-50 border-slate-200"
              }`}>
                {currentMonthDue > 0 
                  ? (lang === "bn" ? "তাগাদা প্রয়োজন" : "Follow-up required") 
                  : (lang === "bn" ? "কোন বকেয়া নেই" : "No pending amount")}
              </span>
            </div>
          </div>

          {/* Card Module 3: Projected Income */}
          <div className="bg-slate-50/40 p-4.5 rounded-xl border border-slate-200/60 flex items-start gap-3.5 hover:border-slate-300 transition-all">
            <span className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="space-y-1 flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450 block">
                {lang === "bn" ? "চলতি মাসের সম্ভাব্য আয়" : "Projected Income"}
              </span>
              <strong className="text-xl font-extrabold text-indigo-950 font-mono block tracking-tight leading-tight">
                {settings.bdtSymbol} {currentMonthProjected.toLocaleString()}
              </strong>
              <span className="inline-flex text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mt-1">
                {lang === "bn" ? "মোট সম্ভাব্য সংগ্রহ" : "Total expected collection"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic customized rent collections chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-base">{lang === "bn" ? "মাসিক ভাড়া সারণী তালিকা (২০২৬)" : "Monthly Rent Collections (2026)"}</h3>
              <p className="text-xs text-slate-450">Values aggregated from rent collection records</p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>

          {/* Bar Charts built cleanly with dynamic Tailwind inline style heights */}
          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2.5 pt-8 px-2 border-b border-slate-250">
            {monthData.map((data, idx) => {
              const pct = (data.collected / maxMonthValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer" id={`chart-bar-${idx}`}>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-950 text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                    {settings.bdtSymbol} {data.collected.toLocaleString()}
                  </div>

                  {/* Active Bar */}
                  <div
                    style={{ height: `${pct > 7 ? pct : 7}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      data.collected > 0
                        ? "bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-700 group-hover:to-indigo-500"
                        : "bg-slate-100 group-hover:bg-slate-200"
                    }`}
                  ></div>

                  {/* Month Label */}
                  <span className="text-[10px] font-mono text-slate-500 mt-2">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy and Category Breakdown */}
        <div className="space-y-4 flex flex-col">
          {/* Stunning theme-informed widget block */}
          <div className="bg-indigo-900 p-5 rounded-xl text-white shadow-md">
            <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-4">Occupancy Rate</h3>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-extrabold tracking-tight">{occupancyPct}%</span>
              <span className="text-indigo-200 text-xs mb-1 font-mono">{countOfOccupied}/{totalUnits} Units</span>
            </div>
            <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-400 h-full rounded-full transition-all duration-700" 
                style={{ width: `${occupancyPct}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">{t.unitStatus}</h3>
              <p className="text-xs text-slate-450">Live room occupancy stats</p>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 text-blue-800 p-2 rounded-lg border border-blue-100/40 font-mono" id="vacant-count-pill">
                <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider">{lang === "bn" ? "খালি" : "Vacant"}</span>
                <strong className="text-base font-bold">{countOfVacant}</strong>
              </div>
              <div className="bg-green-50 text-green-800 p-2 rounded-lg border border-green-100/40 font-mono" id="occupied-count-pill">
                <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider">{lang === "bn" ? "ভাড়া" : "Occupied"}</span>
                <strong className="text-base font-bold">{countOfOccupied}</strong>
              </div>
              <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100/40 font-mono" id="maint-count-pill">
                <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider">{lang === "bn" ? "মেরামত" : "Maint"}</span>
                <strong className="text-base font-bold">{countOfMaintenance}</strong>
              </div>
            </div>

            {/* Categorized calculations listing as requested */}
            <div className="space-y-2.5 pt-2 flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {lang === "bn" ? "ক্যাটাগরি ভিত্তিক ভাড়ার হিসাব" : "Sub-unit Categories Detail"}
              </h4>

              <div className="divide-y divide-slate-100">
                {categoryStats.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between py-2 text-xs">
                    <span className="font-medium text-slate-700">{cat.label}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">Total: {cat.total}</span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-100/60 px-1.5 py-0.5 rounded font-bold">Free: {cat.vacant}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities Feed Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4" id="recent-activities-feed">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                  {lang === "bn" ? "সাম্প্রতিক কর্মকাণ্ড" : "Recent Activities"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "bn" ? "সর্বশেষ ৫টি ভাড়া প্রাপ্তি" : "Last 5 rent payments received"}
                </p>
              </div>
              <Clock className="h-4.5 w-4.5 text-slate-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {[...rentRecords]
                .filter((r) => r.amountPaid > 0)
                .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                .slice(0, 5)
                .map((record) => (
                  <div key={record.id} className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <span className="p-1.5 rounded-lg bg-green-50 text-green-700 mt-0.5 shrink-0 border border-green-100">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-tight">
                          {lookUpTenantName(record.tenantId)}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === "bn" ? "ইউনিট: " : "Unit: "}{" "}
                          <span className="font-semibold text-indigo-600">{lookUpUnitNo(record.subUnitId)}</span>
                          {" • "}{lookUpPropertyName(record.propertyId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <strong className="text-green-700 font-extrabold font-mono text-xs block">
                        +{settings.bdtSymbol}{record.amountPaid.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {record.paymentDate}
                      </span>
                    </div>
                  </div>
                ))}

              {rentRecords.filter((r) => r.amountPaid > 0).length === 0 && (
                <div className="text-center py-6 text-slate-450 text-xs italic">
                  {lang === "bn" ? "কোনো সাম্প্রতিক ভাড়া আদায় করা হয়নি" : "No recent payments received"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">{t.recentCollections}</h3>
          <span className="text-[10px] bg-slate-100 border border-slate-200 font-bold font-mono px-2 py-0.5 rounded text-slate-500">
            Total records: {rentRecords.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-450 uppercase tracking-widest border-b border-slate-200 font-bold text-[10px]">
                <th className="px-6 py-4.5">Receipt No</th>
                <th className="px-6 py-4.5">Tenant</th>
                <th className="px-6 py-4.5">Premise / Room</th>
                <th className="px-6 py-4.5">Month period</th>
                <th className="px-6 py-4.5">Amount Collected</th>
                <th className="px-6 py-4.5">Log Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {rentRecords.slice(0, 5).map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-650" id={`receipt-${record.id}`}>{record.receiptNo}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{lookUpTenantName(record.tenantId)}</td>
                  <td className="px-6 py-4">
                    <strong className="text-slate-800 font-semibold">{lookUpUnitNo(record.subUnitId)}</strong>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{lookUpPropertyName(record.propertyId)}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{record.monthString}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 direct-rent">
                    {settings.bdtSymbol} {record.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">{record.paymentDate}</td>
                </tr>
              ))}
              {rentRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-450">
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
