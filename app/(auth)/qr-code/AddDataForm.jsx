
"use client";

import axios from "axios";
import React, { useState } from "react";
import {
  FiBriefcase,
  FiMapPin,
  FiTool,
  FiX,
  FiExternalLink,
  FiHelpCircle,
  FiCheckCircle,
  FiArrowRight,
  FiGlobe,
  FiShield,
  FiFileText,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { RiFindReplaceLine } from "react-icons/ri";
import { TbBrandGoogleMaps } from "react-icons/tb";
import { base_url } from "@/components/utils";
import { useDispatch } from "react-redux";
import { addclient } from "@/components/store/clientsSlice";

const PLACE_ID_FINDER =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";

// Change this endpoint to match your backend route.
const SETUP_API = `${base_url}/client/auth/fullsetup`;

const initialData = {
  googleUrl: "",
  placeId: "",
  location: "",
  industry: "",
  services: "",
  description: "",
};

const helpContent = {
  placeid: {
    title: "Find your Google Place ID",
    subtitle: "Follow these simple steps to find your business Place ID.",
    image: "/gifs/place.gif",
    link: PLACE_ID_FINDER,
    linkText: "Open Place ID Finder",
    steps: [
      "Open Google's official Place ID Finder.",
      "Search for your exact business name and location.",
      "Select the correct business from the results.",
      "Find the Place ID displayed for your selected business.",
      "Copy the Place ID and paste it into the form.",
    ],
    note: "Enter only the Place ID, not your business name or Google Maps URL.",
  },
  googleurl: {
    title: "Get your Google Business URL",
    subtitle: "Copy the shareable link of your Google Business listing.",
    image: "/gifs/google.gif",
    link: "https://www.google.com/",
    linkText: "Open Google Search",
    steps: [
      "Open Google Search and search for your business.",
      "Select your correct Google Business Profile.",
      "Click the Share option on your business listing.",
      "Click Copy link.",
      "Paste the copied URL into the Google Business URL field.",
    ],
    note: "Make sure the URL belongs to your actual business listing.",
  },
};

const fields = [
  {
    name: "placeId",
    label: "Google Place ID",
    placeholder: "Paste your Google Place ID",
    icon: RiFindReplaceLine,
    help: "placeid",
    required: true,
  },
  {
    name: "googleUrl",
    label: "Google Business / Review URL",
    placeholder: "https://maps.app.goo.gl/...",
    icon: TbBrandGoogleMaps,
    type: "url",
    help: "googleurl",
    required: true,
  },
  {
    name: "location",
    label: "Business Location",
    placeholder: "e.g. Ludhiana, Punjab",
    icon: FiMapPin,
    required: true,
  },
  {
    name: "industry",
    label: "Industry",
    placeholder: "e.g. Restaurant, Salon, Hotel",
    icon: FiBriefcase,
    required: true,
  },
  {
    name: "services",
    label: "Services",
    placeholder: "e.g. Dining, Catering, Home Delivery",
    icon: FiTool,
    required: true,
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0B1120] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-500 dark:focus:bg-[#0B1120]";

const AddDataForm = () => {
  const [newData, setNewData] = useState(initialData);
  const [showHelp, setShowHelp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
 const dispatch = useDispatch()
  const activeHelp = showHelp ? helpContent[showHelp] : null;

  const completedFields = fields.filter(
    (field) => newData[field.name].trim() !== ""
  ).length;

  const progress = Math.round((completedFields / fields.length) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (completedFields !== fields.length) {
      setErrorMessage("Please complete all required business fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(SETUP_API, newData, {
        withCredentials: true,
      });

      if (response.data?.success) {
        setSuccessMessage(
          response.data.message || "Your business setup has been completed successfully."
        );
        dispatch(addclient(response.data?.client))
    

      } else {
        setErrorMessage(
          response.data?.message || "Unable to complete your setup."
        );
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-auto bg-slate-50 px-4 py-8 text-slate-900 transition-colors dark:bg-[#090D18] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FiShield />
            ACCOUNT SETUP
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Complete Your Setup
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Add your business information to connect your Google Business
            Profile and start collecting and managing customer reviews.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Business profile completion
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {completedFields} of {fields.length} required fields completed
              </p>
            </div>

            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {progress}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111827]"
        >
          <div className="border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiBriefcase size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Business Information</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter accurate details about your business.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.name} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>

                    {field.help && (
                      <button
                        type="button"
                        onClick={() => setShowHelp(field.help)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <FiHelpCircle size={14} />
                        Help
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Icon
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={17}
                    />

                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={newData[field.name]}
                      onChange={handleChange}
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>
                </div>
              );
            })}

            {/* Business Description */}
            <div className="min-w-0 sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Business Description
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <span className="text-xs tabular-nums text-slate-400">
                  {newData.description.length}/500
                </span>
              </div>

              <div className="relative">
                <FiFileText
                  size={18}
                  className="absolute left-3.5 top-4 text-slate-400 dark:text-slate-500"
                />

                <textarea
                  id="description"
                  name="description"
                  value={newData.description}
                  onChange={handleChange}
                  placeholder="Describe your business, what you offer, your specialties, and what makes your business unique..."
                  rows={5}
                  maxLength={500}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0B1120] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-500 dark:focus:bg-[#0B1120]"
                />
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Tip: Mention your main products, services, experience, and
                what customers can expect from your business.
              </p>
            </div>
          </div>

          {/* API Feedback */}
          {(errorMessage || successMessage) && (
            <div className="px-5 pb-4 sm:px-7">
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <FiAlertCircle className="mt-0.5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiCheckCircle className="mt-0.5 shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-5 dark:border-white/10 dark:bg-[#0B1120]/50 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                <FiCheckCircle className="mr-1 inline text-emerald-500" />
                Your information is securely submitted.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                You can update your business details later.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={17} />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <FiArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom Note */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
          <FiGlobe className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your Google Business information helps us connect your business
            profile with your review collection system. Please make sure
            your Place ID and Google Business URL are correct.
          </p>
        </div>
      </div>

      {/* Help Modal */}
      {activeHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowHelp(null)}
        >
          <div
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-indigo-50/70 p-5 dark:border-white/10 dark:bg-indigo-500/5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <FiHelpCircle />
                  Quick Guide
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeHelp.title}
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {activeHelp.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close help"
              >
                <FiX size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
              <div className="flex justify-center">
                <img
                  src={activeHelp.image}
                  alt={activeHelp.title}
                  className="max-h-36 w-full rounded-xl object-contain"
                />
              </div>

              <div className="space-y-4">
                {activeHelp.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                      {index + 1}
                    </span>

                    <p className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                <FiCheckCircle className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  {activeHelp.note}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-100 p-5 dark:border-white/10 sm:flex-row">
              <a
                href={activeHelp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {activeHelp.linkText}
                <FiExternalLink size={15} />
              </a>

              <button
                type="button"
                onClick={() => setShowHelp(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AddDataForm;
