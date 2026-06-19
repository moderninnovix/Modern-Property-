/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, DEFAULT_TRANSLATIONS } from "../types";
import { Users, Shield, Plus, ToggleLeft, ToggleRight, Mail, Phone, Flame, SwitchCamera, Check } from "lucide-react";

interface UserManagementProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (user: UserProfile) => void;
  onToggleUserStatus: (id: string) => void;
  onSwitchUser: (id: string) => void;
  lang: "en" | "bn";
}

export default function UserManagement({
  users,
  currentUser,
  onAddUser,
  onToggleUserStatus,
  onSwitchUser,
  lang,
}: UserManagementProps) {
  const t = DEFAULT_TRANSLATIONS[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Tenant");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      role,
      isActive: true,
    };

    onAddUser(newUser);
    setName("");
    setEmail("");
    setPhone("");
    setRole("Tenant");
    setShowAddModal(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "Owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Manager":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Tenant":
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            {lang === "bn" ? "👥 ইউজার ম্যানেজমেন্ট এবং অ্যাক্সেস কন্ট্রোল" : "👥 User Management & Access Control"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "bn"
              ? "মালিক, ম্যানেজার এবং ভাড়াটিয়াদের প্রোফাইল তৈরি করুন এবং সিস্টেম ভিউ সিমুলেট করুন।"
              : "Create profiles for Landlords, Managers, or Tenants, and simulate their account dashboards."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "নতুন ইউজার যোগ করুন" : "Add New System User"}
        </button>
      </div>

      {/* Active User Overview card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs bg-slate-700 text-slate-200 px-3 py-1 rounded-full uppercase tracking-wider font-semibold font-mono">
              {lang === "bn" ? "সক্রিয় লগইন সেশন" : "Active Simulated Session"}
            </span>
            <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
              {currentUser.name}
              <span className={`text-xs ml-2 px-2.5 py-0.5 rounded-full border ${getRoleBadge(currentUser.role)}`}>
                {currentUser.role === "Owner"
                  ? (lang === "bn" ? "মালিক (First Party)" : "System Owner")
                  : currentUser.role === "Manager"
                  ? (lang === "bn" ? "ম্যানেজার" : "Property Manager")
                  : (lang === "bn" ? "ভাড়াটিয়া" : "Occupant / Tenant")}
              </span>
            </h2>
            <p className="text-slate-300 text-sm font-mono mt-1">{currentUser.email} • {currentUser.phone || "No Phone"}</p>
          </div>
          <Shield className="h-12 w-12 text-indigo-400 opacity-90 animate-pulse hidden md:block" />
        </div>
        <div className="mt-5 pt-3 border-t border-slate-700/50 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-xs text-slate-300">
          <span>
            {lang === "bn"
              ? "💡 আপনি যেকোনো প্রোফাইলের 'সুইচ' বাটনে ক্লিক করে সেই রোল অনুযায়ী পুরো পোর্টালটির ম্যাট্রিক্স ও হিসাব দেখতে পাবেন।"
              : "💡 You can simulate any profile. Switching changes the primary platform statistics & view filters."}
          </span>
          <span className="font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded border border-indigo-500/20">
            {lang === "bn" ? "রোল-ভিত্তিক ভোল্ট" : "Role Enforcement Secure"}
          </span>
        </div>
      </div>

      {/* User list table representation */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-base">
            {lang === "bn" ? "সিস্টেম ইউজারদের তালিকা" : "Registered Users & Access Roles"}
          </h3>
          <span className="text-xs text-slate-400 font-mono italic">
            Total count: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 font-medium">{t.tenantName}</th>
                <th className="px-6 py-3.5 font-medium">{lang === "bn" ? "ইউজার রোল" : "Access Level"}</th>
                <th className="px-6 py-3.5 font-medium">{t.phone} / Email</th>
                <th className="px-6 py-3.5 font-medium">{lang === "bn" ? "অ্যাক্সেস স্ট্যাটাস" : "Account Status"}</th>
                <th className="px-6 py-3.5 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {users.map((profile) => (
                <tr
                  key={profile.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    currentUser.id === profile.id ? "bg-indigo-50/10" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono">
                        {profile.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block text-sm">
                          {profile.name}
                        </span>
                        {currentUser.id === profile.id && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded mt-0.5 border border-indigo-100">
                            <Check className="h-2 w-2" /> Current Active
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${getRoleBadge(profile.role)}`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-0.5 font-mono text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-slate-600 font-sans text-sm">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {profile.phone || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-300" />
                      {profile.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleUserStatus(profile.id)}
                      disabled={currentUser.id === profile.id}
                      className="cursor-pointer text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={currentUser.id === profile.id ? "Cannot disable your logged-in user session" : "Toggle Active/Inactive"}
                    >
                      {profile.isActive ? (
                        <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg">
                          <ToggleRight className="h-4.5 w-4.5" />
                          <span className="text-xs font-semibold">{lang === "bn" ? "সক্রিয়" : "Active"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-600 bg-rose-50/50 px-2.5 py-1 rounded-lg">
                          <ToggleLeft className="h-4.5 w-4.5" />
                          <span className="text-xs font-semibold">{lang === "bn" ? "নিষ্ক্রিয়" : "Disabled"}</span>
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSwitchUser(profile.id)}
                      disabled={currentUser.id === profile.id || !profile.isActive}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <SwitchCamera className="h-3.5 w-3.5" />
                      {lang === "bn" ? "সুইচ লগইন" : "Simulate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-lg">
                {lang === "bn" ? "নতুন প্রোফাইল তৈরি করুন" : "Add Simulated User"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "সম্পূর্ণ নাম" : "Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "bn" ? "উদা: মোঃ শাকিল রহমান" : "e.g. Shakil Rahman"}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {lang === "bn" ? "ইউজার রোল / পদবি" : "System Access Role"}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Owner">{lang === "bn" ? "মালিক (First Party Landlord)" : "Owner / Landlord"}</option>
                  <option value="Manager">{lang === "bn" ? "ম্যানেজার (Property Manager)" : "Manager / Supervisor"}</option>
                  <option value="Tenant">{lang === "bn" ? "ভাড়াটিয়া (Tenant)" : "Tenant / Rentee"}</option>
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
