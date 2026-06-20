/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RentCollectionRecord, LicenseAgreement, Property, SubUnit, Tenant, SystemSettings, DEFAULT_TRANSLATIONS, UserProfile } from "../types";
import { DollarSign, Plus, Printer, Search, Calendar, FileCheck2, UserCheck, Smartphone, CheckSquare, Sparkles } from "lucide-react";

interface RentCollectionProps {
  rentRecords: RentCollectionRecord[];
  agreements: LicenseAgreement[];
  properties: Property[];
  subUnits: SubUnit[];
  tenants: Tenant[];
  settings: SystemSettings;
  onAddRentRecord: (record: RentCollectionRecord) => void;
  lang: "en" | "bn";
  currentUser?: UserProfile;
}

export default function RentCollection({
  rentRecords,
  agreements,
  properties,
  subUnits,
  tenants,
  settings,
  onAddRentRecord,
  lang,
  currentUser,
}: RentCollectionProps) {
  const t = DEFAULT_TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Partial" | "Unpaid">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<RentCollectionRecord | null>(null);

  // Form Fields
  const [formLeaseId, setFormLeaseId] = useState("");
  const [formMonth, setFormMonth] = useState("2026-06");
  const [formPaid, setFormPaid] = useState(15000);
  const [formDue, setFormDue] = useState(0);
  const [formMethod, setFormMethod] = useState<RentCollectionRecord["paymentMethod"]>("Bkash");
  const [formStatus, setFormStatus] = useState<RentCollectionRecord["status"]>("Paid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeaseId || !formMonth) return;

    // Find lease
    const l = agreements.find((lease) => lease.id === formLeaseId);
    if (!l) return;

    const receiptNo = "REC-B-" + Math.floor(100000 + Math.random() * 900000);

    const newRec: RentCollectionRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      leaseId: formLeaseId,
      subUnitId: l.subUnitId,
      propertyId: l.propertyId,
      tenantId: l.tenantId,
      monthString: formMonth,
      amountPaid: Number(formPaid),
      amountDue: Number(formDue),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: formMethod,
      status: formStatus,
      receiverName: settings.ownerNameEN,
      receiptNo,
    };

    onAddRentRecord(newRec);
    // Reset
    setFormLeaseId("");
    setShowAddModal(false);
  };

  // Lookups
  const getTenantName = (tid: string) => tenants.find((ten) => ten.id === tid)?.name || "Unknown Tenant";
  const getUnitNo = (uid: string) => subUnits.find((su) => su.id === uid)?.unitNo || "N/A";
  const getPropertyName = (pid: string) => properties.find((p) => p.id === pid)?.name || "N/A";

  const getStatusColor = (status: RentCollectionRecord["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-50 text-green-700 border-green-200 font-bold";
      case "Partial":
        return "bg-amber-50 text-amber-700 border-amber-200 font-bold";
      case "Unpaid":
        return "bg-red-50 text-red-700 border-red-200 font-bold";
    }
  };

  const getStatusLabel = (status: RentCollectionRecord["status"]) => {
    switch (status) {
      case "Paid":
        return t.paid;
      case "Partial":
        return t.partial;
      case "Unpaid":
        return t.unpaid;
    }
  };

  const activeLeaseList = agreements.filter((ag) => ag.status === "Active");

  const getTenantIdByEmail = (email?: string) => {
    if (email === "ariful@outlook.com") return "tenant_1";
    if (email === "modina.jw@gmail.com") return "tenant_2";
    if (email === "ceo@fintech.com.bd") return "tenant_3";
    return "";
  };

  const isTenant = currentUser?.role === "Tenant";
  const tenantId = getTenantIdByEmail(currentUser?.email);

  // Filters records
  const filteredRecords = rentRecords
    .filter((rec) => !isTenant || rec.tenantId === (tenantId || "tenant_1"))
    .filter((rec) => {
      const tName = getTenantName(rec.tenantId).toLowerCase();
      const uNo = getUnitNo(rec.subUnitId).toLowerCase();
      const pName = getPropertyName(rec.propertyId).toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = tName.includes(query) || uNo.includes(query) || pName.includes(query) || rec.receiptNo.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  return (
    <div className="space-y-6">
      {/* Printable Receipt Block */}
      {selectedReceiptForPrint && (
        <div className="hidden print:block p-8 bg-white text-slate-800 leading-relaxed text-xs border-2 border-slate-900 border-double max-w-2xl mx-auto space-y-6 animate-fade-in my-5">
          {/* Receipt Top Identity */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-4">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-950">
                {lang === "bn" ? settings.appNameBN : settings.appNameEN}
              </h1>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                Modern House & Rent Registry - Bangladesh
              </p>
              <p className="text-[11px] text-slate-800 mt-2">
                Landlord: <strong>{lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN}</strong> ({settings.contactPhone})
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-mono bg-slate-900 text-slate-100 px-3 py-1.5 rounded uppercase tracking-wider font-bold">
                Money Receipt
              </span>
              <p className="font-mono text-[10px] text-slate-600 pt-1">No: {selectedReceiptForPrint.receiptNo}</p>
            </div>
          </div>

          {/* Details segment */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[9px] block">Received From (Tenant)</span>
                <strong>{getTenantName(selectedReceiptForPrint.tenantId)}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase text-[9px] block">Rented Premise / Unit</span>
                <strong>{getPropertyName(selectedReceiptForPrint.propertyId)} • {getUnitNo(selectedReceiptForPrint.subUnitId)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Payment Date</span>
                <span>{selectedReceiptForPrint.paymentDate}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 text-[10px] block font-sans">Rent Period month</span>
                <span className="font-bold">{selectedReceiptForPrint.monthString}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block font-sans">Payment Method</span>
                <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">{selectedReceiptForPrint.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Calculation table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-widest text-[9px] pb-1.5">
                  <th className="py-1">Description / Particulars</th>
                  <th className="py-1 text-right">Amount ({settings.bdtSymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="text-slate-800">
                  <td className="py-2.5">
                    Monthly Ground Rent for <strong>{selectedReceiptForPrint.monthString}</strong>
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold">
                    {selectedReceiptForPrint.amountPaid.toLocaleString()}
                  </td>
                </tr>
                {selectedReceiptForPrint.amountDue > 0 && (
                  <tr className="text-rose-700 font-bold bg-rose-50/20">
                    <td className="py-2.5">
                      Outstanding Dues/Balance Carried Forward
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      {selectedReceiptForPrint.amountDue.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="font-bold text-slate-950 border-t-2 border-slate-300 text-sm">
                  <td className="py-3">Total Paid Amount</td>
                  <td className="py-3 text-right font-mono text-emerald-700">
                    {settings.bdtSymbol} {selectedReceiptForPrint.amountPaid.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Money in Words */}
          <div className="bg-emerald-50/20 p-2.5 rounded text-[10px] text-slate-600 font-sans italic border border-emerald-100/50">
            Note: Money received is valid and credited upon clear settlement. Thank you for your lease compliance.
          </div>

          {/* Signature sheets */}
          <div className="grid grid-cols-2 gap-4 pt-10 text-center font-semibold text-xs text-slate-700">
            <div className="border-t border-slate-300 pt-1.5">
              Tenant Acknowledgment Signature
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              Authorized Landlord Signature
            </div>
          </div>
        </div>
      )}

      {/* Primary Display Screen */}
      <div className="print:hidden space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
              {lang === "bn" ? "💵 ভাড়া কালেকশন ও বুকিং রসিদপত্র" : "💵 rent Payments & money Receipts"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {lang === "bn"
                ? "ভাড়া পরিশোধের হিসাব লিখুন, ক্যাশ বা মোবাইল ব্যাংকিং অনুযায়ী রসিদ প্রিন্ট করুন এবং পিডিএফ সংরক্ষণ করুন।"
                : "Log and compute collected bills. Filter by outstanding balances and trigger printing."}
            </p>
          </div>

          {!isTenant && (
            <button
              onClick={() => {
                if (activeLeaseList.length === 0) {
                  alert(lang === "bn" ? "প্রথমে ভাড়া চুক্তিপত্র (Agreement) তৈরি করুন!" : "Create an active lease agreement first!");
                  return;
                }
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t.addPayment}
            </button>
          )}
        </div>

        {/* Ledger filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-3xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === "All" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setStatusFilter("Paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === "Paid" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter("Partial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === "Partial" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Partial
            </button>
            <button
              onClick={() => setStatusFilter("Unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === "Unpaid" ? "bg-red-600 text-white" : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              Unpaid Dues
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === "bn" ? "রসিদ নং বা ভাড়াটিয়া দিয়ে খুঁজুন..." : "Filter collections..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Ledger list */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Receipt Invoice</th>
                  <th className="px-6 py-4">{t.tenantName}</th>
                  <th className="px-6 py-4">Premise Unit</th>
                  <th className="px-6 py-4">Bill period Date</th>
                  <th className="px-6 py-4">Money logged</th>
                  <th className="px-6 py-4">{t.status}</th>
                  <th className="px-6 py-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-xs text-slate-400">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                        {r.receiptNo}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block text-sm">{getTenantName(r.tenantId)}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold mt-0.5 inline-block uppercase text-center">{r.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="block text-slate-800 font-medium">{getUnitNo(r.subUnitId)}</span>
                          <span className="block text-[10px] text-slate-400">{getPropertyName(r.propertyId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-300" />
                          <span className="font-bold">{r.monthString}</span>
                        </div>
                        <div className="pl-5 text-[10px] text-slate-400">Paid: {r.paymentDate}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-900 space-y-0.5">
                        <div>Paid: <strong className="text-slate-950 font-bold font-sans text-sm inline-block direct-rent">{settings.bdtSymbol}{r.amountPaid.toLocaleString()}</strong></div>
                        {r.amountDue > 0 && <div className="text-rose-600 font-bold">Due: {settings.bdtSymbol}{r.amountDue.toLocaleString()}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border ${getStatusColor(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReceiptForPrint(r);
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>{t.printReceipt}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Collection Dialog modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {lang === "bn" ? "ভাড়া পরিশোধের তথ্য লিখুন" : "Log Tenant Rent Payment"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Active Lease select */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {lang === "bn" ? "ভাড়াটিয়া ও এগ্রিমেন্ট নির্বাচন" : "Active Lease Contract"} *
                  </label>
                  <select
                    required
                    value={formLeaseId}
                    onChange={(e) => {
                      setFormLeaseId(e.target.value);
                      const l = agreements.find((lease) => lease.id === e.target.value);
                      if (l) {
                        setFormPaid(l.monthlyRentAmount);
                        setFormDue(0);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="">-- Choose active lease info --</option>
                    {activeLeaseList.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {getTenantName(ag.tenantId)} • {getUnitNo(ag.subUnitId)} ({getPropertyName(ag.propertyId)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bill Month */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.month} *
                  </label>
                  <input
                    type="month"
                    required
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.paidAmount} ({settings.bdtSymbol})
                    </label>
                    <input
                      type="number"
                      required
                      value={formPaid}
                      onChange={(e) => setFormPaid(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.dueAmount} ({settings.bdtSymbol})
                    </label>
                    <input
                      type="number"
                      value={formDue}
                      onChange={(e) => setFormDue(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.paymentMethod}
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Cash">Cash (নগদ টাকা)</option>
                    <option value="Bkash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                    <option value="Other">Other / অন্যান্য</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {t.status}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Paid">{t.paid}</option>
                    <option value="Partial">{t.partial}</option>
                    <option value="Unpaid">{t.unpaid}</option>
                  </select>
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
                    className="px-4.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
