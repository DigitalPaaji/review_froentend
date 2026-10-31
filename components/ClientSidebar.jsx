
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
} from "react-icons/fi";
import { FaQrcode } from "react-icons/fa";
import axios from "axios";
import { base_url } from "./utils";

const menuItems = [
  { name: "Dashboard", href: "/", icon: FiGrid },
  { name: "My QR Code", href: "/qr-code", icon: FaQrcode },
  { name: "Reviews", href: "/reviews", icon: FiStar },
  // { name: "Profile", href: "/profile", icon: FiUser },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

const ClientSidebar = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Client";
  const remainingName = user?.name?.trim()?.split(/\s+/).slice(1).join(" ") || "";

  const handleLogout = async () => {
    try {
      // Connect your logout API here to clear the HTTP-only cookie.
        await axios.get(`${base_url}/client/auth/logout`,
          {
        withCredentials: true,
      });

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className=" top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-5 text-slate-900 dark:border-white/10 dark:bg-[#0B1020] dark:text-white lg:hidden">
        <h2 className="text-lg font-bold capitalize tracking-wide">
          {firstName}
          <span className="text-indigo-600 dark:text-indigo-400">
            {" "}{remainingName}
          </span>
        </h2>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-xl transition hover:bg-slate-100 dark:hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`  hidden  lg:flex left-0 top-0  z-50  h-screen w-[260px] flex-col border-r transition-transform duration-300
        border-slate-200 bg-white text-slate-700
        dark:border-white/10 dark:bg-[#0B1020] dark:text-slate-200
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold capitalize tracking-wide text-slate-900 dark:text-white">
              {firstName}
              <span className="text-indigo-600 dark:text-indigo-400">
                {" "}{remainingName}
              </span>
            </h2>

            <p className="mt-1 text-[10px] uppercase tracking-[3px] text-slate-400 dark:text-slate-500">
              Client Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

   
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                >
                  <Icon className="text-lg shrink-0" />
                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

  
        <div className="shrink-0 space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {user?.businessName || "My Business"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Client Account
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>

          <div className="px-4 pt-2 text-center text-[10px] text-slate-400 dark:text-slate-600">
            © 2026 ReviewPro Portal
          </div>
        </div>
      </aside>
  <aside
        className={`  fixed  lg:hidden left-0 top-0  z-50 flex h-screen w-[260px] flex-col border-r transition-transform duration-300
        border-slate-200 bg-white text-slate-700
        dark:border-white/10 dark:bg-[#0B1020] dark:text-slate-200
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold capitalize tracking-wide text-slate-900 dark:text-white">
              {firstName}
              <span className="text-indigo-600 dark:text-indigo-400">
                {" "}{remainingName}
              </span>
            </h2>

            <p className="mt-1 text-[10px] uppercase tracking-[3px] text-slate-400 dark:text-slate-500">
              Client Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={19} />
          </button>
        </div>

   
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                >
                  <Icon className="text-lg shrink-0" />
                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

  
        <div className="shrink-0 space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
              {user?.businessName || "My Business"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Client Account
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>

          <div className="px-4 pt-2 text-center text-[10px] text-slate-400 dark:text-slate-600">
            © 2026 ReviewPro Portal
          </div>
        </div>
      </aside>
      {/* Mobile Header Spacing */}
      {/* <div className="h-16 lg:hidden" /> */}
    </>
  );
};

export default ClientSidebar;
