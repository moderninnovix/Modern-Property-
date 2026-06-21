/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Roles
export type UserRole = "Owner" | "Manager" | "Maintenance" | "Tenant";

// Property Categories
export type PropertyCategory = "House" | "Flat" | "Shop" | "Office";

// User Record (for simulated user management)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
  allowedMenus?: string[];
}

// Property Record
export interface Property {
  id: string;
  name: string; // e.g. "Green Garden Villa"
  category: PropertyCategory;
  address: string;
  unitsCount: number;
  imageUrl?: string; // Optional custom photo url
}

// Sub-unit/Flat/Shop details
export interface SubUnit {
  id: string;
  propertyId: string;
  unitNo: string; // e.g. "Flat A-1", "Shop 5"
  category: PropertyCategory;
  monthlyRent: number;
  securityDeposit: number;
  status: "Vacant" | "Occupied" | "Maintenance";
  currentTenantId?: string;
}

// Tenant Record
export interface Tenant {
  id: string;
  name: string;
  phone: string;
  nidOrPassport: string;
  email?: string;
  permanentAddress: string;
  emergencyContact: string;
  familyMembersCount?: number;
  advancedPayment: number;
}

// Lease/Agreement Record
export interface LicenseAgreement {
  id: string;
  subUnitId: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRentAmount: number;
  depositAmount: number;
  termsAndConditions: string;
  status: "Active" | "Expired" | "Terminated";
  agreementDocNo: string; // Unique agreement ID or registration number
}

// Payment/Rent Record
export interface RentCollectionRecord {
  id: string;
  leaseId: string;
  subUnitId: string;
  propertyId: string;
  tenantId: string;
  monthString: string; // "YYYY-MM" e.g. "2026-06"
  amountPaid: number;
  amountDue: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Bkash" | "Nagad" | "Bank Transfer" | "Other";
  status: "Paid" | "Partial" | "Unpaid";
  receiverName: string;
  receiptNo: string;
}

// Maintenance Log Record to track repair tasks, costs, contact details, status of sub-units
export interface MaintenanceLog {
  id: string;
  propertyId: string;
  subUnitId: string;
  repairTask: string; // e.g. "Fix pipe leakage"
  cost: number;
  completedStatus: "Pending" | "In Progress" | "Completed";
  technicianName: string;
  technicianPhone: string;
  loggedDate: string; // "YYYY-MM-DD" style
}

// Custom Settings Structure as requested by the user
export interface SystemSettings {
  appNameEN: string;
  appNameBN: string;
  logoTextEN: string;
  logoTextBN: string;
  primaryColor: string; // hex or class reference e.g., "indigo" or "emerald"
  ownerNameEN: string;
  ownerNameBN: string;
  contactPhone: string;
  bdtSymbol: string; // "৳" or "TK"
  termsTemplateEN: string;
  termsTemplateBN: string;
  activeMenus: {
    dashboard: boolean;
    properties: boolean;
    tenants: boolean;
    agreements: boolean;
    rentCollection: boolean;
    userManagement: boolean;
    settings: boolean;
  };
}

// Miscellaneous Expenses (utilities, tax, insurance, salaries, etc.)
export interface MiscExpense {
  id: string;
  propertyId: string; // Connected to a property
  category: "Utility" | "Tax" | "Insurance" | "Salary" | "Other";
  amount: number;
  description: string;
  expenseDate: string; // "YYYY-MM" or "YYYY-MM-DD"
}

// Full Application Translations Dictionaries
export const DEFAULT_TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    properties: "Properties",
    tenants: "Tenants",
    agreements: "Agreements",
    rentCollection: "Rent Ledger",
    userManagement: "Users",
    settings: "Settings",
    language: "ভাষা (Language)",
    bengali: "বাংলা",
    english: "English",
    appName: "Property & Rent System",
    welcome: "Welcome back",
    overview: "Overview Statistics",
    totalCollected: "Total Collected",
    unpaidAmount: "Unpaid Rent",
    totalProperties: "Total Properties",
    activeTenants: "Active Tenants",
    recentCollections: "Recent Rent Collections",
    unitStatus: "Unit Status Distribution",
    vacant: "Vacant",
    occupied: "Occupied",
    maintenance: "Maintenance",
    addProperty: "Add Premium Property",
    propertyName: "Property / Building Name",
    propertyCategory: "Category",
    address: "Location Address",
    totalUnits: "Total Units / Flats / Rooms",
    propertyPhoto: "Upload Property Photo",
    propertyPhotoHelp: "Upload an image file (JPG, PNG) or drop it here. Leave empty to automatically use a stunning preset exterior.",
    addUnit: "Add Unit / Flat / Shop",
    unitNo: "Unit / Room No.",
    monthlyRent: "Monthly Rent",
    securityDeposit: "Security Deposit",
    actions: "Actions",
    noData: "No data available in this table.",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    nid: "NID / Passport No.",
    tenantName: "Tenant Name",
    phone: "Phone Number",
    emergencyContact: "Emergency Contact",
    permanentAddress: "Permanent Address",
    numberOfFamily: "Family Members Count",
    addTenant: "Add Tenant",
    createAgreement: "Create Rent Agreement",
    startDate: "Start Date",
    endDate: "End Date",
    agreementNumber: "Agreement No",
    terms: "Terms & Conditions",
    signLease: "Generate Agreement Document",
    addPayment: "Log Rent Payment",
    month: "Bill Month",
    paidAmount: "Amount Paid",
    dueAmount: "Due Amount",
    paymentMethod: "Payment Method",
    receiptNo: "Receipt No",
    printReceipt: "Print Receipt",
    printAgreement: "Print Agreement",
    downloadPDF: "Download PDF / Print",
    bdtSymbol: "৳",
    search: "Search...",
    house: "House / Building",
    flat: "Flat / Apartment",
    shop: "Commercial Shop",
    office: "Commercial Office",
    ownerPerspective: "Owner Perspective",
    tenantPerspective: "Tenant Perspective",
    switchRole: "Switch View Mode",
    activeAgreement: "Active",
    expiredAgreement: "Expired",
    terminatedAgreement: "Terminated",
    userPerspectives: "System Roles & Permissions",
    ownerSettings: "Owner Information",
    menuSettings: "Menu Navigation Configuration",
    accentColor: "Primary Color Theme",
    unpaid: "Unpaid",
    paid: "Paid",
    partial: "Partial",
    status: "Status",
    loggedBy: "Logged By",
    saveSettings: "Save Configuration",
    confirmDelete: "Are you sure you want to delete this?",
    agreementDetail: "Rent Tenancy Agreement Detail",
    rentAmount: "Rent Amount",
    firstParty: "First Party (Landlord)",
    secondParty: "Second Party (Tenant)",
    signatureLandlord: "Landlord Signature",
    signatureTenant: "Tenant Signature",
    witness: "Witness Signature",
    agreementDateRule: "This contract is executed in good faith under laws of Bangladesh.",
    paymentSuccess: "Rent payment logged successfully!",
    maintenanceLogs: "Maintenance & Repair Logs",
    addMaintenanceLog: "New Maintenance Log",
    repairTask: "Repair Task Details",
    costAmount: "Cost",
    technicianName: "Technician Name",
    technicianPhone: "Technician contact No.",
    completionStatus: "Work Status",
    noLogs: "No maintenance tasks logged for this property yet.",
    loggedDate: "Logged Date"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    properties: "সম্পত্তি তালিকা",
    tenants: "ভাড়াটিয়া তথ্য",
    agreements: "ভাড়া চুক্তিপত্র",
    rentCollection: "ভাড়া কালেকশন",
    userManagement: "ইউজার ম্যানেজমেন্ট",
    settings: "সেটিংস",
    language: "ভাষা (Language)",
    bengali: "বাংলা",
    english: "English",
    appName: "ভাড়া ও সম্পত্তি ব্যবস্থাপনা",
    welcome: "স্বাগতম",
    overview: "সার্বিক পরিসংখ্যান হিসাব",
    totalCollected: "মোট সংগৃহীত ভাড়া",
    unpaidAmount: "বকেয়া ভাড়া",
    totalProperties: "মোট সম্পত্তি",
    activeTenants: "সক্রিয় ভাড়াটিয়া",
    recentCollections: "সাম্প্রতিক ভাড়া কালেকশন তালিকা",
    unitStatus: "ইউনিট সমূহের অবস্থা",
    vacant: "খালি আছে",
    occupied: "ভাড়া আছে",
    maintenance: "মেরামত চলছে",
    addProperty: "নতুন প্রিমিয়াম প্রপার্টি যোগ করুন",
    propertyName: "বিল্ডিং/প্রপার্টির নাম",
    propertyCategory: "শ্রেণীবিভাগ (ক্যাটাগরি)",
    address: "সুনির্দিষ্ট অবস্থান ঠিকানা",
    totalUnits: "মোট ফ্ল্যাট / রুম সংখ্যা",
    propertyPhoto: "প্রপার্টির ছবি আপলোড করুন",
    propertyPhotoHelp: "কম্পিউটার/মোবাইল থেকে ছবি (JPG, PNG) আপলোড বা ড্র্যাগ করুন। অথবা খালি রাখলে চমৎকার ছবি অটোমেটিক সেট হবে।",
    addUnit: "নতুন ইউনিট/ফ্ল্যাট/দোকান যোগ করুন",
    unitNo: "ফ্ল্যাট/রুম নং",
    monthlyRent: "মাসিক ভাড়া",
    securityDeposit: "সিকিউরিটি ডিপোজিট",
    actions: "অ্যাকশন",
    noData: "কোনো তথ্য পাওয়া যায়নি।",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    delete: "মুছে ফেলুন",
    edit: "সম্পাদনা",
    nid: "জাতীয় পরিচয়পত্র (NID) নম্বর",
    tenantName: "ভাড়াটিয়ার নাম",
    phone: "মোবাইল নম্বর",
    emergencyContact: "জরুরী যোগাযোগ নম্বর",
    permanentAddress: "স্থায়ী ঠিকানা",
    numberOfFamily: "পরিবারের সদস্য সংখ্যা",
    addTenant: "নতুন ভাড়াটিয়া যোগ করুন",
    createAgreement: "প্রপার এগ্রিমেন্ট তৈরি করুন",
    startDate: "চুক্তি শুরু",
    endDate: "চুক্তি শেষ",
    agreementNumber: "চুক্তি নং/আইডি",
    terms: "শর্তাবলী ও নিয়মসমূহ",
    signLease: "ডিজিটাল চুক্তিপত্র সংরক্ষণ করুন",
    addPayment: "ভাড়া কালেকশন রিসিপ্ট তৈরি",
    month: "ভাড়ার মাস",
    paidAmount: "গৃহীত টাকার পরিমাণ",
    dueAmount: "বকেয়ার পরিমাণ",
    paymentMethod: "পেমেন্ট মাধ্যম",
    receiptNo: "রসিদ নম্বর",
    printReceipt: "রসিদ প্রিন্ট করুন",
    printAgreement: "চুক্তিপত্র প্রিন্ট করুন",
    downloadPDF: "পিডিএফ ডাউনলোড / প্রিন্ট",
    bdtSymbol: "৳",
    search: "খুঁজুন...",
    house: "বাড়ি / ভবন (Residential Building)",
    flat: "ফ্ল্যাট / অ্যাপার্টমেন্ট (Flat/Apartment)",
    shop: "দোকান / বাণিজ্যিক স্পেস (Shop/Commercial)",
    office: "অফিস / বাণিজ্যিক অফিস (Office/Commercial)",
    ownerPerspective: "মালিক হোন",
    tenantPerspective: "ভাড়াটিয় হোন",
    switchRole: "পদ্ধতি পরিবর্তন",
    activeAgreement: "সক্রিয়",
    expiredAgreement: "মেয়াদোত্তীর্ণ",
    terminatedAgreement: "বাতিলকৃত",
    userPerspectives: "সিস্টেম ইউজার রোল ও অনুমতি",
    ownerSettings: "বাড়িওয়ালা প্রোফাইল সেটিংস",
    menuSettings: "মেনু নেভিগেশন সেটিংস",
    accentColor: "সিস্টেম কালার থিম",
    unpaid: "পরিশোধিত নয়",
    paid: "পরিশোধিত",
    partial: "আংশিক পরিশোধিত",
    status: "অবস্থা",
    loggedBy: "দাখিলকারী",
    saveSettings: "কনফিগারেশন আপডেট করুন",
    confirmDelete: "আপনি কি নিশ্চিতভাবে এই তথ্যটি ডিলিট করতে চান?",
    agreementDetail: "ভাড়াটিয়া ও মালিক চুক্তিপত্র বিস্তারিত",
    rentAmount: "ভাড়ার পরিমাণ",
    firstParty: "প্রথম পক্ষ (মালিক)",
    secondParty: "দ্বিতীয় পক্ষ (ভাড়াটিয়া)",
    signatureLandlord: "মালিকের স্বাক্ষর",
    signatureTenant: "ভাড়াটিয়ার স্বাক্ষর",
    witness: "সাক্ষীদের স্বাক্ষর",
    agreementDateRule: "উভয় পক্ষ স্বেচ্ছায় স্বজ্ঞানে এই চুক্তিপত্রটি বাংলাদেশের প্রচলিত আইনানুযায়ী সম্পাদন করিলেন।",
    paymentSuccess: "ভাড়া পরিশোধের তথ্য সফলভাবে সিস্টেমে যুক্ত হয়েছে।",
    maintenanceLogs: "রক্ষণাবেক্ষণ ও সুয়ারেজ কাজের রেকর্ডসমূহ",
    addMaintenanceLog: "নতুন মেরামত রেকর্ড যোগ করুন",
    repairTask: "সহজ মেরামত কাজ বিবরণী",
    costAmount: "খরচ (টাকা পরিমাণ)",
    technicianName: "টেকনিশিয়ানের নাম",
    technicianPhone: "যোগাযোগ মোবাইল",
    completionStatus: "কাজ সমাপ্তির অবস্থা",
    noLogs: "এই সম্পত্তির জন্য এখনও কোনো রক্ষণাবেক্ষণ কাজ তালিকাভুক্ত করা হয়নি।",
    loggedDate: "দাখিলের তারিখ"
  }
};
