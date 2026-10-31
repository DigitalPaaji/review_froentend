"use client";

import LeftHeroPanel from "@/components/LeftHeroPanel";
import React, { useState } from "react";
import Link from "next/link";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import axios from "axios";
import { base_url } from "@/components/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
axios.defaults.withCredentials = true


const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
const route = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
     try {
      const response = await axios.post(`${base_url}/client/auth/login`,formData);
      const data = await response.data;
      if(data.success){
        toast.success(data.message)
        route.push("/")
      }
      else{
  toast.error(data.message)
  
}

} catch (error) {
       toast.error(error?.response?.data?.message)
      
     }

  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#090D16] font-sans">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* Left Panel */}
        <section className="hidden min-h-screen lg:block">
          <LeftHeroPanel />
        </section>

        {/* Login Section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-6 sm:px-8">

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="relative w-full max-w-[370px]">

            {/* Mobile Logo */}
            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <FiLock size={21} />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Client Portal
              </h1>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Secure Client Access
              </span>

              <h2 className="text-[28px] font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-1.5 text-[13px] text-slate-500">
                Sign in to continue to your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Phone Address
                </label>

                <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                  <FiMail size={17} className="text-slate-400" />

                  <input
                    type="phone"
                    name="phone"
                    required
                    autoComplete="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                  <FiLock size={17} className="text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-indigo-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />
                  Remember me
                </label>

                <span className="text-[10px] font-medium text-emerald-600">
                  ● Secure Login
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-[13px] font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99]"
              >
                Sign In
                <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {/* Create Account */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-7 border-t border-slate-100 pt-4 text-center">
              <p className="text-[10px] text-slate-400">
                {/* © {new Date().getFullYear()} */}
                
                 Client Portal. All rights reserved.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;