/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Property, SubUnit, PropertyCategory, DEFAULT_TRANSLATIONS, SystemSettings, MaintenanceLog } from "../types";
import { Building, LayoutGrid, Home, ShoppingBag, Briefcase, Plus, Search, Trash2, Edit3, Tag, Wrench, PhoneCall, CheckCircle, Clock, AlertCircle, Calendar, DollarSign, Upload, Image } from "lucide-react";

interface PropertyManagerProps {
  properties: Property[];
  subUnits: SubUnit[];
  settings: SystemSettings;
  onAddProperty: (p: Property) => void;
  onAddSubUnit: (u: SubUnit) => void;
  onDeleteProperty: (id: string) => void;
  onDeleteSubUnit: (id: string) => void;
  maintenanceLogs: MaintenanceLog[];
  onAddMaintenanceLog: (log: MaintenanceLog) => void;
  onDeleteMaintenanceLog: (id: string) => void;
  onUpdateMaintenanceStatus: (id: string, status: "Pending" | "In Progress" | "Completed") => void;
  lang: "en" | "bn";
}

export default function PropertyManager({
  properties,
  subUnits,
  settings,
  onAddProperty,
  onAddSubUnit,
  onDeleteProperty,
  onDeleteSubUnit,
  maintenanceLogs = [],
  onAddMaintenanceLog,
  onDeleteMaintenanceLog,
  onUpdateMaintenanceStatus,
  lang,
}: PropertyManagerProps) {
  const t = DEFAULT_TRANSLATIONS[lang];

  // Selected property for Sub-unit view/add
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || "");
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // Form states - Property
  const [propName, setPropName] = useState("");
  const [propCategory, setPropCategory] = useState<PropertyCategory>("Flat");
  const [propAddress, setPropAddress] = useState("");
  const [propImageUrl, setPropImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(lang === "bn" ? "অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png ইত্যাদি) আপলোড করুন" : "Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPropImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Form states - Sub-unit
  const [unitNo, setUnitNo] = useState("");
  const [unitRent, setUnitRent] = useState(15000);
  const [unitDeposit, setUnitDeposit] = useState(30000);
  const [unitStatus, setUnitStatus] = useState<"Vacant" | "Occupied" | "Maintenance">("Vacant");

  // Form states - Maintenance Log
  const [logSubUnitId, setLogSubUnitId] = useState("");
  const [logRepairTask, setLogRepairTask] = useState("");
  const [logCost, setLogCost] = useState(0);
  const [logTechName, setLogTechName] = useState("");
  const [logTechPhone, setLogTechPhone] = useState("");
  const [logStatus, setLogStatus] = useState<"Pending" | "In Progress" | "Completed">("Pending");
  const [logFilterSubUnit, setLogFilterSubUnit] = useState<string>("All");

  const handleSubmitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName) return;

    const newProp: Property = {
      id: "prop_" + Math.random().toString(36).substr(2, 9),
      name: propName,
      category: propCategory,
      address: propAddress,
      unitsCount: 0,
      imageUrl: propImageUrl,
    };

    onAddProperty(newProp);
    setSelectedPropertyId(newProp.id);
    setPropName("");
    setPropAddress("");
    setPropImageUrl("");
    setShowAddPropModal(false);
  };

  const handleSubmitUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNo || !selectedPropertyId) return;

    const parentProp = properties.find((p) => p.id === selectedPropertyId);
    if (!parentProp) return;

    const newUnit: SubUnit = {
      id: "unit_" + Math.random().toString(36).substr(2, 9),
      propertyId: selectedPropertyId,
      unitNo,
      category: parentProp.category,
      monthlyRent: Number(unitRent),
      securityDeposit: Number(unitDeposit),
      status: unitStatus,
    };

    onAddSubUnit(newUnit);
    setUnitNo("");
    setShowAddUnitModal(false);
  };

  const handleSubmitMaintenanceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logRepairTask || !selectedPropertyId || !logSubUnitId) return;

    const newLog: MaintenanceLog = {
      id: "log_" + Math.random().toString(36).substr(2, 9),
      propertyId: selectedPropertyId,
      subUnitId: logSubUnitId,
      repairTask: logRepairTask,
      cost: Number(logCost) || 0,
      completedStatus: logStatus,
      technicianName: logTechName || "N/A",
      technicianPhone: logTechPhone || "N/A",
      loggedDate: new Date().toISOString().split("T")[0],
    };

    onAddMaintenanceLog(newLog);
    setLogSubUnitId("");
    setLogRepairTask("");
    setLogCost(0);
    setLogTechName("");
    setLogTechPhone("");
    setLogStatus("Pending");
    setShowAddLogModal(false);
  };

  const getCategoryIcon = (cat: PropertyCategory) => {
    switch (cat) {
      case "House":
        return <Home className="h-4 w-4" />;
      case "Flat":
        return <LayoutGrid className="h-4 w-4" />;
      case "Shop":
        return <ShoppingBag className="h-4 w-4" />;
      case "Office":
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (cat: PropertyCategory) => {
    switch (cat) {
      case "House":
        return t.house;
      case "Flat":
        return t.flat;
      case "Shop":
        return t.shop;
      case "Office":
        return t.office;
    }
  };

  const getPropertyImage = (p: Property) => {
    if (p.imageUrl && p.imageUrl.trim().length > 0) {
      return p.imageUrl;
    }
    switch (p.category) {
      case "House":
        return "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";
      case "Flat":
        return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
      case "Shop":
        return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
      case "Office":
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
      default:
        return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
    }
  };

  // Filter properties based on search and selected category
  const filteredProperties = properties.filter((p) => {
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const currentPropertyUnits = subUnits.filter((u) => u.propertyId === (activeProperty?.id || ""));

  const activePropertyLogs = maintenanceLogs.filter((log) => log.propertyId === (activeProperty?.id || ""));

  const filteredLogs = activePropertyLogs.filter((log) => logFilterSubUnit === "All" || log.subUnitId === logFilterSubUnit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {lang === "bn" ? "🏢 ক্যাটাগরি অনুযায়ী সম্পত্তি ও সাব-ইউনিটসমূহ" : "🏢 Categorized Properties & Units"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "bn"
              ? "বাড়ি, ফ্ল্যাট, বাণিজ্যিক দোকান এবং অফিসগুলোকে আলাদা ক্যাটাগরিতে অন্তর্ভুক্ত করে প্রতিটির ভাড়ার হিসাব রাখুন।"
              : "Group products category-wise: Houses, Flats, Shops, and Offices, with specific rental rules."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddPropModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t.addProperty}
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl max-w-2xl">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            categoryFilter === "All"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          {lang === "bn" ? "সব ক্যাটাগরি" : "All Properties"}
        </button>
        {(["House", "Flat", "Shop", "Office"] as PropertyCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              categoryFilter === cat
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            {getCategoryIcon(cat)}
            <span>{getCategoryLabel(cat)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col space-y-4 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
              {lang === "bn" ? "বিল্ডিং / প্রোপার্টি সমূহ" : "Properties List"}
            </h3>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">
              {filteredProperties.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl">
                {t.noData}
              </div>
            ) : (
              filteredProperties.map((p) => {
                const countOfUnits = subUnits.filter((u) => u.propertyId === p.id).length;
                const countOfVacant = subUnits.filter((u) => u.propertyId === p.id && u.status === "Vacant").length;
                const isSelected = p.id === (activeProperty?.id || "");

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPropertyId(p.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/20 shadow-xs"
                        : "border-slate-100 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail photo */}
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100/50">
                        <img
                          src={getPropertyImage(p)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 p-1 rounded-tl-md bg-slate-900/85 text-[8px] text-white font-bold leading-none">
                          {getCategoryLabel(p.category)}
                        </span>
                      </div>

                      {/* Info & count */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 leading-tight">{p.name}</h4>
                          <button
                            title={t.delete}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(t.confirmDelete)) {
                                onDeleteProperty(p.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.address}</p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-500">
                          <span>
                            {lang === "bn" ? "ইউনিট" : "Units"}: <strong className="text-slate-700 font-extrabold">{countOfUnits}</strong>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md font-bold ${countOfVacant > 0 ? "bg-emerald-50 text-emerald-700 font-extrabold" : "bg-slate-50 text-slate-400"}`}>
                            {lang === "bn" ? "খালি" : "Vacant"}: {countOfVacant}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Subunits for selected Property */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2 shadow-sm flex flex-col space-y-6">
          {activeProperty ? (
            <>
              {/* Premium Widescreen Property Hero Banner */}
              <div className="relative h-56 md:h-64 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <img
                  src={getPropertyImage(activeProperty)}
                  alt={activeProperty.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual shade overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Info and button */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                        {getCategoryLabel(activeProperty.category)}
                      </span>
                      <span className="text-[10px] font-mono bg-white/20 text-white backdrop-blur-xs px-2 py-0.5 rounded-lg font-bold">
                        ID: {activeProperty.id}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">{activeProperty.name}</h2>
                    <p className="text-xs text-slate-200 flex items-center gap-1 font-medium">
                      <span>📍</span>
                      {activeProperty.address}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      onClick={() => setShowAddUnitModal(true)}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-indigo-600" />
                      <span>{t.addUnit}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Stat Dashboard Row */}
              {(() => {
                const totalPotentialRent = currentPropertyUnits.reduce((acc, curr) => acc + curr.monthlyRent, 0);
                const occupiedUnitsCount = currentPropertyUnits.filter((u) => u.status === "Occupied").length;
                const vacantUnitsCount = currentPropertyUnits.filter((u) => u.status === "Vacant").length;
                const maintenanceUnitsCount = currentPropertyUnits.filter((u) => u.status === "Maintenance").length;
                const occupancyPercent = currentPropertyUnits.length > 0 
                  ? Math.round((occupiedUnitsCount / currentPropertyUnits.length) * 100) 
                  : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                    {/* Potential Rent income card */}
                    <div className="bg-slate-50/50 hover:bg-slate-100/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3 transition-colors text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-550 text-slate-500 font-bold tracking-tight">
                          {lang === "bn" ? "মাসিক রাজস্ব সক্ষমতা" : "Rent Capacity / mo"}
                        </span>
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <DollarSign className="h-4 w-4" />
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-indigo-500 uppercase font-black block leading-none">
                          {lang === "bn" ? "সম্ভাব্য ভাড়া" : "Potential rent"}
                        </span>
                        <div className="text-lg font-black text-slate-900 font-mono mt-1">
                          {settings.bdtSymbol} {totalPotentialRent.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Indicator gauge bar */}
                    <div className="bg-slate-50/50 hover:bg-slate-100/50 p-4 rounded-xl border border-slate-100/70 flex flex-col justify-between space-y-3 transition-colors text-left">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-550 text-slate-500 font-bold tracking-tight">
                            {lang === "bn" ? "ব্যবহারের হার" : "Occupancy Rate"}
                          </span>
                          <span className="text-xs font-extrabold font-mono text-indigo-600">
                            {occupancyPercent}%
                          </span>
                        </div>
                        {/* Custom progress bar */}
                        <div className="w-full bg-slate-200/50 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-350" 
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-450 text-slate-400 font-semibold">
                        {lang === "bn" 
                          ? `${currentPropertyUnits.length} টির মধ্যে ${occupiedUnitsCount} টি ফ্ল্যাট ভরাট` 
                          : `${occupiedUnitsCount} of ${currentPropertyUnits.length} units filled`}
                      </div>
                    </div>

                    {/* Multi-status counts mini matrix */}
                    <div className="bg-slate-50/50 hover:bg-slate-100/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between transition-colors space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-550 text-slate-500 font-bold tracking-tight">
                          {lang === "bn" ? "ইউনিট স্টেটাস" : "Status Matrix"}
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded">
                          {currentPropertyUnits.length} {lang === "bn" ? "মোট" : "Total"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-green-50 border border-green-100 rounded-lg p-1">
                          <span className="block text-[10px] font-bold text-green-700 leading-none">{occupiedUnitsCount}</span>
                          <span className="text-[8px] text-slate-400 font-medium tracking-tight block mt-1">{lang === "bn" ? "ভরাট" : "Live"}</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-1">
                          <span className="block text-[10px] font-bold text-blue-700 leading-none">{vacantUnitsCount}</span>
                          <span className="text-[8px] text-slate-400 font-medium tracking-tight block mt-1">{lang === "bn" ? "খালি" : "Vacant"}</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-1">
                          <span className="block text-[10px] font-bold text-amber-700 leading-none">{maintenanceUnitsCount}</span>
                          <span className="text-[8px] text-slate-400 font-medium tracking-tight block mt-1">{lang === "bn" ? "মেরামত" : "Maint."}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Subunits table representing categorization of units */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">{t.unitNo}</th>
                      <th className="pb-3 font-semibold">{t.monthlyRent}</th>
                      <th className="pb-3 font-semibold">{t.securityDeposit}</th>
                      <th className="pb-3 font-semibold">{t.status}</th>
                      <th className="pb-3 font-semibold text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentPropertyUnits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-slate-400 italic">
                          {lang === "bn"
                            ? "প্রোপার্টিতে কোনো ফ্ল্যাট বা দোকান সংজ্ঞায়িত করা নেই। ওপরের 'নতুন ইউনিট' বাটনে ক্লিক করে যোগ করুন।"
                            : "No active room, flat, or shop registered for this property yet. Click adding button above."}
                        </td>
                      </tr>
                    ) : (
                      currentPropertyUnits.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3.5">
                            <span className="font-semibold text-slate-800 font-mono">{u.unitNo}</span>
                          </td>
                          <td className="py-3.5 font-mono text-slate-950 font-semibold direct-rent">
                            {settings.bdtSymbol} {u.monthlyRent.toLocaleString()}
                          </td>
                          <td className="py-3.5 font-mono text-slate-500">
                            {settings.bdtSymbol} {u.securityDeposit.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-xs">
                            {u.status === "Vacant" ? (
                              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                                {t.vacant}
                              </span>
                            ) : u.status === "Occupied" ? (
                              <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md border border-green-200">
                                {t.occupied}
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                {t.maintenance}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              title={t.delete}
                              onClick={() => {
                                if (confirm(t.confirmDelete)) {
                                  onDeleteSubUnit(u.id);
                                }
                              }}
                              className="text-slate-300 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center space-y-3">
              <Building className="h-10 w-10 text-slate-300" />
              <span>
                {lang === "bn"
                  ? "বাড়ি বা ফ্ল্যাট লিস্টিং যোগ করে শুরু করুন।"
                  : "Create properties on the left menu column first to view units."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Log Section */}
      {activeProperty && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-slate-100 text-indigo-650 text-indigo-700">
                <Wrench className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{t.maintenanceLogs}</span>
                  <span className="text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-lg">
                    {activeProperty.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === "bn"
                    ? "এই প্রোপার্টির প্রতিটি ফ্ল্যাট ও দোকানের টাস্ক, খরচ, অবস্থা এবং টেকনিশিয়ান বিবরণী।"
                    : "Track renovation, plumber/electrician logs, repairs, costs & status for each subunit of this building."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Dropdown */}
              <select
                value={logFilterSubUnit}
                onChange={(e) => setLogFilterSubUnit(e.target.value)}
                className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-505 bg-slate-50 font-medium text-slate-700 cursor-pointer"
              >
                <option value="All">{lang === "bn" ? "সকল ফ্ল্যাট/দোকান" : "All Sub-units"}</option>
                {currentPropertyUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNo}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (currentPropertyUnits.length > 0) {
                    setLogSubUnitId(currentPropertyUnits[0].id);
                  } else {
                    setLogSubUnitId("");
                  }
                  setShowAddLogModal(true);
                }}
                disabled={currentPropertyUnits.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title={currentPropertyUnits.length === 0 ? "Add subunits first" : "Log a repair task"}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.addMaintenanceLog}</span>
              </button>
            </div>
          </div>

          {/* Maintenance Logs List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">{lang === "bn" ? "ইউনিট / ফ্ল্যাট" : "Unit No."}</th>
                  <th className="pb-3 font-semibold">{t.repairTask}</th>
                  <th className="pb-3 font-semibold">{t.costAmount}</th>
                  <th className="pb-3 font-semibold">{t.technicianName}</th>
                  <th className="pb-3 font-semibold">{t.loggedDate}</th>
                  <th className="pb-3 font-semibold">{t.completionStatus}</th>
                  <th className="pb-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400 italic">
                      {lang === "bn"
                        ? "কোনো রক্ষণাবেক্ষণ বা মেরামতের লগ রেকর্ড পাওয়া যায়নি।"
                        : "No maintenance logs cataloged for this property/subunit."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const unitName = subUnits.find((su) => su.id === log.subUnitId)?.unitNo || "N/A";
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold font-mono text-indigo-700">{unitName}</td>
                        <td className="py-3.5 font-medium text-slate-800 max-w-[200px] break-words">{log.repairTask}</td>
                        <td className="py-3.5 font-mono font-bold text-slate-900">
                          {settings.bdtSymbol} {log.cost.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-xs text-slate-500">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">{log.technicianName}</span>
                            {log.technicianPhone && log.technicianPhone !== "N/A" && (
                              <a href={`tel:${log.technicianPhone}`} className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline font-mono mt-0.5">
                                <PhoneCall className="h-2.5 w-2.5" /> {log.technicianPhone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-400 font-mono text-[10px]">{log.loggedDate}</td>
                        <td className="py-3.5">
                          <select
                            value={log.completedStatus}
                            onChange={(e) => onUpdateMaintenanceStatus(log.id, e.target.value as any)}
                            className={`px-2 py-1 text-[10px] font-extrabold rounded-md border cursor-pointer ${
                              log.completedStatus === "Completed"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : log.completedStatus === "In Progress"
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            <option value="Pending">{lang === "bn" ? "অপেক্ষমান (Pending)" : "Pending"}</option>
                            <option value="In Progress">{lang === "bn" ? "চলতি কাজ (In Progress)" : "In Progress"}</option>
                            <option value="Completed">{lang === "bn" ? "সম্পন্ন (Completed)" : "Completed"}</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            title={t.delete}
                            onClick={() => {
                              if (confirm(t.confirmDelete)) {
                                onDeleteMaintenanceLog(log.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL - Add Property */}
      {showAddPropModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-lg">
                {lang === "bn" ? "নতুন সম্পত্তি / বিল্ডিং যোগ করুন" : "Add New Property Listing"}
              </h3>
              <button
                onClick={() => setShowAddPropModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitProperty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t.propertyName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "bn" ? "উদা: নূর টাওয়ার, গুলশান" : "e.g. Noor Tower, Gulshan"}
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.propertyCategory}
                  </label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value as PropertyCategory)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Flat">{t.flat}</option>
                    <option value="House">{t.house}</option>
                    <option value="Shop">{t.shop}</option>
                    <option value="Office">{t.office}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t.address}
                </label>
                <input
                  type="text"
                  placeholder={lang === "bn" ? "উদা: রোড ৫, সেক্টর ১১, ঢাকা" : "e.g. Sector-11, Uttara, Dhaka"}
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-705 text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{t.propertyPhoto}</span>
                  <span className="text-[10px] text-slate-400 font-normal italic">({lang === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                </label>
                
                {propImageUrl ? (
                  /* Uploaded Image Preview */
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36 flex items-center justify-center group shadow-xs">
                    <img
                      src={propImageUrl}
                      alt="Property Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPropImageUrl("")}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        {lang === "bn" ? "ফটো মুছে ফেলুন" : "Remove Photo"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and Drop Dropzone */
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center ${
                      dragActive
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-slate-300 bg-slate-50/50 hover:bg-slate-55 hover:bg-slate-50 hover:border-indigo-400"
                    }`}
                  >
                    <input
                      id="property-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="property-photo-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2 w-full h-full"
                    >
                      <div className="p-3 bg-white rounded-full shadow-xs border border-slate-100 text-indigo-600">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">
                          {lang === "bn" ? "ছবি আপলোড করতে এখানে ক্লিক করুন" : "Click to select and upload a picture"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {lang === "bn" ? "অথবা ড্র্যাগ করে ফাইলটি এখানে ছেড়ে দিন" : "or drag and drop your photo here"}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {lang === "bn" ? "সমর্থিত ফর্ম্যাট: JPG, PNG, WEBP" : "Supported: JPG, PNG, WEBP"}
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 mt-2 leading-normal">
                  {t.propertyPhotoHelp}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPropModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Add Sub-unit */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-lg">
                {t.addUnit} ({activeProperty?.name})
              </h3>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "রুম / ফ্ল্যাট / দোকান নং" : "Unit / Room / Shop Number"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "bn" ? "উদা: Flat B-4, Shop G-5" : "e.g. Flat B-4, Shop G-5"}
                  value={unitNo}
                  onChange={(e) => setUnitNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.monthlyRent} ({settings.bdtSymbol})
                  </label>
                  <input
                    type="number"
                    value={unitRent}
                    onChange={(e) => setUnitRent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.securityDeposit} ({settings.bdtSymbol})
                  </label>
                  <input
                    type="number"
                    value={unitDeposit}
                    onChange={(e) => setUnitDeposit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "ভাড়ার বর্তমান অবস্থা" : "Initial Sub-unit Status"}
                </label>
                <select
                  value={unitStatus}
                  onChange={(e) => setUnitStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                >
                  <option value="Vacant">{t.vacant}</option>
                  <option value="Occupied">{t.occupied}</option>
                  <option value="Maintenance">{t.maintenance}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Add Maintenance Log */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-600" />
                <span>{t.addMaintenanceLog}</span>
              </h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitMaintenanceLog} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {lang === "bn" ? "সাব-ইউনিট / ফ্ল্যাট নির্বাচন করুন" : "Associated Sub-Unit / Flat"} *
                </label>
                <select
                  required
                  value={logSubUnitId}
                  onChange={(e) => setLogSubUnitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium"
                >
                  <option value="" disabled>{lang === "bn" ? "ফ্ল্যাট বা রুম সিলেক্ট করুন" : "Select subunit..."}</option>
                  {currentPropertyUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.repairTask} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "bn" ? "উদা: মোটর চেঞ্জ, বেসিন পাইপ মেরামতি" : "e.g. Basins, motor water line fix, electrical spark"}
                  value={logRepairTask}
                  onChange={(e) => setLogRepairTask(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.costAmount} ({settings.bdtSymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={logCost}
                    onChange={(e) => setLogCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.completionStatus}
                  </label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  >
                    <option value="Pending">{lang === "bn" ? "অপেক্ষমান (Pending)" : "Pending"}</option>
                    <option value="In Progress">{lang === "bn" ? "চলতি কাজ (In Progress)" : "In Progress"}</option>
                    <option value="Completed">{lang === "bn" ? "সম্পন্ন (Completed)" : "Completed"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.technicianName}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liton Miah"
                    value={logTechName}
                    onChange={(e) => setLogTechName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.technicianPhone}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 01712000000"
                    value={logTechPhone}
                    onChange={(e) => setLogTechPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
