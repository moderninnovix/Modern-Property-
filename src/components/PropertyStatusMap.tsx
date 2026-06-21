/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Property, SubUnit, SystemSettings } from "../types";
import { Building2, Info, CheckSquare, Sparkles, AlertCircle, LayoutGrid, Eye } from "lucide-react";

interface PropertyStatusMapProps {
  properties: Property[];
  subUnits: SubUnit[];
  settings: SystemSettings;
  lang: "en" | "bn";
}

export default function PropertyStatusMap({
  properties,
  subUnits,
  settings,
  lang,
}: PropertyStatusMapProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    properties[0]?.id || null
  );

  // Translate labels
  const t = {
    title: lang === "bn" ? "🏢 সম্পত্তি দখল স্থিতি চিত্র (Property Map)" : "🏢 Property Occupancy Status Map",
    subtitle: lang === "bn" 
      ? "ভবন সমূহের দখলদারিত্ব ও ভ্যাকেন্সি রিয়েল-টাইম গ্রিড ভিউ" 
      : "Real-time occupancy mapping and grid layout of buildings",
    legendFully: lang === "bn" ? "সম্পূর্ণ বুকড / দখলকৃত" : "Fully Occupied (100%)",
    legendPartial: lang === "bn" ? "আংশিক খালি / ভাড়া করা" : "Partial Occupied",
    legendVacant: lang === "bn" ? "সম্পূর্ণ খালি / ভ্যাকেন্ট" : "Vacant / No Tenants (0%)",
    unitDetails: lang === "bn" ? "ইউনিটের বিবরণ ও অবস্থা" : "Sub-Units Blueprint Layout",
    noProperty: lang === "bn" ? "কোন সম্পত্তি বা ডাটা পাওয়া যায়নি" : "No property records registered yet.",
    clickPrompt: lang === "bn" ? "বিস্তারিত দেখতে যেকোনো ভবনে ক্লিক করুন" : "Click on any building block to view its floor plan layout",
    unitNo: lang === "bn" ? "ইউনিট নম্বর" : "Unit No",
    rentAmount: lang === "bn" ? "মাসিক ভাড়া" : "Rent",
    depositAmount: lang === "bn" ? "জামানত" : "Security Dep.",
    statusLabel: lang === "bn" ? "অবস্থা" : "Current Status",
    totalUnits: lang === "bn" ? "মোট ইউনিট" : "Total Units",
    occupiedUnits: lang === "bn" ? "ভাড়াকৃত" : "Occupied",
    vacantUnits: lang === "bn" ? "খালি" : "Vacant",
    maintUnits: lang === "bn" ? "মেরামত" : "Maintenance",
    houseNum: lang === "bn" ? "ভবন" : "Building",
  };

  // Helper to calculate occupancy status color for a property
  const getPropertyStatus = (propertyId: string) => {
    const units = subUnits.filter((su) => su.propertyId === propertyId);
    if (units.length === 0) {
      return {
        status: "Vacant" as const,
        colorClass: "bg-rose-500 text-white border-rose-650",
        bgLight: "bg-rose-50",
        textColor: "text-rose-700",
        label: lang === "bn" ? "সম্পূর্ণ খালি" : "Vacant",
        occupiedPct: 0,
        occupiedCount: 0,
        total: 0,
      };
    }

    const occupiedCount = units.filter((u) => u.status === "Occupied").length;
    const occupiedPct = Math.round((occupiedCount / units.length) * 100);

    if (occupiedCount === units.length) {
      return {
        status: "Fully" as const,
        colorClass: "bg-emerald-500 text-white border-emerald-650",
        bgLight: "bg-emerald-50",
        textColor: "text-emerald-700",
        label: lang === "bn" ? "সম্পূর্ণ বুকড" : "Fully Occupied",
        occupiedPct,
        occupiedCount,
        total: units.length,
      };
    } else if (occupiedCount === 0) {
      return {
        status: "Vacant" as const,
        colorClass: "bg-rose-500 text-white border-rose-650",
        bgLight: "bg-rose-50",
        textColor: "text-rose-700",
        label: lang === "bn" ? "সম্পূর্ণ খালি" : "Vacant",
        occupiedPct,
        occupiedCount,
        total: units.length,
      };
    } else {
      return {
        status: "Partial" as const,
        colorClass: "bg-amber-500 text-white border-amber-650",
        bgLight: "bg-amber-50",
        textColor: "text-amber-700",
        label: lang === "bn" ? "আংশিক বুকড" : "Partial",
        occupiedPct,
        occupiedCount,
        total: units.length,
      };
    }
  };

  // Selected details
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedUnits = selectedProperty
    ? subUnits.filter((u) => u.propertyId === selectedProperty.id)
    : [];
  const selectedStatus = selectedPropertyId ? getPropertyStatus(selectedPropertyId) : null;

  // Let's count totals
  const propertyStatusCounts = properties.reduce(
    (acc, p) => {
      const info = getPropertyStatus(p.id);
      acc[info.status]++;
      return acc;
    },
    { Fully: 0, Partial: 0, Vacant: 0 }
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      {/* Header with Title and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1 text-xs font-bold uppercase rounded bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>MAP VIEW</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
              Live status mapping
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mt-1.5 racking-tight">
            {t.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{t.subtitle}</p>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 shadow-3xs inline-block"></span>
            <span className="text-slate-650">{t.legendFully}</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
              {propertyStatusCounts.Fully}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-600 shadow-3xs inline-block"></span>
            <span className="text-slate-650">{t.legendPartial}</span>
            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
              {propertyStatusCounts.Partial}
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600 shadow-3xs inline-block"></span>
            <span className="text-slate-650">{t.legendVacant}</span>
            <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
              {propertyStatusCounts.Vacant}
            </span>
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Building2 className="h-10 w-10 text-slate-350 mx-auto mb-2" />
          <p className="text-xs text-slate-450 font-sans italic">{t.noProperty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Grid: Properties blocks */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-450 font-bold uppercase tracking-wider">
              <span>{t.houseNum} Blocks ({properties.length})</span>
              <span className="text-indigo-650 font-semibold">{t.clickPrompt}</span>
            </div>

            {/* D3-style CSS grid block matrix representation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4.5">
              {properties.map((p) => {
                const info = getPropertyStatus(p.id);
                const isSelected = selectedPropertyId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPropertyId(p.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 select-none ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/10 shadow-md translate-y-[-2px] bg-slate-50/50"
                        : "border-slate-200 hover:border-slate-400 bg-white hover:translate-y-[-1px] hover:shadow-xs"
                    }`}
                  >
                    {/* Isometric tag block */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`inline-block w-4.5 h-4.5 rounded-md border text-center font-mono font-bold text-[9px] flex items-center justify-center ${info.colorClass}`}>
                        🏢
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="pr-6">
                        <strong className="block text-sm font-bold text-slate-800 tracking-tight truncate leading-tight uppercase">
                          {p.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 mt-1 block tracking-wider font-semibold font-mono">
                          {p.category.toUpperCase()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">
                            Occupancy
                          </span>
                          <strong className="text-xs font-extrabold text-slate-800 font-mono">
                            {info.occupiedPct}%
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">
                            Units
                          </span>
                          <strong className="text-xs font-semibold text-slate-700 font-mono">
                            {info.occupiedCount} / {info.total}
                          </strong>
                        </div>
                      </div>

                      {/* Mini Visual occupancy bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            info.status === "Fully"
                              ? "bg-emerald-500"
                              : info.status === "Partial"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${info.occupiedPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Grid Detail Panel: Floor-plan/Grid matrix */}
          <div className="lg:col-span-2 bg-slate-50/80 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between space-y-4">
            {selectedProperty && selectedStatus ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200/60 pb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight uppercase">
                      {selectedProperty.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 font-mono">
                      📍 {selectedProperty.address}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border ${
                    selectedStatus.status === "Fully" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                    selectedStatus.status === "Partial" ? "bg-amber-50 text-amber-800 border-amber-200" :
                    "bg-rose-50 text-rose-800 border-rose-200"
                  }`}>
                    {selectedStatus.label}
                  </span>
                </div>

                {/* Sub-units visual blueprint grid map */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{t.unitDetails}</span>
                  </span>

                  {selectedUnits.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-lg border border-slate-200/40 italic text-[11px] text-slate-450">
                      {lang === "bn" ? "এই ভবনে কোনো সাব-ইউনিট যুক্ত করা নেই" : "No sub-units defined for this building yet."}
                    </div>
                  ) : (
                    <>
                      {/* Grid representation of apartment blueprint slots */}
                      <div className="grid grid-cols-4 gap-2">
                        {selectedUnits.map((u) => {
                          const statusColor = 
                            u.status === "Occupied" ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                            u.status === "Maintenance" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                            "bg-slate-200 hover:bg-slate-300 text-slate-700";
                          return (
                            <div
                              key={u.id}
                              className={`p-2.5 rounded-lg text-center text-[10px] font-extrabold transition-all cursor-pointer font-mono shadow-3xs truncate select-none border border-black/5 ${statusColor}`}
                              title={`${u.unitNo} - ${u.status}`}
                            >
                              {u.unitNo}
                            </div>
                          );
                        })}
                      </div>

                      {/* Small inline sub-unit info table for list view */}
                      <div className="bg-white rounded-xl border border-slate-200/50 max-h-[140px] overflow-y-auto divide-y divide-slate-100 shadow-3xs mt-2 scrollbar-thin">
                        {selectedUnits.map((u) => (
                          <div key={u.id} className="p-2 flex items-center justify-between text-[11px] hover:bg-slate-50/50">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                u.status === "Occupied" ? "bg-emerald-500" :
                                u.status === "Maintenance" ? "bg-amber-500" : "bg-slate-400"
                              }`}></span>
                              <span>{u.unitNo}</span>
                            </div>
                            <div className="text-slate-500 font-mono text-[10px]">
                              <span>{settings.bdtSymbol}{u.monthlyRent.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 italic text-slate-400 text-xs">
                {t.clickPrompt}
              </div>
            )}

            {/* Micro blueprint guide footer */}
            {selectedProperty && (
              <div className="bg-white/80 p-3 rounded-lg border border-slate-200/40 text-[10px] text-slate-600 space-y-2 font-sans">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider pb-1 border-b border-slate-100">
                  <Info className="h-3 w-3 text-indigo-505 text-indigo-500" />
                  <span>Interactive Blueprint Guide</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-semibold text-center mt-1">
                  <div className="bg-emerald-50 text-emerald-800 rounded py-0.5 border border-emerald-100">
                    🟢 {t.occupiedUnits}
                  </div>
                  <div className="bg-slate-100 text-slate-650 rounded py-0.5 border border-slate-200">
                    ⚪ {t.vacantUnits}
                  </div>
                  <div className="bg-amber-50 text-amber-800 rounded py-0.5 border border-amber-100">
                    🟡 {t.maintUnits}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
