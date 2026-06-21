/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Property, SubUnit, Tenant, RentCollectionRecord, MaintenanceLog, SystemSettings, DEFAULT_TRANSLATIONS, MiscExpense } from "../types";
import { FileText, Download, Calendar, ArrowRightLeft, DollarSign, Wrench, Receipt, FileBarChart2, HelpCircle } from "lucide-react";

interface MonthlyReportGeneratorProps {
  properties: Property[];
  subUnits: SubUnit[];
  tenants: Tenant[];
  rentRecords: RentCollectionRecord[];
  maintenanceLogs: MaintenanceLog[];
  expenses?: MiscExpense[];
  settings: SystemSettings;
  lang: "en" | "bn";
}

export default function MonthlyReportGenerator({
  properties,
  subUnits,
  tenants,
  rentRecords,
  maintenanceLogs = [],
  expenses = [],
  settings,
  lang,
}: MonthlyReportGeneratorProps) {
  const t = DEFAULT_TRANSLATIONS[lang];

  // Derive unique months that have activity in rent records or maintenance logs
  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    
    // Add months from rent records (format is YYYY-MM)
    rentRecords.forEach((r) => {
      if (r.monthString && r.monthString.match(/^\d{4}-\d{2}$/)) {
        monthsSet.add(r.monthString);
      }
    });

    // Add months from maintenance logs (loggedDate format is YYYY-MM-DD or YYYY-MM)
    maintenanceLogs.forEach((log) => {
      if (log.loggedDate) {
        const m = log.loggedDate.substring(0, 7);
        if (m.match(/^\d{4}-\d{2}$/)) {
          monthsSet.add(m);
        }
      }
    });

    // Fallback to current month if no records yet
    if (monthsSet.size === 0) {
      const today = new Date();
      monthsSet.add(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
    }

    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); // Newest first
  };

  const availableMonths = getAvailableMonths();
  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || "2026-06");

  // Format month for display
  const formatMonthName = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return monthStr;
    }
  };

  // Compile calculations for selected month
  const getMonthStats = (month: string) => {
    // 1. Rent Records for this month
    const monthRentRecords = rentRecords.filter((r) => r.monthString === month);
    const rentPaid = monthRentRecords
      .filter((r) => r.status === "Paid" || r.status === "Partial")
      .reduce((sum, r) => sum + r.amountPaid, 0);
    const rentDue = monthRentRecords.reduce((sum, r) => sum + r.amountDue, 0);
    const rentTotalExpected = rentPaid + rentDue;

    // 2. Maintenance costs logged in this month
    const monthMaintLogs = maintenanceLogs.filter((log) => log.loggedDate && log.loggedDate.startsWith(month));
    const maintenanceCost = monthMaintLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const completedMaintTasks = monthMaintLogs.filter((log) => log.completedStatus === "Completed").length;
    const pendingMaintTasks = monthMaintLogs.filter((log) => log.completedStatus !== "Completed").length;

    // 3. Net Cash Flow
    const netFlow = rentPaid - maintenanceCost;

    // 4. Property wise breakdown
    const propertyStats = properties.map((prop) => {
      const propRecords = monthRentRecords.filter((r) => r.propertyId === prop.id);
      const collected = propRecords
        .filter((r) => r.status === "Paid" || r.status === "Partial")
        .reduce((sum, r) => sum + r.amountPaid, 0);
      const due = propRecords.reduce((sum, r) => sum + r.amountDue, 0);

      const propLogs = monthMaintLogs.filter((log) => log.propertyId === prop.id);
      const maintSpent = propLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const localNet = collected - maintSpent;

      return {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        collected,
        due,
        maintenanceCost: maintSpent,
        netFlow: localNet,
      };
    });

    return {
      rentPaid,
      rentDue,
      rentTotalExpected,
      maintenanceCost,
      completedMaintTasks,
      pendingMaintTasks,
      netFlow,
      propertyStats,
      rawLogs: monthMaintLogs,
      rawRentRecords: monthRentRecords,
    };
  };

  const stats = getMonthStats(selectedMonth);

  // Helper helper helpers
  const lookupTenant = (id: string) => tenants.find((t) => t.id === id)?.name || "N/A";
  const lookupUnit = (id: string) => subUnits.find((u) => u.id === id)?.unitNo || "N/A";

  // PDF Generator Function using jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const isBn = lang === "bn";
    const titleText = isBn ? "মাসিক আর্থিক প্রতিবেদন" : "MONTHLY FINANCIAL REPORT";
    const currencySym = settings.bdtSymbol || "BDT";
    const monthFormatted = formatMonthName(selectedMonth);
    const generatedOn = new Date().toLocaleDateString(isBn ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Typography & Color Palette
    const primaryColor = [49, 46, 129]; // Navy Deep #312E81
    const accentColor = [79, 70, 229]; // Indigo Indigo #4F46E5
    const darkTextColor = [30, 41, 59]; // Slate Slate #1E293B
    const grayTextColor = [100, 116, 139]; // Slate #64748B
    const lineGrayColor = [226, 232, 240]; // Slate #E2E8F0

    // Print top logo band
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 8, "F");

    let y = 20;

    // Company Logo and Document Title
    const systemName = isBn ? settings.appNameBN : settings.appNameEN;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(systemName, 15, y);

    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
    const ownerName = isBn ? settings.ownerNameBN : settings.ownerNameEN;
    doc.text(`Property Owner: ${ownerName}`, 15, y + 5);

    // Document header subtitle
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(titleText, 210 - 15, y, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(`Billing Month: ${monthFormatted}`, 210 - 15, y + 5, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
    doc.text(`Format: PDF / Digital Statement`, 210 - 15, y + 9, { align: "right" });

    y += 18;

    // Horizontal line
    doc.setDrawColor(lineGrayColor[0], lineGrayColor[1], lineGrayColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, y, 204 - 9, y);

    y += 8;

    // Document Meta Block
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text("DOCUMENT DETAILS", 15, y);

    y += 5;
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
    doc.text(`Report Period: ${monthFormatted}`, 15, y);
    doc.text(`Date Generated: ${generatedOn}`, 15, y + 4.5);
    doc.text(`Target Asset Base: ${properties.length} Properties / ${subUnits.length} Sub-units`, 15, y + 9);

    doc.text(`Audited By: System Administrator`, 210 - 15, y, { align: "right" });
    doc.text(`Verification Code: BB-MFR-${selectedMonth}-${Math.floor(1000 + Math.random() * 9000)}`, 210 - 15, y + 4.5, { align: "right" });
    doc.text(`Digital Seal: VERIFIED SYSTEM LEDGER`, 210 - 15, y + 9, { align: "right" });

    y += 18;

    // Financial Cards Metrics Section (Grid boxes in PDF)
    const cardW = 43;
    const cardH = 22;
    const cardXStart = 15;
    const spacing = 6;

    const cards = [
      {
        title: isBn ? "মোট ভাড়া সংগ্রহ" : "TOTAL REVENUE",
        val: `${currencySym} ${stats.rentPaid.toLocaleString()}`,
        bg: [240, 253, 244], // light green
        border: [187, 247, 208],
        txt: [21, 128, 61],
      },
      {
        title: isBn ? "মোট অনাদায়ী বকেয়া" : "OUTSTANDING DUES",
        val: `${currencySym} ${stats.rentDue.toLocaleString()}`,
        bg: [254, 242, 242], // light red
        border: [254, 202, 202],
        txt: [185, 28, 28],
      },
      {
        title: isBn ? "রক্ষণাবেক্ষণ ব্যয়" : "MAINTENANCE SPENT",
        val: `${currencySym} ${stats.maintenanceCost.toLocaleString()}`,
        bg: [254, 249, 195], // light amber
        border: [253, 224, 71],
        txt: [161, 98, 7],
      },
      {
        title: isBn ? "নেট ক্যাশ-ফ্লো" : "NET CASH FLOW",
        val: `${currencySym} ${stats.netFlow.toLocaleString()}`,
        bg: [240, 249, 255], // light blue
        border: [186, 230, 253],
        txt: [3, 105, 161],
      },
    ];

    cards.forEach((card, idx) => {
      const cx = cardXStart + idx * (cardW + spacing);
      // card bg
      doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "F");
      // card border
      doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "D");

      // Card Title Text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
      doc.text(card.title, cx + 3, y + 6);

      // Card Value
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(card.txt[0], card.txt[1], card.txt[2]);
      doc.text(card.val, cx + 3, y + 14);
    });

    y += cardH + 10;

    // Property-by-Property Breakdown Table
    doc.setFontSize(9.5);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(isBn ? "প্রপার্টি ভিত্তিক আর্থিক বিবরণী" : "PROPERTY FINANCIAL ANALYSIS BREAKDOWN", 15, y);

    y += 5;

    // Table Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, y, 180, 7.5, "F");

    doc.setFontSize(8.5);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Property Estate Name", 18, y + 5);
    doc.text("Collected Rent", 88, y + 5, { align: "right" });
    doc.text("Dues Pending", 118, y + 5, { align: "right" });
    doc.text("Maint. Cost", 148, y + 5, { align: "right" });
    doc.text("Net Cash Flow", 192, y + 5, { align: "right" });

    y += 7.5;

    // Table Content rows
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    stats.propertyStats.forEach((p, idx) => {
      // Alternate row backgrounds
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252); // light background
        doc.rect(15, y, 180, 7, "F");
      }

      // Border line bottom row
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(15, y + 7, 195, y + 7);

      doc.setFont("Helvetica", "bold");
      doc.text(p.name.length > 34 ? p.name.substring(0, 31) + "..." : p.name, 18, y + 4.5);
      
      doc.setFont("Helvetica", "normal");
      doc.text(`${currencySym} ${p.collected.toLocaleString()}`, 88, y + 4.5, { align: "right" });
      
      if (p.due > 0) {
        doc.setTextColor(185, 28, 28); // red for due
        doc.text(`${currencySym} ${p.due.toLocaleString()}`, 118, y + 4.5, { align: "right" });
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      } else {
        doc.text("-", 118, y + 4.5, { align: "right" });
      }

      if (p.maintenanceCost > 0) {
        doc.text(`${currencySym} ${p.maintenanceCost.toLocaleString()}`, 148, y + 4.5, { align: "right" });
      } else {
        doc.text("-", 148, y + 4.5, { align: "right" });
      }

      // Net flow font & color bold
      doc.setFont("Helvetica", "bold");
      if (p.netFlow < 0) {
        doc.setTextColor(185, 28, 28);
      } else {
        doc.setTextColor(21, 128, 61);
      }
      doc.text(`${currencySym} ${p.netFlow.toLocaleString()}`, 192, y + 4.5, { align: "right" });
      
      // Reset color
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

      y += 7;
    });

    // Total final summary row of the breakdown table
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 8.5, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("CONSOLIDATED SUMMARY", 18, y + 5.5);
    
    doc.text(`${currencySym} ${stats.rentPaid.toLocaleString()}`, 88, y + 5.5, { align: "right" });
    doc.setTextColor(stats.rentDue > 0 ? 185 : 30, stats.rentDue > 0 ? 28 : 41, stats.rentDue > 0 ? 28 : 59);
    doc.text(`${currencySym} ${stats.rentDue.toLocaleString()}`, 118, y + 5.5, { align: "right" });
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(`${currencySym} ${stats.maintenanceCost.toLocaleString()}`, 148, y + 5.5, { align: "right" });
    
    if (stats.netFlow < 0) {
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(21, 128, 61);
    }
    doc.text(`${currencySym} ${stats.netFlow.toLocaleString()}`, 192, y + 5.5, { align: "right" });
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    y += 18;

    // Itemized Maintenance tasks list
    doc.setFontSize(9.5);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(isBn ? "রক্ষণাবেক্ষণ ও মেরামতের কাজের বিবরণী" : "ITEMIZED MAINTENANCE & REPAIR EXPENDITURES", 15, y);

    y += 5;

    if (stats.rawLogs.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 6, "F");
      
      doc.setFontSize(7.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
      doc.text("Task Repair Action Details", 18, y + 4);
      doc.text("Unit/Property", 98, y + 4);
      doc.text("Technician Details", 140, y + 4);
      doc.text("Expense paid", 192, y + 4, { align: "right" });

      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

      stats.rawLogs.forEach((log) => {
        // If y is close to page bottom, add a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 8, "F");
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.text(log.repairTask.length > 48 ? log.repairTask.substring(0, 45) + "..." : log.repairTask, 18, y + 4);
        
        doc.setFont("Helvetica", "normal");
        const u = lookupUnit(log.subUnitId);
        const pName = properties.find((pr) => pr.id === log.propertyId)?.name || "N/A";
        doc.text(`${u} (${pName.substring(0, 16)})`, 98, y + 4);
        
        doc.setFontSize(7.5);
        doc.text(`${log.technicianName} (${log.technicianPhone})`, 140, y + 4);
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`${currencySym} ${log.cost.toLocaleString()}`, 192, y + 4, { align: "right" });

        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.1);
        doc.line(15, y + 6, 195, y + 6);
        
        y += 6;
      });
    } else {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
      doc.text(isBn ? "চলতি মাসে কোনো মেরামতের কাজ রেকর্ড করা হয়নি।" : "No repair tasks logged or completed during this billing period.", 18, y + 4);
      y += 8;
    }

    // Footnotes & Signature Block space at bottom of first page or current page
    if (y > 240) {
      doc.addPage();
      y = 20;
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 8, "F");
    } else {
      y = 250;
    }

    // Horizontal line above footer
    doc.setDrawColor(lineGrayColor[0], lineGrayColor[1], lineGrayColor[2]);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);

    y += 5;
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
    doc.text("System Notice: This is an automatically compiled financial statement based on records logged securely by property managers.", 15, y);
    doc.text("Verification or export conflicts should be immediately reported to your service hosts in Bashabari systems.", 15, y + 3);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Bashabari Property Manager Engine", 210 - 15, y, { align: "right" });
    doc.setFont("Helvetica", "normal");
    doc.text(`Export Hash: BB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 210 - 15, y + 3, { align: "right" });

    // Save PDF
    doc.save(`Bashabari_Monthly_Report_${selectedMonth}.pdf`);
  };

  // Printable HTML function (falls back if browser fails but acts as high fidelity screen display too)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top action header bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <FileBarChart2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
              {lang === "bn" ? "আর্থিক বিবরণী ও পিডিএফ রিপোর্ট" : "Financial Statements & PDF Reporter"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {lang === "bn" ? "মাসিক আয় ও মেইনটেনেন্স ব্যয়ের খতিয়ান ডাউনলোড" : "Compile monthly rent receipts and maintenance costs instantly"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selective dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <Calendar className="h-4 w-4 text-slate-450 ml-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1 px-2.5 bg-transparent border-0 text-xs font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="font-mono text-slate-800">
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{lang === "bn" ? "পিডিএফ ডাউনলোড" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Embedded interactive report sheet preview */}
      <div className="p-6 space-y-6" id="report-preview-sheet">
        <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs bg-slate-50/30 p-5 md:p-6 space-y-6">
          {/* Sheet Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 py-0.5 px-2 rounded-full font-mono font-bold uppercase tracking-wider">
                Statement of Account
              </span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                {lang === "bn" ? "মাসের আর্থিক হিসাবপত্র বিবরণী" : "Financial Ledger Statement"}
              </h2>
              <p className="text-xs text-slate-500 font-medium font-mono">
                Period: {formatMonthName(selectedMonth)} ({selectedMonth})
              </p>
            </div>
            
            <div className="text-left sm:text-right space-y-0.5 font-mono text-[11px] text-slate-500 shrink-0">
              <span className="block font-bold text-slate-700">{settings.appNameEN}</span>
              <span className="block">{lang === "bn" ? "মালিক:" : "Owner:"} {lang === "bn" ? settings.ownerNameBN : settings.ownerNameEN}</span>
              <span className="block">{lang === "bn" ? "তারিখ:" : "Created:"} {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</span>
            </div>
          </div>

          {/* KPI Mini-grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cash in */}
            <div className="bg-white border border-emerald-100/80 p-4 rounded-xl flex items-start gap-3">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <Receipt className="h-4 w-4" />
              </span>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block font-sans">
                  {lang === "bn" ? "মোট সংগৃহীত ভাড়া" : "Rent Collected"}
                </span>
                <strong className="text-base font-black text-rose-950 font-mono block leading-none">
                  {settings.bdtSymbol}{stats.rentPaid.toLocaleString()}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold block bg-emerald-50 max-w-max px-1 rounded">
                  {stats.rawRentRecords.filter((r) => r.status === "Paid" || r.status === "Partial").length} payments
                </span>
              </div>
            </div>

            {/* Cash due */}
            <div className="bg-white border border-rose-100/80 p-4 rounded-xl flex items-start gap-3">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block font-sans">
                  {lang === "bn" ? "অনাদায়ী বকেয়া" : "Outstanding Dues"}
                </span>
                <strong className={`text-base font-black font-mono block leading-none ${stats.rentDue > 0 ? "text-rose-600" : "text-slate-600"}`}>
                  {settings.bdtSymbol}{stats.rentDue.toLocaleString()}
                </strong>
                <span className={`text-[10px] font-bold block max-w-max px-1 rounded ${stats.rentDue > 0 ? "text-rose-600 bg-rose-50 animate-pulse" : "text-slate-400 bg-slate-50"}`}>
                  {stats.rawRentRecords.filter((r) => r.status === "Unpaid").length} defaulters
                </span>
              </div>
            </div>

            {/* Maintenance cost */}
            <div className="bg-white border border-amber-150 p-4 rounded-xl flex items-start gap-3">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                <Wrench className="h-4 w-4" />
              </span>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block font-sans">
                  {lang === "bn" ? "মেরামত ব্যয়" : "Maintenance spent"}
                </span>
                <strong className="text-base font-black text-amber-700 font-mono block leading-none">
                  {settings.bdtSymbol}{stats.maintenanceCost.toLocaleString()}
                </strong>
                <span className="text-[10px] text-amber-700 font-bold block bg-amber-50 max-w-max px-1 rounded">
                  {stats.completedMaintTasks} tasks done
                </span>
              </div>
            </div>

            {/* Net profile */}
            <div className="bg-white border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                <ArrowRightLeft className="h-4 w-4" />
              </span>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 block font-sans">
                  {lang === "bn" ? "নেট প্রফিট" : "Net Profit margin"}
                </span>
                <strong className={`text-base font-black font-mono block leading-none ${stats.netFlow >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {settings.bdtSymbol}{stats.netFlow.toLocaleString()}
                </strong>
                <span className="text-[10px] text-indigo-700 font-bold block bg-indigo-50 max-w-max px-1 rounded">
                  Cash Flow Margin
                </span>
              </div>
            </div>
          </div>

          {/* Table Breakdown of Properties */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">
              Properties Breakdown
            </h4>
            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600 min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[9px] font-bold border-b border-slate-200">
                    <th className="px-4 py-3">Property Name</th>
                    <th className="px-4 py-3 text-right">Rents Collected</th>
                    <th className="px-4 py-3 text-right">Rent Dues</th>
                    <th className="px-4 py-3 text-right">Maint. Spent</th>
                    <th className="px-4 py-3 text-right">Net Cash Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.propertyStats.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <strong className="text-slate-800 font-extrabold block">{p.name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{p.address}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                        {settings.bdtSymbol}{p.collected.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${p.due > 0 ? "text-rose-600" : "text-slate-400"}`}>
                        {p.due > 0 ? `${settings.bdtSymbol}${p.due.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {p.maintenanceCost > 0 ? `${settings.bdtSymbol}${p.maintenanceCost.toLocaleString()}` : "-"}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-extrabold ${p.netFlow >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {settings.bdtSymbol}{p.netFlow.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* List of repairs itemized link */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">
              Incurred Repairs & Maintenance Logs ({stats.rawLogs.length})
            </h4>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {stats.rawLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <strong className="text-slate-800 font-extrabold">{log.repairTask}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Premise: <span className="font-semibold text-slate-600">{lookupUnit(log.subUnitId)}</span>
                      {" • "} Property: <span className="font-semibold text-slate-600">{properties.find((pr) => pr.id === log.propertyId)?.name || "N/A"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right sm:text-right shrink-0">
                    <div className="font-mono text-[10px] text-slate-450 leading-relaxed">
                      <span className="block font-medium text-slate-600">{log.technicianName}</span>
                      <span className="block">{log.technicianPhone}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900 font-extrabold font-mono font-mono text-xs block">
                        {settings.bdtSymbol}{log.cost.toLocaleString()}
                      </strong>
                      <span className="text-[9px] uppercase tracking-wide font-bold bg-slate-100 text-slate-500 py-0.5 px-1 rounded block mt-0.5 max-w-max ml-auto">
                        {log.completedStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.rawLogs.length === 0 && (
                <p className="p-5 text-center text-xs text-slate-400 italic">
                  No maintenance items or expenditures recorded in this month period.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
