"use client"
import LeftHeroPanel from '@/components/LeftHeroPanel'
import { base_url } from '@/components/utils'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiBriefcase, FiCheckCircle, FiLoader, FiLock, FiMail, FiRefreshCw, FiShield } from 'react-icons/fi'
import { SiNamecheap } from 'react-icons/si'

const page = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name:"",
    phone: "",
    password: "",
    businessName: "",
  });

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);



 useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

 const sendOtp = async (event) => {
    if (event) event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim().toLowerCase();
    const phone = formData.phone.trim().toLowerCase();
    const businessName = formData.businessName.trim();

    if (!name || !phone || !businessName || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${base_url}/client/auth/account-requests`, {
        name,
        phone,
        password: formData.password,
        businessName,
      });

      setFormData((previous) => ({
        ...previous,
        phone,
        businessName,
      }));

      setOtp("");
      setStep(2);
      setCountdown(60);
      setSuccess(response.data?.message || "OTP sent to your phone.");
    } catch (err) {
        console.log(err)
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


    const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${base_url}/client/auth/verify-otp`, {
        name: formData.name.trim().toLowerCase(),
        phone: formData.phone.trim().toLowerCase(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        otp,
      });

      setSuccess(response.data?.message || "Account created successfully.");
          router.push("/login");

    //   setTimeout(() => {
    //   }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await axios.post(`${base_url}/client/auth/account-requests`, {
        name: formData.name.trim().toLowerCase(),
        phone: formData.phone.trim().toLowerCase(),
        password: formData.password,
        businessName: formData.businessName.trim(),
      });

      setOtp("");
      setCountdown(60);
      setSuccess(response.data?.message || "A new OTP has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
   <main className="min-h-screen bg-white text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:block">
          <LeftHeroPanel />
        </div>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-2 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <FiShield size={21} />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Digital Paaji
                </span>
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                {step === 1 ? "Create your account" : "phone verification"}
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {step === 1 ? "Start your journey" : "Verify your phone"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {step === 1
                  ? "Create your Digital Paaji account to manage your business."
                  : `We sent a 6-digit verification code to ${formData.phone}.`}
              </p>
            </div>

            <div className="mb-7 flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= 1
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {step > 1 ? <FiCheckCircle size={18} /> : "1"}
              </div>

              <div
                className={`h-1 flex-1 rounded-full ${
                  step === 2 ? "bg-black" : "bg-gray-200"
                }`}
              />

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  step === 2
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                2
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <FiCheckCircle className="mt-0.5 shrink-0" size={18} />
                <p>{success}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <SiNamecheap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your Full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Business name
                  </label>

                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                      autoComplete="organization"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    phone address
                  </label>

                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      id="phone"
                      name="phone"
                      type="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      autoComplete="phone"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-6">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-semibold"
                  >
                    6-digit verification code
                  </label>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Enter the code sent to your phone. It may expire after
                    five minutes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify and create account
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={countdown > 0 || resending || loading}
                    className="flex items-center gap-2 font-semibold text-gray-700 transition hover:text-black disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {resending ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <FiRefreshCw size={16} />
                    )}

                    {resending
                      ? "Resending..."
                      : countdown > 0
                      ? `Resend OTP in ${countdown}s`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                      setSuccess("");
                    }}
                    className="flex items-center gap-2 text-gray-500 transition hover:text-black"
                  >
                    <FiArrowLeft size={16} />
                    Back to registration
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default page