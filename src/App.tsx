/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Property,
  SubUnit,
  Tenant,
  LicenseAgreement,
  RentCollectionRecord,
  UserProfile,
  SystemSettings,
  DEFAULT_TRANSLATIONS,
  MaintenanceLog,
} from "./types";
import Dashboard from "./components/Dashboard";
import PropertyManager from "./components/PropertyManager";
import TenantManager from "./components/TenantManager";
import AgreementManager from "./components/AgreementManager";
import RentCollection from "./components/RentCollection";
import UserManagement from "./components/UserManagement";
import SettingsPanel from "./components/SettingsPanel";

import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  DollarSign,
  UserCheck,
  Settings,
  LogOut,
  Globe,
  Menu,
  X,
  Lock,
  Building2,
  Phone,
  LayoutGrid,
  ShoppingBag,
  Briefcase,
  Cloud,
  CloudOff,
  RefreshCw
} from "lucide-react";

import { loadCollection, saveCollection, loadSettings, saveSettings } from "./firebase";


// Standard seed data to populate on first load
const INITIAL_PROPERTIES: Property[] = [
  { id: "prop_1", name: "Shapla Garden Villa", category: "Flat", address: "Sector 10, Road 12, Uttara, Dhaka", unitsCount: 3, imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80" },
  { id: "prop_2", name: "Mirpur Commercial Complex", category: "Shop", address: "Mirpur 10 Circle, Dhaka", unitsCount: 2, imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
  { id: "prop_3", name: "Karwan Bazar Corporate Hub", category: "Office", address: "Kazi Nazrul Islam Avenue, Dhaka", unitsCount: 2, imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
];

const INITIAL_SUB_UNITS: SubUnit[] = [
  { id: "unit_1", propertyId: "prop_1", unitNo: "Apartment 3A", category: "Flat", monthlyRent: 18000, securityDeposit: 36000, status: "Occupied", currentTenantId: "tenant_1" },
  { id: "unit_2", propertyId: "prop_1", unitNo: "Apartment 4B", category: "Flat", monthlyRent: 20000, securityDeposit: 40000, status: "Vacant" },
  { id: "unit_3", propertyId: "prop_1", unitNo: "Apartment 5C", category: "Flat", monthlyRent: 22000, securityDeposit: 44000, status: "Maintenance" },
  { id: "unit_4", propertyId: "prop_2", unitNo: "Shop No-12 (Ground Floor)", category: "Shop", monthlyRent: 35000, securityDeposit: 100000, status: "Occupied", currentTenantId: "tenant_2" },
  { id: "unit_5", propertyId: "prop_2", unitNo: "Shop No-14 (1st Floor)", category: "Shop", monthlyRent: 25000, securityDeposit: 75000, status: "Vacant" },
  { id: "unit_6", propertyId: "prop_3", unitNo: "Suite 401", category: "Office", monthlyRent: 65000, securityDeposit: 180000, status: "Occupied", currentTenantId: "tenant_3" },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: "tenant_1", name: "Ariful Islam", phone: "01712984532", nidOrPassport: "4123567890123", email: "ariful@outlook.com", permanentAddress: "Vill: Shapla, P.O: Faridpur, Kotwali, Faridpur", emergencyContact: "01712000000", familyMembersCount: 4, advancedPayment: 36000 },
  { id: "tenant_2", name: "Anisur Rahman (Modina Jewelers)", phone: "01815123456", nidOrPassport: "9876543210123", email: "modina.jw@gmail.com", permanentAddress: "H-12, Ward 5, Chaumuhani, Noakhali", emergencyContact: "01815111111", familyMembersCount: 2, advancedPayment: 100000 },
  { id: "tenant_3", name: "Kamrul Hasan (CEO, FinTech Ltd)", phone: "01911432103", nidOrPassport: "3512345678900", email: "ceo@fintech.com.bd", permanentAddress: "Kakra, P.O: Chauddagram, Comilla", emergencyContact: "01911999999", familyMembersCount: 8, advancedPayment: 180000 },
];

const INITIAL_AGREEMENTS: LicenseAgreement[] = [
  { id: "lease_1", subUnitId: "unit_1", propertyId: "prop_1", tenantId: "tenant_1", startDate: "2026-01-01", endDate: "2027-01-01", monthlyRentAmount: 18000, depositAmount: 36000, termsAndConditions: "1. Rent must be paid within 10th of every month.\n2. Tenant is responsible for internal cleaning and electricity bills.\n3. Modification of walls is restricted.", status: "Active", agreementDocNo: "AGR-DH-652310" },
  { id: "lease_2", subUnitId: "unit_4", propertyId: "prop_2", tenantId: "tenant_2", startDate: "2025-06-01", endDate: "2028-06-01", monthlyRentAmount: 35000, depositAmount: 100000, termsAndConditions: "1. Monthly payment strictly by Bank Transfer.\n2. Service charge of 1000 BDT applies monthly.\n3. Notice period is 3 months.", status: "Active", agreementDocNo: "AGR-DH-321556" },
  { id: "lease_3", subUnitId: "unit_6", propertyId: "prop_3", tenantId: "tenant_3", startDate: "2026-01-01", endDate: "2027-12-31", monthlyRentAmount: 65000, depositAmount: 180000, termsAndConditions: "1. Maintenance and safety strictly monitored.\n2. Commercial tax is payable by the second party tenant.\n3. Refund policy as per agreements.", status: "Active", agreementDocNo: "AGR-DH-901124" },
];

const INITIAL_RENT_RECORDS: RentCollectionRecord[] = [
  { id: "rec_1", leaseId: "lease_1", subUnitId: "unit_1", propertyId: "prop_1", tenantId: "tenant_1", monthString: "2026-06", amountPaid: 18000, amountDue: 0, paymentDate: "2026-06-05", paymentMethod: "Bkash", status: "Paid", receiverName: "Al-Amin Hossain", receiptNo: "REC-B-125631" },
  { id: "rec_2", leaseId: "lease_1", subUnitId: "unit_1", propertyId: "prop_1", tenantId: "tenant_1", monthString: "2026-05", amountPaid: 18000, amountDue: 0, paymentDate: "2026-05-04", paymentMethod: "Bkash", status: "Paid", receiverName: "Al-Amin Hossain", receiptNo: "REC-B-098522" },
  { id: "rec_3", leaseId: "lease_2", subUnitId: "unit_4", propertyId: "prop_2", tenantId: "tenant_2", monthString: "2026-06", amountPaid: 35000, amountDue: 0, paymentDate: "2026-06-03", paymentMethod: "Bank Transfer", status: "Paid", receiverName: "Al-Amin Hossain", receiptNo: "REC-B-852113" },
  { id: "rec_4", leaseId: "lease_3", subUnitId: "unit_6", propertyId: "prop_3", tenantId: "tenant_3", monthString: "2026-06", amountPaid: 65000, amountDue: 0, paymentDate: "2026-06-06", paymentMethod: "Bank Transfer", status: "Paid", receiverName: "Al-Amin Hossain", receiptNo: "REC-B-963025" },
  { id: "rec_5", leaseId: "lease_1", subUnitId: "unit_1", propertyId: "prop_1", tenantId: "tenant_1", monthString: "2026-04", amountPaid: 15000, amountDue: 3000, paymentDate: "2026-04-09", paymentMethod: "Cash", status: "Partial", receiverName: "Al-Amin Hossain", receiptNo: "REC-B-072314" },
];

const INITIAL_USERS: UserProfile[] = [
  { id: "usr_1", name: "Joy Dutta", email: "joydutta@gmail.com", phone: "01712345678", role: "Owner", isActive: true, password: "Joy@398878j", allowedMenus: ["dashboard", "properties", "tenants", "agreements", "rentCollection", "userManagement", "settings"] },
  { id: "usr_2", name: "Zubair Ahmed", email: "zubair.manager@bashabari.com", phone: "01822334455", role: "Manager", isActive: true, password: "123456", allowedMenus: ["dashboard", "properties", "tenants", "agreements", "rentCollection"] },
  { id: "usr_3", name: "Ariful Islam", email: "ariful@outlook.com", phone: "01712984532", role: "Tenant", isActive: true, password: "123456" },
];

const INITIAL_MAINTENANCE_LOGS: MaintenanceLog[] = [
  { id: "ml_1", propertyId: "prop_1", subUnitId: "unit_3", repairTask: "Fix bathroom tap and pipe leakage", cost: 1800, completedStatus: "In Progress", technicianName: "Rafiqul Islam", technicianPhone: "01819234567", loggedDate: "2026-06-15" },
  { id: "ml_2", propertyId: "prop_1", subUnitId: "unit_1", repairTask: "Ceiling fan spark repair & wiring replace", cost: 1200, completedStatus: "Completed", technicianName: "Milon Miah (Electrician)", technicianPhone: "01715432109", loggedDate: "2026-06-10" },
  { id: "ml_3", propertyId: "prop_2", subUnitId: "unit_5", repairTask: "Shutter lock and rolling hinge greasing", cost: 2500, completedStatus: "Pending", technicianName: "Kabir Hossain", technicianPhone: "01912876543", loggedDate: "2026-06-18" },
];

const DEFAULT_SETTINGS: SystemSettings = {
  appNameEN: "Property & Rent System",
  appNameBN: "ভাড়া ও সম্পত্তি ব্যবস্থাপনা",
  logoTextEN: "🏢 bashaBari",
  logoTextBN: "🏢 বাসাবাড়ি",
  primaryColor: "indigo", // Available: indigo, emerald, amber, cyan, rose
  ownerNameEN: "Joy Dutta",
  ownerNameBN: "জয় দত্ত",
  contactPhone: "01712345678",
  bdtSymbol: "৳",
  termsTemplateEN: "1. Monthly rent must be cleared within the 10th of each running month.\n2. Advanced security deposit is refundable upon termination after utility adjustments.\n3. Pets are strictly prohibited without primary written consent.",
  termsTemplateBN: "১. রানিং প্রতি মাসের ১০ তারিখের মধ্যে ভাড়াটিয়া ফ্ল্যাট ভাড়া পরিশোধ করতে বাধ্য থাকিবেন।\n২. চুক্তিনামা সমাপ্তির সময় গ্যাস, পানি ও গ্যাস বিল বা বকেয়া সমন্বয় সাপেক্ষে অগ্রিম জামানত ফেরতযোগ্য।\n৩. বাড়িওয়ালার লিখিত অনুমতি ব্যতীত ঘরে পোষা প্রাণী রাখা দণ্ডনীয় হিসেবে গণ্য হবে।",
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

export default function App() {
  // Locale State
  const [lang, setLang] = useState<"en" | "bn">(() => {
    const stored = localStorage.getItem("bb_lang");
    return (stored === "en" || stored === "bn") ? stored : "bn"; 
  });

  // Database core state with dynamic local storage cache syncing
  const [properties, setProperties] = useState<Property[]>(() => {
    const stored = localStorage.getItem("bb_properties");
    return stored ? JSON.parse(stored) : INITIAL_PROPERTIES;
  });

  const [subUnits, setSubUnits] = useState<SubUnit[]>(() => {
    const stored = localStorage.getItem("bb_subunits");
    return stored ? JSON.parse(stored) : INITIAL_SUB_UNITS;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const stored = localStorage.getItem("bb_tenants");
    return stored ? JSON.parse(stored) : INITIAL_TENANTS;
  });

  const [agreements, setAgreements] = useState<LicenseAgreement[]>(() => {
    const stored = localStorage.getItem("bb_agreements");
    return stored ? JSON.parse(stored) : INITIAL_AGREEMENTS;
  });

  const [rentRecords, setRentRecords] = useState<RentCollectionRecord[]>(() => {
    const stored = localStorage.getItem("bb_rentrecords");
    return stored ? JSON.parse(stored) : INITIAL_RENT_RECORDS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const stored = localStorage.getItem("bb_maintenancelogs");
    return stored ? JSON.parse(stored) : INITIAL_MAINTENANCE_LOGS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const stored = localStorage.getItem("bb_users");
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const stored = localStorage.getItem("bb_settings");
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  // Authentication Simulate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("bb_logged") === "true";
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem("bb_current_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id === "usr_1" || parsed.email === "joydutta398878@gmail.com" || parsed.email === "joydutta@gmail.com") {
          parsed.email = "joydutta@gmail.com";
          parsed.password = "Joy@398878j";
          localStorage.setItem("bb_current_user", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_USERS[0];
  });

  // Cloud Synchronization syncState definitions
  const [syncStatus, setSyncStatus] = useState<"loading" | "synced" | "syncing" | "error">("loading");
  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(false);

  // UI state
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("joydutta@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Load from Cloud once on startup
  useEffect(() => {
    async function initCloudData() {
      setSyncStatus("loading");
      try {
        console.log("Starting full sync with Firestore...");
        
        const cloudProperties = await loadCollection("properties", INITIAL_PROPERTIES);
        setProperties(cloudProperties);

        const cloudSubunits = await loadCollection("subUnits", INITIAL_SUB_UNITS);
        setSubUnits(cloudSubunits);

        const cloudTenants = await loadCollection("tenants", INITIAL_TENANTS);
        setTenants(cloudTenants);

        const cloudAgreements = await loadCollection("agreements", INITIAL_AGREEMENTS);
        setAgreements(cloudAgreements);

        const cloudRentRecords = await loadCollection("rentRecords", INITIAL_RENT_RECORDS);
        setRentRecords(cloudRentRecords);

        const cloudLogs = await loadCollection("maintenanceLogs", INITIAL_MAINTENANCE_LOGS);
        setMaintenanceLogs(cloudLogs);

        const cloudUsers = await loadCollection("users", INITIAL_USERS);
        // Ensure the permanent admin 'Joy Dutta' credentials are up-to-date
        const migratedUsers = cloudUsers.map(user => {
          if (user.id === "usr_1" || user.email === "joydutta398878@gmail.com") {
            return {
              ...user,
              email: "joydutta@gmail.com",
              name: "Joy Dutta",
              password: "Joy@398878j"
            };
          }
          return user;
        });
        setUsers(migratedUsers);

        const cloudSettings = await loadSettings(DEFAULT_SETTINGS);
        setSettings(cloudSettings);

        setIsCloudLoaded(true);
        setSyncStatus("synced");
        console.log("Completed sync with Firestore.");
      } catch (err) {
        console.error("Failed to load Firebase data:", err);
        setSyncStatus("error");
      }
    }
    initCloudData();
  }, []);

  // Save changes to localStorage & Cloud Firestore model
  useEffect(() => {
    localStorage.setItem("bb_properties", JSON.stringify(properties));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("properties", properties)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [properties, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_subunits", JSON.stringify(subUnits));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("subUnits", subUnits)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [subUnits, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_tenants", JSON.stringify(tenants));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("tenants", tenants)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [tenants, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_agreements", JSON.stringify(agreements));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("agreements", agreements)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [agreements, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_rentrecords", JSON.stringify(rentRecords));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("rentRecords", rentRecords)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [rentRecords, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_maintenancelogs", JSON.stringify(maintenanceLogs));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("maintenanceLogs", maintenanceLogs)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [maintenanceLogs, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_users", JSON.stringify(users));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveCollection("users", users)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [users, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_settings", JSON.stringify(settings));
    if (isCloudLoaded) {
      setSyncStatus("syncing");
      saveSettings(settings)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }
  }, [settings, isCloudLoaded]);

  useEffect(() => {
    localStorage.setItem("bb_lang", lang);
  }, [lang]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (foundUser) {
      if (!foundUser.isActive) {
        setLoginError(lang === "bn" ? "এই ইউজার প্রোফাইলটি নিষ্ক্রিয় রয়েছে!" : "This user account is deactivated!");
        return;
      }
      const requiredPassword = foundUser.password || "123456";
      if (loginPassword !== requiredPassword) {
        setLoginError(lang === "bn" ? "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" : "Incorrect password. Please try again.");
        return;
      }
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      setLoginError("");
      setLoginPassword("");
      localStorage.setItem("bb_logged", "true");
      localStorage.setItem("bb_current_user", JSON.stringify(foundUser));
    } else {
      setLoginError(lang === "bn" ? "ভুল ইমেইল আইডি! অনুগ্রহ করে নিবন্ধিত ইমেইল দিন।" : "Email ID invalid. Try logging in with your registered account email.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("bb_logged", "false");
  };

  // Switch simulation users from the panel directly
  const handleSwitchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && user.isActive) {
      setCurrentUser(user);
      localStorage.setItem("bb_current_user", JSON.stringify(user));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  // Core mutations
  const handleAddProperty = (p: Property) => {
    setProperties((prev) => [p, ...prev]);
  };

  const handleAddSubUnit = (unit: SubUnit) => {
    setSubUnits((prev) => [unit, ...prev]);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    // Also cleanup subunits
    setSubUnits((prev) => prev.filter((su) => su.propertyId !== id));
  };

  const handleDeleteSubUnit = (id: string) => {
    setSubUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const handleAddMaintenanceLog = (log: MaintenanceLog) => {
    setMaintenanceLogs((prev) => [log, ...prev]);
  };

  const handleDeleteMaintenanceLog = (id: string) => {
    setMaintenanceLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleUpdateMaintenanceStatus = (id: string, newStatus: "Pending" | "In Progress" | "Completed") => {
    setMaintenanceLogs((prev) => prev.map((log) => log.id === id ? { ...log, completedStatus: newStatus } : log));
  };

  const handleAddTenant = (t: Tenant) => {
    setTenants((prev) => [t, ...prev]);
  };

  const handleDeleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((te) => te.id !== id));
  };

  const handleAddAgreement = (newLease: LicenseAgreement) => {
    setAgreements((prev) => [newLease, ...prev]);
    // Set unit as occupied
    setSubUnits((prev) =>
      prev.map((u) => (u.id === newLease.subUnitId ? { ...u, status: "Occupied", currentTenantId: newLease.tenantId } : u))
    );
  };

  const handleTerminateAgreement = (leaseId: string) => {
    const lease = agreements.find((a) => a.id === leaseId);
    if (!lease) return;

    setAgreements((prev) =>
      prev.map((a) => (a.id === leaseId ? { ...a, status: "Terminated" } : a))
    );

    // Set unit as vacant again safely
    setSubUnits((prev) =>
      prev.map((u) => (u.id === lease.subUnitId ? { ...u, status: "Vacant", currentTenantId: undefined } : u))
    );
  };

  const handleAddRentRecord = (rec: RentCollectionRecord) => {
    setRentRecords((prev) => [rec, ...prev]);
  };

  const handleAddUser = (user: UserProfile) => {
    setUsers((prev) => [...prev, user]);
  };

  // Navigation menu selection translation helper
  const t = DEFAULT_TRANSLATIONS[lang];

  // Helper theme classes mapping
  const getThemeColors = () => {
    switch (settings.primaryColor) {
      case "emerald":
        return {
          bg: "bg-emerald-600",
          hover: "hover:bg-emerald-700",
          text: "text-emerald-600",
          ring: "focus:ring-emerald-500/20",
          border: "border-emerald-200",
          lightBg: "bg-emerald-50",
          accentFill: "bg-emerald-650",
        };
      case "indigo":
        return {
          bg: "bg-indigo-600",
          hover: "hover:bg-indigo-700",
          text: "text-indigo-600",
          ring: "focus:ring-indigo-500/20",
          border: "border-indigo-200",
          lightBg: "bg-indigo-50",
          accentFill: "bg-indigo-650",
        };
      case "amber":
        return {
          bg: "bg-amber-600",
          hover: "hover:bg-amber-700",
          text: "text-amber-600",
          ring: "focus:ring-amber-500/20",
          border: "border-amber-200",
          lightBg: "bg-amber-50",
          accentFill: "bg-amber-650",
        };
      case "cyan":
        return {
          bg: "bg-cyan-600",
          hover: "hover:bg-cyan-700",
          text: "text-cyan-600",
          ring: "focus:ring-cyan-500/20",
          border: "border-cyan-200",
          lightBg: "bg-cyan-50",
          accentFill: "bg-cyan-650",
        };
      case "rose":
        return {
          bg: "bg-rose-600",
          hover: "hover:bg-rose-700",
          text: "text-rose-600",
          ring: "focus:ring-rose-500/20",
          border: "border-rose-200",
          lightBg: "bg-rose-50",
          accentFill: "bg-rose-650",
        };
      default:
        return {
          bg: "bg-emerald-600",
          hover: "hover:bg-emerald-700",
          text: "text-emerald-600",
          ring: "focus:ring-emerald-500/20",
          border: "border-emerald-200",
          lightBg: "bg-emerald-50",
          accentFill: "bg-emerald-650",
        };
    }
  };

  const themeClasses = getThemeColors();

  // Navigation configuration array dynamically filtered based on settings
  const isTenant = currentUser?.role === "Tenant";
  const navItems = [
    { key: "dashboard", label: t.dashboard, icon: <LayoutDashboard className="h-4.5 w-4.5" />, enabled: settings.activeMenus.dashboard },
    { key: "properties", label: t.properties, icon: <Building className="h-4.5 w-4.5" />, enabled: settings.activeMenus.properties },
    { key: "tenants", label: t.tenants, icon: <Users className="h-4.5 w-4.5" />, enabled: settings.activeMenus.tenants && !isTenant },
    { key: "agreements", label: t.agreements, icon: <FileText className="h-4.5 w-4.5" />, enabled: settings.activeMenus.agreements },
    { key: "rentCollection", label: t.rentCollection, icon: <DollarSign className="h-4.5 w-4.5" />, enabled: settings.activeMenus.rentCollection },
    { key: "userManagement", label: t.userManagement, icon: <UserCheck className="h-4.5 w-4.5" />, enabled: settings.activeMenus.userManagement && !isTenant },
    { key: "settings", label: t.settings, icon: <Settings className="h-4.5 w-4.5" />, enabled: settings.activeMenus.settings && !isTenant },
  ].filter((item) => {
    if (!item.enabled) return false;
    if (isTenant && ["tenants", "userManagement", "settings"].includes(item.key)) {
      return false;
    }
    if (currentUser?.allowedMenus) {
      return currentUser.allowedMenus.includes(item.key);
    }
    return true;
  });

  // Switch menus if active page was disabled in settings
  useEffect(() => {
    const isCurrentMenuEnabled = navItems.some((n) => n.key === activeMenu);
    if (!isCurrentMenuEnabled && navItems.length > 0) {
      setActiveMenu(navItems[0].key);
    }
  }, [settings.activeMenus, activeMenu, isTenant]);

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        {/* Language selector on top-right */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>{lang === "bn" ? "English" : "বাংলা"}</span>
          </button>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
          {/* Logo brand styling */}
          <div className="flex justify-center text-5xl">
            🏢
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === "bn" ? settings.appNameBN : settings.appNameEN}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {lang === "bn"
              ? "বাংলাদেশের আধুনিক বাড়ি-ভাড়া কালেকশন সলিউশন"
              : "Modern Property Rental & Deed Registrar - Bangladesh"}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-scale-up">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-100 rounded-3xl sm:px-10 space-y-6">
            <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl">
              <Lock className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "bn"
                  ? "পোর্টালে লগইন করার জন্য অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল আইডি এবং পাসওয়ার্ড ব্যবহার করুন।"
                  : "Please enter your assigned Email Address and Password to access the property manager dashboard."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {lang === "bn" ? "মালিকের ইমেইল আইডি" : "Owner Registered Email"}
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  placeholder="joydutta@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {lang === "bn" ? "নিরাপদ পাসওয়ার্ড" : "Secure Password"}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  placeholder="••••••••"
                />
              </div>

              {loginError && <p className="text-xs text-rose-600 font-bold font-mono">{loginError}</p>}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 border border-indigo-650 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer"
              >
                {lang === "bn" ? "লগইন করুন →" : "Sign In Portal →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // CORE APPLICATION SHELL (AFTER LOGIN)
  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800 font-sans flex flex-col md:flex-row relative">
      {/* Side Navigation - Fixed on Large, drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 text-white w-64 z-40 transform md:translate-x-0 transition-transform duration-300 md:static md:flex md:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-0 hidden md:block"
        } border-r border-slate-800 print:hidden flex-none`}
      >
        {/* Brand identity */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏢</span>
            <div>
              <span className="font-extrabold text-sm block tracking-tight text-white uppercase font-mono">
                {lang === "bn" ? settings.logoTextBN : settings.logoTextEN}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">
                {currentUser.role} portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveMenu(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? `${themeClasses.bg} text-white shadow-md shadow-emerald-950/20`
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold font-mono">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-xs text-slate-100 block truncate leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate block mt-0.5">
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition-all font-mono"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{lang === "bn" ? "লগআউট" : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Controls bar */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 sticky top-0 z-35 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 p-1 hover:bg-slate-50 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>

            <span className="text-sm font-extrabold text-slate-700 font-mono tracking-tight capitalize hidden sm:block">
              {lang === "bn" ? settings.appNameBN : settings.appNameEN}
            </span>
          </div>

          {/* Top-right controls */}
          <div className="flex items-center gap-3">

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-colors border-slate-100 bg-slate-50/50">
              {syncStatus === "loading" && (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                  <span className="text-indigo-600 font-mono text-[10px] uppercase font-black">
                    {lang === "bn" ? "ক্লাউড কানেক্ট হচ্ছে..." : "Connecting Cloud..."}
                  </span>
                </>
              )}
              {syncStatus === "syncing" && (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                  <span className="text-amber-600 font-mono text-[10px] uppercase font-black">
                    {lang === "bn" ? "সিঙ্ক হচ্ছে..." : "Syncing..."}
                  </span>
                </>
              )}
              {syncStatus === "synced" && (
                <>
                  <Cloud className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-700 font-mono text-[10px] uppercase font-semibold">
                    {lang === "bn" ? "ক্লাউড লাইভ" : "Cloud Active"}
                  </span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <CloudOff className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-rose-600 font-mono text-[10px] uppercase font-semibold">
                    {lang === "bn" ? "লোকাল ক্যাশ" : "Local Cached"}
                  </span>
                </>
              )}
            </div>

            {/* Language switcher */}
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            {/* Quick stats / user status */}
            <div className="hidden md:flex items-center gap-2 border-l border-slate-100 pl-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Server live
              </span>
            </div>
          </div>
        </header>

        {/* Core Screen Space with print constraints */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto print:p-0 print:m-0 print:bg-white bg-slate-50/10">
          <div className="print:hidden">
            {activeMenu === "dashboard" && (
              <Dashboard
                properties={properties}
                subUnits={subUnits}
                tenants={tenants}
                agreements={agreements}
                rentRecords={rentRecords}
                settings={settings}
                lang={lang}
                currentUser={currentUser}
              />
            )}

            {activeMenu === "properties" && (
              <PropertyManager
                properties={properties}
                subUnits={subUnits}
                settings={settings}
                onAddProperty={handleAddProperty}
                onAddSubUnit={handleAddSubUnit}
                onDeleteProperty={handleDeleteProperty}
                onDeleteSubUnit={handleDeleteSubUnit}
                maintenanceLogs={maintenanceLogs}
                onAddMaintenanceLog={handleAddMaintenanceLog}
                onDeleteMaintenanceLog={handleDeleteMaintenanceLog}
                onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                lang={lang}
                currentUser={currentUser}
              />
            )}

            {activeMenu === "tenants" && (
              <TenantManager
                tenants={tenants}
                settings={settings}
                onAddTenant={handleAddTenant}
                onDeleteTenant={handleDeleteTenant}
                lang={lang}
              />
            )}

            {activeMenu === "agreements" && (
              <AgreementManager
                agreements={agreements}
                properties={properties}
                subUnits={subUnits}
                tenants={tenants}
                settings={settings}
                onAddAgreement={handleAddAgreement}
                onTerminateAgreement={handleTerminateAgreement}
                lang={lang}
                currentUser={currentUser}
              />
            )}

            {activeMenu === "rentCollection" && (
              <RentCollection
                rentRecords={rentRecords}
                agreements={agreements}
                properties={properties}
                subUnits={subUnits}
                tenants={tenants}
                settings={settings}
                onAddRentRecord={handleAddRentRecord}
                lang={lang}
                currentUser={currentUser}
              />
            )}

            {activeMenu === "userManagement" && (
              <UserManagement
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onToggleUserStatus={handleToggleUserStatus}
                onSwitchUser={handleSwitchUser}
                lang={lang}
              />
            )}

            {activeMenu === "settings" && (
              <SettingsPanel
                settings={settings}
                onUpdateSettings={setSettings}
                lang={lang}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
