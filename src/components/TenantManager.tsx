/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Tenant, DEFAULT_TRANSLATIONS, SystemSettings } from "../types";
import { Users, Search, Plus, UserPlus, Phone, CreditCard, Home, MapPin, ShieldAlert, Trash2 } from "lucide-react";

interface TenantManagerProps {
  tenants: Tenant[];
  settings: SystemSettings;
  onAddTenant: (t: Tenant) => void;
  onDeleteTenant: (id: string) => void;
  lang: "en" | "bn";
}

export default function TenantManager({
  tenants,
  settings,
  onAddTenant,
  onDeleteTenant,
  lang,
}: TenantManagerProps) {
  const t = DEFAULT_TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nidOrPassport, setNidOrPassport] = useState("");
  const [email, setEmail] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [familyMembersCount, setFamilyMembersCount] = useState(1);
  const [advancedPayment, setAdvancedPayment] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !nidOrPassport) return;

    const newTenant: Tenant = {
      id: "ten_" + Math.random().toString(36).substr(2, 9),
      name,
      phone,
      nidOrPassport,
      email: email || undefined,
      permanentAddress,
      emergencyContact,
      familyMembersCount: Number(familyMembersCount),
      advancedPayment: Number(advancedPayment),
    };

    onAddTenant(newTenant);
    setName("");
    setPhone("");
    setNidOrPassport("");
    setEmail("");
    setPermanentAddress("");
    setEmergencyContact("");
    setFamilyMembersCount(1);
    setAdvancedPayment(0);
    setShowAddModal(false);
  };

  const filteredTenants = tenants.filter(
    (ten) =>
      ten.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ten.phone.includes(searchQuery) ||
      ten.nidOrPassport.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {lang === "bn" ? "👥 ভাড়াটিয়া প্রোফাইল ও পরিচিতি" : "👥 Tenant Records & NID Identification"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "bn"
              ? "বাসা এবং ফ্ল্যাটে যারা ভাড়া আছেন তাদের মোবাইল নং, জাতীয় পরিচয়পত্র (NID) নম্বর ও স্থায়ী ঠিকানা সংরক্ষণ করুন।"
              : "Store identification credentials, permanent address data, emergency contacts, and deposits."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          {t.addTenant}
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-2xs gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={lang === "bn" ? "ভাড়াটিয়ার নাম, মোবাইল বা NID দিয়ে খুঁজুন..." : "Search tenants..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
          {lang === "bn" ? "সর্বমোট ভাড়াটিয়া" : "Total Tenants Registered"}: <strong>{tenants.length}</strong>
        </span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.length === 0 ? (
          <div className="col-span-full text-center py-16 text-xs text-slate-400 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center space-y-3">
            <Users className="h-8 w-8 text-slate-300" />
            <span>{t.noData}</span>
          </div>
        ) : (
          filteredTenants.map((ten) => (
            <div key={ten.id} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs relative hover:shadow-xs transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {ten.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{ten.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {ten.id}</p>
                  </div>
                </div>

                <button
                  title={t.delete}
                  onClick={() => {
                    if (confirm(t.confirmDelete)) {
                      onDeleteTenant(ten.id);
                    }
                  }}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Data points */}
              <div className="space-y-2 border-t border-slate-50 pt-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono font-semibold">{ten.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>NID: <strong className="font-mono text-slate-800">{ten.nidOrPassport}</strong></span>
                </div>
                {ten.email && (
                  <div className="text-slate-500 font-xs pl-5.5 truncate font-mono">
                    {ten.email}
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 text-[11px] leading-relaxed">
                    {ten.permanentAddress || "Permanant address not logged"}
                  </span>
                </div>
              </div>

              {/* Advanced info and statistics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-[10px] font-mono text-slate-500 text-center">
                <div className="border-r border-slate-200">
                  <span className="block text-slate-400 uppercase text-[9px]">{lang === "bn" ? "সদস্য সংখ্যা" : "Family Size"}</span>
                  <strong className="text-slate-800 font-sans text-xs">{ten.familyMembersCount || 1} Person(s)</strong>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px]">{lang === "bn" ? "অগ্রিম জমা" : "Advance Paid"}</span>
                  <strong className="text-emerald-700 font-sans text-xs">{settings.bdtSymbol} {ten.advancedPayment.toLocaleString()}</strong>
                </div>
              </div>

              {ten.emergencyContact && (
                <div className="bg-amber-50 text-amber-900 text-[10px] p-2 rounded-lg flex items-center gap-1.5 border border-amber-100/60">
                  <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="truncate">
                    {lang === "bn" ? "জরুরী যোগাযোগ" : "Emergency"}: <strong>{ten.emergencyContact}</strong>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-lg">
                {lang === "bn" ? "নতুন ভাড়াটিয়া নিবন্ধন" : "Register Rentee/Tenant"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.tenantName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "bn" ? "উদা: আল-মামুন" : "e.g. Al-Mamun"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={lang === "bn" ? "মোবাইল নম্বর" : "01xxxxxxxxx"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.nid} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "bn" ? "এনআইডি বা পাসপোর্ট নং" : "13-17 Digit Identity Code"}
                    value={nidOrPassport}
                    onChange={(e) => setNidOrPassport(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="tenant@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t.permanentAddress}
                </label>
                <textarea
                  placeholder={lang === "bn" ? "গ্রাম, ডাকঘর, থানা, জেলা" : "Permanent Village/District Address details"}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.emergencyContact} (মোবাইল নং)
                  </label>
                  <input
                    type="text"
                    placeholder="01xxxxxxxxx (Emergency)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.numberOfFamily}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={familyMembersCount}
                    onChange={(e) => setFamilyMembersCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  অগ্রিম সিকিউরিটি জমা / জামানত টাকার পরিমাণ ({settings.bdtSymbol})
                </label>
                <input
                  type="number"
                  value={advancedPayment}
                  onChange={(e) => setAdvancedPayment(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
}
