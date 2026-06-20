/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LicenseAgreement, Property, SubUnit, Tenant, SystemSettings, DEFAULT_TRANSLATIONS, UserProfile } from "../types";
import { FileText, Plus, Search, Calendar, FileType, CheckSquare, Printer, Ban, ShieldCheck, Download } from "lucide-react";

interface AgreementManagerProps {
  agreements: LicenseAgreement[];
  properties: Property[];
  subUnits: SubUnit[];
  tenants: Tenant[];
  settings: SystemSettings;
  onAddAgreement: (agg: LicenseAgreement) => void;
  onTerminateAgreement: (id: string) => void;
  lang: "en" | "bn";
  currentUser?: UserProfile;
}

export default function AgreementManager({
  agreements,
  properties,
  subUnits,
  tenants,
  settings,
  onAddAgreement,
  onTerminateAgreement,
  lang,
  currentUser,
}: AgreementManagerProps) {
  const t = DEFAULT_TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeaseForPrint, setSelectedLeaseForPrint] = useState<LicenseAgreement | null>(null);
  const [previewLease, setPreviewLease] = useState<LicenseAgreement | null>(null);

  // Form Fields
  const [formTenantId, setFormTenantId] = useState("");
  const [formSubUnitId, setFormSubUnitId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formMonthlyRent, setFormMonthlyRent] = useState(15000);
  const [formDeposit, setFormDeposit] = useState(30000);
  const [formCustomTerms, setFormCustomTerms] = useState(lang === "bn" ? settings.termsTemplateBN : settings.termsTemplateEN);

  // Filter vacant sub-units for lease creation
  const vacantUnits = subUnits.filter((u) => u.status === "Vacant");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTenantId || !formSubUnitId || !formStartDate || !formEndDate) return;

    // Find property relative to unit
    const u = subUnits.find((su) => su.id === formSubUnitId);
    if (!u) return;

    const newLease: LicenseAgreement = {
      id: "lease_" + Math.random().toString(36).substr(2, 9),
      subUnitId: formSubUnitId,
      propertyId: u.propertyId,
      tenantId: formTenantId,
      startDate: formStartDate,
      endDate: formEndDate,
      monthlyRentAmount: Number(formMonthlyRent),
      depositAmount: Number(formDeposit),
      termsAndConditions: formCustomTerms,
      status: "Active",
      agreementDocNo: "AGR-DH-" + Math.floor(100000 + Math.random() * 900000),
    };

    onAddAgreement(newLease);
    // Reset
    setFormTenantId("");
    setFormSubUnitId("");
    setFormStartDate("");
    setFormEndDate("");
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe direct download of the agreement styled format as structured file with print support
  const handleDownloadHTML = (lease: LicenseAgreement) => {
    const landlordName = lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN;
    const tenantName = getTenantName(lease.tenantId);
    const propertyName = getPropertyName(lease.propertyId);
    const unitNo = getUnitNo(lease.subUnitId);
    const docNo = lease.agreementDocNo;
    const tenantObj = tenants.find((te) => te.id === lease.tenantId);
    const tenantPhone = tenantObj?.phone || "N/A";
    const tenantNid = tenantObj?.nidOrPassport || "N/A";
    const propObj = properties.find((p) => p.id === lease.propertyId);
    const address = propObj?.address || "N/A";

    const content = `<!DOCTYPE html>
<html lang="${lang === "bn" ? "bn" : "en"}">
<head>
  <meta charset="utf-8">
  <title>Deed_Agreement_${docNo}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; padding: 40px; }
    .page { max-width: 850px; margin: 0 auto; background: #ffffff; padding: 55px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 2px solid #e2e8f0; position: relative; overflow: hidden; }
    
    /* Stamp Paper Header Design */
    .stamp-header { border-bottom: 4px double #0f172a; padding-bottom: 25px; margin-bottom: 35px; text-align: center; }
    .stamp-banner { background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; display: inline-block; border-radius: 6px; margin-bottom: 12px; border: 2px solid #165b33; }
    .stamp-header h1 { font-size: 26px; color: #0f172a; text-transform: uppercase; margin: 0 0 4px 0; font-weight: 900; letter-spacing: -0.025em; }
    .stamp-header p { font-size: 13px; color: #475569; margin: 4px 0 0; }
    
    .meta-bar { display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; margin-bottom: 30px; font-family: monospace; font-size: 11px; color: #475569; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 35px; }
    .party-card { border: 1.5px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #fafbfc; }
    .party-card h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #4338ca; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px; margin: 0 0 12px 0; letter-spacing: 0.05em; }
    .party-card p { margin: 6px 0; font-size: 13px; line-height: 1.5; color: #334155; }
    
    .premises-box { border: 1.5px dashed #cbd5e1; padding: 20px; border-radius: 12px; background-color: #fcfdfe; margin-bottom: 35px; }
    .premises-box h3 { font-size: 13px; text-transform: uppercase; margin: 0 0 10px 0; color: #334155; letter-spacing: 0.05em; font-weight: 700; }
    .premises-box p { margin: 0; font-size: 13.5px; line-height: 1.6; color: #1e293b; }
    
    .terms-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center; margin-bottom: 35px; }
    .term-box { border: 1.5px solid #e2e8f0; padding: 16px; border-radius: 10px; background-color: #ffffff; }
    .term-box span { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 4px; }
    .term-box strong { font-size: 15px; color: #0f172a; display: block; font-family: monospace, sans-serif; font-weight: 800; }
    
    .clauses-section { margin-bottom: 35px; }
    .clauses-section h3 { font-size: 13px; text-transform: uppercase; margin: 0 0 10px 0; color: #334155; font-weight: 700; letter-spacing: 0.05em; }
    .clauses-content { background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12.5px; white-space: pre-wrap; line-height: 1.7; color: #334155; }
    
    .disclaimer { text-align: center; font-size: 11px; font-style: italic; color: #64748b; margin-bottom: 45px; line-height: 1.5; padding: 0 20px; }
    
    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; text-align: center; margin-top: 70px; }
    .sig-line { border-top: 1.5px solid #0f172a; padding-top: 10px; font-size: 13px; font-weight: bold; color: #0f172a; }
    .sig-line p { font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-weight: normal; }
    
    @media print {
      body { background-color: #ffffff; padding: 0; margin: 0; }
      .page { box-shadow: none; border: none; padding: 0; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="stamp-header">
      <div class="stamp-banner">${lang === "bn" ? "ভাড়া চুক্তিপত্র দলিল" : "TENANCY LEASE AGREEMENT"}</div>
      <h1>${lang === "bn" ? settings.appNameBN : settings.appNameEN}</h1>
      <p>${lang === "bn" ? "গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের আইন অনুযায়ী প্রস্তুতকৃত ডিজিটাল চুক্তিপত্র" : "Digital Document Issued Pursuant to Housing Laws"}</p>
    </div>
    
    <div class="meta-bar">
      <div>DEED DOC NO: <strong>${docNo}</strong></div>
      <div>STATUS: <strong style="color: #15803d; text-transform: uppercase;">${lease.status}</strong></div>
      <div>DATE: <strong>${new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</strong></div>
    </div>
    
    <div class="grid">
      <div class="party-card">
        <h2>${lang === "bn" ? "প্রথম পক্ষ (বাড়িওয়ালা/মালিক)" : "First Party (Landlord / Admin)"}</h2>
        <p><strong>${landlordName}</strong></p>
        <p>${lang === "bn" ? "মালিকানা প্রশাসন" : "Property Owner & Authorized Landlord"}</p>
        <p>Phone: <strong>${settings.contactPhone}</strong></p>
      </div>
      <div class="party-card">
        <h2>${lang === "bn" ? "দ্বিতীয় পক্ষ (ভাড়াটিয়া)" : "Second Party (Registered Occupant)"}</h2>
        <p><strong>${tenantName}</strong></p>
        <p>NID/Passport: <strong>${tenantNid}</strong></p>
        <p>Phone: <strong>${tenantPhone}</strong></p>
      </div>
    </div>

    <div class="premises-box">
      <h3>🏢 ${lang === "bn" ? "ভাড়াকৃত প্রোপার্টি ও ফ্ল্যাটের সুনির্দিষ্ট তফশিল" : "Specific Tenancy Premise Sub-Unit details"}</h3>
      <p>
        Currently leased unit: <strong>${unitNo}</strong> located on <strong>${propertyName}</strong>.<br>
        📍 Full Address of property: <strong>${address}</strong>
      </p>
    </div>

    <div class="terms-grid">
      <div class="term-box">
        <span>${lang === "bn" ? "মাসিক ভাড়া" : "Monthly Rent"}</span>
        <strong>${settings.bdtSymbol} ${lease.monthlyRentAmount.toLocaleString()}</strong>
      </div>
      <div class="term-box">
        <span>${lang === "bn" ? "অগ্রিম জামানত" : "Security Advance"}</span>
        <strong>${settings.bdtSymbol} ${lease.depositAmount.toLocaleString()}</strong>
      </div>
      <div class="term-box">
        <span>${lang === "bn" ? "মেয়াদকাল" : "Agreement Duration"}</span>
        <strong style="font-size: 12px; white-space: nowrap;">${lease.startDate} ~ ${lease.endDate}</strong>
      </div>
    </div>

    <div class="clauses-section">
      <h3>📜 ${lang === "bn" ? "সম্মতিযোগ্য আইন ও বিশেষ শর্তাবলী" : "Covenants, Rules & General Clauses"}</h3>
      <div class="clauses-content">${lease.termsAndConditions || "No additional custom terms listed."}</div>
    </div>

    <p class="disclaimer">
      ${lang === "bn" 
        ? "উভয় পক্ষ সুস্থ মস্তিস্কে, কারো বিনা প্ররোচনার স্বেচ্ছায় এই চুক্তিপত্র দলিল পাঠ করিয়া স্বাক্ষর করিয়াছেন।"
        : "Both First Party landlord and Second Party tenant agree with these bindings, accepting complete responsibility for maintaining this estate in standard order."}
    </p>

    <div class="signatures-grid">
      <div class="sig-line">
        ${lang === "bn" ? "১ম পক্ষের স্বাক্ষর (বাড়িওয়ালা)" : "First Party Signature"}
        <p>Owner / Landlord</p>
      </div>
      <div class="sig-line">
        ${lang === "bn" ? "২য় পক্ষের স্বাক্ষর (ভাড়াটিয়া)" : "Second Party Signature"}
        <p>Tenant Occupant</p>
      </div>
      <div class="sig-line">
        ${lang === "bn" ? "সাক্ষীগণের স্বাক্ষর ও প্রমাণ" : "Witness Attestation"}
        <p>Presiding Witness</p>
      </div>
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Agreement_Deed_${docNo}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick lookups
  const getTenantName = (tid: string) => tenants.find((ten) => ten.id === tid)?.name || "Unknown Tenant";
  const getUnitNo = (uid: string) => subUnits.find((su) => su.id === uid)?.unitNo || "N/A";
  const getPropertyName = (pid: string) => properties.find((p) => p.id === pid)?.name || "N/A";

  const getTenantIdByEmail = (email?: string) => {
    if (email === "ariful@outlook.com") return "tenant_1";
    if (email === "modina.jw@gmail.com") return "tenant_2";
    if (email === "ceo@fintech.com.bd") return "tenant_3";
    return "";
  };

  const isTenant = currentUser?.role === "Tenant";
  const tenantId = getTenantIdByEmail(currentUser?.email);

  const filteredAgreementList = agreements
    .filter((ag) => !isTenant || ag.tenantId === (tenantId || "tenant_1"))
    .filter((ag) => {
      const tName = getTenantName(ag.tenantId).toLowerCase();
      const uNo = getUnitNo(ag.subUnitId).toLowerCase();
      const pName = getPropertyName(ag.propertyId).toLowerCase();
      const query = searchQuery.toLowerCase();
      return tName.includes(query) || uNo.includes(query) || pName.includes(query) || ag.agreementDocNo.toLowerCase().includes(query);
    });

  return (
    <div className="space-y-6">
      {/* Printable block that hides on screen but prints as a full physical document */}
      {selectedLeaseForPrint && (
        <div className="hidden print:block p-10 bg-white text-slate-900 leading-normal text-xs font-sans max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {lang === "bn" ? settings.appNameBN : settings.appNameEN}
            </h1>
            <p className="text-sm font-medium text-slate-600">
              {lang === "bn" ? "ভাড়া চুক্তিপত্র দলিল / Tenancy Agreement Document" : "Tenancy Lease Deed Agreement"}
            </p>
            <p className="text-xs font-mono mt-1 text-slate-500">
              Doc No: {selectedLeaseForPrint.agreementDocNo} | Status: {selectedLeaseForPrint.status}
            </p>
          </div>

          <div className="text-right font-mono text-[10px] text-slate-500">
            Date: {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
          </div>

          {/* Parties block */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="border border-slate-300 p-4 rounded-lg space-y-2">
              <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider underline">
                {t.firstParty}
              </h2>
              <p className="font-semibold text-xs">{lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN}</p>
              <p>{lang === "bn" ? "বাড়িওয়ালা / মালিক" : "Landlord / Building Administrator"}</p>
              <p className="font-mono text-[11px]">{settings.contactPhone}</p>
            </div>

            <div className="border border-slate-300 p-4 rounded-lg space-y-2">
              <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider underline">
                {t.secondParty}
              </h2>
              <p className="font-semibold text-xs">
                {getTenantName(selectedLeaseForPrint.tenantId)}
              </p>
              <p>{lang === "bn" ? "ভাড়াটিয়া (Tenant)" : "Second Party Occupant"}</p>
              <p className="font-mono text-[11px]">
                NID: {tenants.find((te) => te.id === selectedLeaseForPrint.tenantId)?.nidOrPassport || "N/A"}
              </p>
            </div>
          </div>

          {/* Unit Description */}
          <div className="space-y-2 border-t border-b border-dashed border-slate-300 py-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {lang === "bn" ? "ভাড়াকৃত সম্পত্তি ও ফ্ল্যাটের বিবরণ" : "Rented Premises Details"}
            </h3>
            <p className="text-xs leading-relaxed">
              {lang === "bn" ? "মিলে এই মর্মে চুক্তিপত্র সম্পাদন করা হল যে," : "The Landlord hereby demises to lease the following unit:"}
              <br />
              🏢 <strong>{getPropertyName(selectedLeaseForPrint.propertyId)}</strong> • Unit/Room No: <strong>{getUnitNo(selectedLeaseForPrint.subUnitId)}</strong>
              <br />
              📍 Address/مكان: <strong>{properties.find((pr) => pr.id === selectedLeaseForPrint.propertyId)?.address}</strong>
            </p>
          </div>

          {/* Core Terms: rent / date */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border border-slate-200 p-2.5 rounded">
              <span className="block text-[10px] uppercase text-slate-400 font-bold">{t.rentAmount}</span>
              <strong className="text-sm font-mono text-slate-800">
                {settings.bdtSymbol} {selectedLeaseForPrint.monthlyRentAmount.toLocaleString()} / Month
              </strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded">
              <span className="block text-[10px] uppercase text-slate-400 font-bold">Advance Paid</span>
              <strong className="text-sm font-mono text-slate-800">
                {settings.bdtSymbol} {selectedLeaseForPrint.depositAmount.toLocaleString()}
              </strong>
            </div>
            <div className="border border-slate-200 p-2.5 rounded">
              <span className="block text-[10px] uppercase text-slate-400 font-bold">Lease Period</span>
              <strong className="text-[11px] text-slate-800 font-mono">
                {selectedLeaseForPrint.startDate} to {selectedLeaseForPrint.endDate}
              </strong>
            </div>
          </div>

          {/* Dynamic Clauses Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              {lang === "bn" ? "চুল্লীকৃত আইন ও শর্তাবলী" : "Covenants & Agreement Clauses"}
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl text-xs font-sans whitespace-pre-wrap leading-relaxed">
              {selectedLeaseForPrint.termsAndConditions}
            </div>
          </div>

          {/* Laws block */}
          <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
            {selectedLeaseForPrint.termsAndConditions ? "" : "N/A"}
            {t.agreementDateRule}
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-16 text-center">
            <div className="border-t border-slate-900 pt-2 text-xs font-semibold">
              {t.signatureLandlord}
              <p className="text-[10px] font-normal text-slate-400 mt-1">First Party</p>
            </div>
            <div className="border-t border-slate-900 pt-2 text-xs font-semibold">
              {t.signatureTenant}
              <p className="text-[10px] font-normal text-slate-400 mt-1">Second Party</p>
            </div>
            <div className="border-t border-slate-900 pt-2 text-xs font-semibold">
              {t.witness}
              <p className="text-[10px] font-normal text-slate-400 mt-1">Witness Presence</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen view */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
              {lang === "bn" ? "📜 বাসা ও ফ্ল্যাটের ভাড়া চুক্তিপত্র" : "📜 Tenancy Leases & Agreements"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {lang === "bn"
                ? "ভাড়াটিয়ার সাথে প্রপার আইনি শর্তাবলি সহ ডিজিটাল এগ্রিমেন্ট তৈরি করুন এবং প্রিন্ট বা পিডিএফ সংরক্ষণ করুন।"
                : "Bind tenants to property sub-units. Draft and customize digital tenancy legal sheets."}
            </p>
          </div>

          {!isTenant && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t.createAgreement}
            </button>
          )}
        </div>

        {/* List of active agreements/deeds */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === "bn" ? "ভাড়াটিয়া বা ফ্ল্যাট লিখে চুক্তি খুঁজুন..." : "Filter contracts..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono italic">
              Active Leases: {agreements.filter((a) => a.status === "Active").length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Doc Deed No</th>
                  <th className="px-6 py-3.5">{t.tenantName}</th>
                  <th className="px-6 py-3.5">Premise / Unit</th>
                  <th className="px-6 py-3.5">Term Date</th>
                  <th className="px-6 py-3.5">Rent Rates</th>
                  <th className="px-6 py-3.5">{t.status}</th>
                  <th className="px-6 py-3.5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAgreementList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-xs text-slate-400 bg-white">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  filteredAgreementList.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {ag.agreementDocNo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {getTenantName(ag.tenantId)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="block text-slate-800 font-medium">{getUnitNo(ag.subUnitId)}</span>
                          <span className="block text-[10px] text-slate-400">{getPropertyName(ag.propertyId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-300" />
                          <span>{ag.startDate} ~</span>
                        </div>
                        <div className="pl-5 text-slate-400">{ag.endDate}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-950 font-bold direct-rent">
                        {settings.bdtSymbol} {ag.monthlyRentAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {ag.status === "Active" ? (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold border border-green-200">
                            {t.activeAgreement}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {ag.status === "Terminated" ? t.terminatedAgreement : t.expiredAgreement}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setPreviewLease(ag);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                          title={lang === "bn" ? "পিডিএফ চুক্তিপত্র প্রিভিউ ও ডাউনলোড করুন" : "Preview and download lease agreement as formatted PDF"}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{lang === "bn" ? "ডাউনলোড PDF" : "Download PDF"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeaseForPrint(ag);
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                          title="Direct printing dialogue"
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lang === "bn" ? "প্রিন্ট" : "Print"}</span>
                        </button>
                        {ag.status === "Active" && !isTenant && (
                          <button
                            onClick={() => {
                              if (confirm(lang === "bn" ? "আপনি কি চুক্তিপত্রটি বাতিল করতে চান?" : "Confirm termination?")) {
                                onTerminateAgreement(ag.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors cursor-pointer"
                            title="Terminate Agreement"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>{lang === "bn" ? "বাতিল" : "Terminate"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for adding agreement */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {lang === "bn" ? "নতুন ভাড়া চুক্তিপত্র তৈরি" : "Establish Tenancy Agreement"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Step 1: Select Occupant / tenant */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {lang === "bn" ? "ভাড়াটিয়া নির্বাচন করুন" : "Select Registered Tenant"} *
                  </label>
                  <select
                    required
                    value={formTenantId}
                    onChange={(e) => setFormTenantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="">-- {lang === "bn" ? "ভাড়াটিয়া সিলেক্ট করুন" : "Choose tenant"} --</option>
                    {tenants.map((ten) => (
                      <option key={ten.id} value={ten.id}>
                        {ten.name} ({ten.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Unit */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {lang === "bn" ? "ভাড়াকৃত ফ্ল্যাট / বিল্ডিং ইউনিট" : "Target Premise Sub-Unit (Vacant only)"} *
                  </label>
                  <select
                    required
                    value={formSubUnitId}
                    onChange={(e) => {
                      setFormSubUnitId(e.target.value);
                      const parent = subUnits.find((su) => su.id === e.target.value);
                      if (parent) {
                        setFormMonthlyRent(parent.monthlyRent);
                        setFormDeposit(parent.securityDeposit);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="">-- {lang === "bn" ? "ফ্ল্যাট বা দোকান সিলেক্ট করুন" : "Choose vacant room/shop/office"} --</option>
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {getPropertyName(u.propertyId)} - {u.unitNo} (Rent: {settings.bdtSymbol}{u.monthlyRent})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.startDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.endDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Step 4: Rent overrides */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.rentAmount} ({settings.bdtSymbol})
                    </label>
                    <input
                      type="number"
                      value={formMonthlyRent}
                      onChange={(e) => setFormMonthlyRent(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {t.securityDeposit} ({settings.bdtSymbol})
                    </label>
                    <input
                      type="number"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Custom Clauses */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {lang === "bn" ? "দলিল চুক্তিপত্রের বিশেষ শর্তাবলী ও নিয়মসমূহ" : "Agreement Clause / terms overrides"}
                  </label>
                  <textarea
                    value={formCustomTerms}
                    onChange={(e) => setFormCustomTerms(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                    className="px-4.5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    {t.signLease}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for viewing agreement PDF preview */}
        {previewLease && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-100 rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-scale-up">
              <div className="bg-white px-6 py-4.5 border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {lang === "bn" ? "ভাড়া চুক্তিপত্র দলিল প্রিভিউ" : "Tenancy Agreement Deed Preview"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Deed Serial: <span className="font-mono text-indigo-600 font-bold">{previewLease.agreementDocNo}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewLease(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-all"
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Printable Style representation */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="bg-white border-2 border-dashed border-slate-300 p-8 sm:p-12 max-w-3xl mx-auto shadow-md rounded-xl space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
                  
                  {/* Government Style Stamp Paper top banner */}
                  <div className="text-center pb-6 border-b-4 border-double border-slate-900 space-y-2">
                    <div className="bg-emerald-700 text-white font-extrabold tracking-widest text-[9px] uppercase px-4 py-1.5 rounded inline-block border border-emerald-800 shadow-xs">
                      {lang === "bn" ? "ভাড়া চুক্তিপত্র অনুলিপি" : "TENANCY LEASE AGREEMENT REGISTER"}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight font-sans">
                      {lang === "bn" ? settings.appNameBN : settings.appNameEN}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      {lang === "bn" ? "ডিজিটাল ও আইনি আবাসন প্রশাসন" : "Automated Lease Agreement System Settings Powered Document"}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Doc No: <span className="text-slate-800 font-bold">{previewLease.agreementDocNo}</span> | Status: <span className="text-emerald-700 font-bold">{previewLease.status}</span>
                    </div>
                  </div>

                  {/* Document date annotation */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-450 border-b border-slate-150 pb-2">
                    <span>DATE PREPARED: {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</span>
                    <span>SYSTEM VERIFIED ✓</span>
                  </div>

                  {/* Landlord vs Tenant Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-1.5">
                      <h4 className="font-extrabold text-[10px] uppercase text-indigo-700 tracking-wider">
                        {lang === "bn" ? "প্রথম পক্ষ (বাড়িওয়ালা/মালিক)" : "First Party (Owner/Landlord)"}
                      </h4>
                      <p className="font-bold text-slate-900 text-xs">
                        {lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {lang === "bn" ? "নিবন্ধনকারী মালিক" : "Building Administrator Owner"}
                      </p>
                      <p className="font-mono text-[11px] text-slate-600">
                        {lang === "bn" ? "মোবাইল: " : "Phone: "}{settings.contactPhone}
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-1.5">
                      <h4 className="font-extrabold text-[10px] uppercase text-[emerald-700] tracking-wider" style={{ color: '#15803d' }}>
                        {lang === "bn" ? "দ্বিতীয় পক্ষ (ভাড়াটিয়া)" : "Second Party (Tenant Occupant)"}
                      </h4>
                      <p className="font-bold text-slate-900 text-xs">
                        {getTenantName(previewLease.tenantId)}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        NID/Passport: <span className="font-mono font-semibold">{tenants.find((te) => te.id === previewLease.tenantId)?.nidOrPassport || "N/A"}</span>
                      </p>
                      <p className="font-mono text-[11px] text-slate-600">
                        {lang === "bn" ? "মোবাইল: " : "Phone: "}{tenants.find((te) => te.id === previewLease.tenantId)?.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Leased Premises schedule */}
                  <div className="space-y-2 border-t border-b border-dashed border-slate-200 py-3.5">
                    <h4 className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider">
                      {lang === "bn" ? "ভাড়াকৃত সম্পত্তি ও ফ্ল্যাটের বিবরণ" : "Rented Premise Location Schedule"}
                    </h4>
                    <p className="text-[11.5px] text-slate-700">
                      The Landlord hereby demises to lease the specific Sub-Unit **{getUnitNo(previewLease.subUnitId)}** situated on property unit **{getPropertyName(previewLease.propertyId)}**.<br />
                      📍 <strong>Full Location Address:</strong> {properties.find((pr) => pr.id === previewLease.propertyId)?.address || "N/A"}
                    </p>
                  </div>

                  {/* Core terms breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-200 p-3 rounded-lg text-center bg-white shadow-3xs">
                      <span className="block text-[9px] uppercase font-extrabold text-slate-450 tracking-wide">{t.rentAmount}</span>
                      <strong className="text-xs sm:text-sm text-slate-900 font-mono">
                        {settings.bdtSymbol} {previewLease.monthlyRentAmount.toLocaleString()}
                      </strong>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-lg text-center bg-white shadow-3xs">
                      <span className="block text-[9px] uppercase font-extrabold text-slate-450 tracking-wide">{lang === "bn" ? "অগ্রিম জামানত" : "Security Advance"}</span>
                      <strong className="text-xs sm:text-sm text-slate-900 font-mono">
                        {settings.bdtSymbol} {previewLease.depositAmount.toLocaleString()}
                      </strong>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-lg text-center bg-white shadow-3xs">
                      <span className="block text-[9px] uppercase font-extrabold text-slate-450 tracking-wide">{lang === "bn" ? "চুক্তির মেয়াদকাল" : "Deed Period"}</span>
                      <strong className="text-[10px] text-slate-900 font-mono block mt-1 leading-tight">
                        {previewLease.startDate} <span className="text-slate-400">to</span> {previewLease.endDate}
                      </strong>
                    </div>
                  </div>

                  {/* Terms text */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider">
                      {lang === "bn" ? "চুক্তিপত্রের সাধারণ শর্তাবলী ও নিয়মাবলী" : "Standard Terms, Conditions & General Covenants"}
                    </h4>
                    <div className="bg-slate-50/70 p-4 rounded-xl text-[11px] text-slate-600 font-serif leading-relaxed font-sans whitespace-pre-wrap border border-slate-200">
                      {previewLease.termsAndConditions || "No secondary conditions listed in the registry."}
                    </div>
                  </div>

                  {/* Signatures placeholder */}
                  <div className="grid grid-cols-3 gap-4 pt-10 text-center font-semibold text-[10.5px]">
                    <div className="border-t border-slate-800 pt-1.5 text-slate-800">
                      Signature of Landlord
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 text-slate-800">
                      Signature of Tenant
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 text-slate-500">
                      Pre-verified Witness
                    </div>
                  </div>

                </div>
              </div>

              {/* Action columns inside Modal footer */}
              <div className="bg-white p-4.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <p className="text-[11px] text-slate-450 font-medium text-center sm:text-left">
                  {lang === "bn" 
                    ? "* পিডিএফ ডাউনলোডের জন্য 'Save PDF / Print' ক্লিক করে পিডিএফ অপশন সিলেক্ট করুন বা অফলাইন ফাইল ডাউনলোড করুন।"
                    : "* For seamless PDF download, click primary print options & configure Destination as 'Save as PDF'."}
                </p>
                <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setSelectedLeaseForPrint(previewLease);
                      setTimeout(() => {
                        window.print();
                      }, 400);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>{lang === "bn" ? "Save PDF / Print" : "Save PDF / Print"}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadHTML(previewLease)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    title="Download offline bundle which starts printing panel instantly upon doubleclick"
                  >
                    <Download className="h-4 w-4" />
                    <span>{lang === "bn" ? "অফলাইন ডাউনলোড" : "Download Offline HTML"}</span>
                  </button>
                  <button
                    onClick={() => setPreviewLease(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
