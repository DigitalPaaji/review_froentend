"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { base_url } from "@/components/utils";

// Extract business details from savedQrUrl
const getQrData = (savedQrUrl) => {
  if (!savedQrUrl) return {};

  try {
    const parsed = JSON.parse(savedQrUrl);

    return {
      location: parsed.location || "",
      industry: parsed.industry || "",
      services: Array.isArray(parsed.services)
        ? parsed.services.join(", ")
        : parsed.services || "",
      description: parsed.description || "",
    };
  } catch {
    try {
      const url = new URL(savedQrUrl);
      const getParam = (key) => url.searchParams.get(key) || "";

      return {
        location: getParam("location"),
        industry: getParam("industry"),
        services: getParam("services"),
        description: getParam("description"),
      };
    } catch {
      return {};
    }
  }
};

// Build form state from a client object
const buildForm = (c) => {
  const qrData = getQrData(c?.savedQrUrl);

  return {
    name: c?.name || "",
    email: c?.email || "",
    phone: c?.phone || "",
    businessName: c?.businessName || "",
    placeId: c?.placeId || "",
    googleUrl: c?.googleUrl || "",
    logo: c?.logo || "",
    password: "",
    location: qrData.location || "",
    industry: qrData.industry || "",
    services: qrData.services || "",
    description: qrData.description || "",
    savedQrUrl: c?.savedQrUrl || "",
  };
};

// Reusable Input Component (defined OUTSIDE Page so it is not
// re-created on every render, which caused the focus loss)
const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
  description,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 block text-sm font-semibold text-gray-700"
    >
      {label}
    </label>

    <input
      id={name}
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
        !disabled
          ? "border-gray-200 bg-white text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-600"
      }`}
    />

    {description && (
      <p className="mt-1.5 text-xs text-gray-400">{description}</p>
    )}
  </div>
);

const Page = () => {
  const { client } = useSelector((state) => state.client);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [form, setForm] = useState(buildForm(null));

  // Load client data. Skip while editing so Redux updates
  // never wipe what the user is typing.
  useEffect(() => {
    if (client && !editing) {
      setForm(buildForm(client));
    }
  }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  // Input Handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cancel Editing
  const handleCancel = () => {
    setForm(buildForm(client));
    setEditing(false);
    setMessage("");
  };

  // Save Profile
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        placeId: form.placeId.trim(),
        googleUrl: form.googleUrl.trim(),

        // Business details (editable, sent back to backend)
        location: form.location.trim(),
        industry: form.industry.trim(),
        // Services as an array. If your backend expects a plain
        // string, use `form.services` instead.
        services: form.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description: form.description.trim(),

        ...(form.password ? { password: form.password } : {}),
      };

      // Change endpoint if your backend route is different
      const response = await axios.put(
        `${base_url}/client/auth/update-profile`,
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setEditing(false);

        if (response.data.client) {
          setForm(buildForm(response.data.client));
        } else {
          setForm((prev) => ({ ...prev, password: "" }));
        }
      } else {
        setMessage(response.data.message || "Unable to update profile.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!client) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[#F8FAFC] text-sm text-gray-500">
        Loading client settings...
      </div>
    );
  }

  return (
    <main className="h-screen overflow-auto bg-[#F8FAFC] px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-indigo-600">
              Account Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your personal information and business profile.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              ✎ Edit Profile
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-50 text-3xl font-bold text-indigo-600 shadow-sm">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Business Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (form.businessName || "B").charAt(0).toUpperCase()
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold">
                  {form.businessName || "Your Business"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">{form.email}</p>
              </div>

              <div className="sm:ml-auto sm:pb-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {client.status || (client.active ? "Active" : "Account")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Personal Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your account details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your name"
                />

                <InputField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!editing}
                  type="email"
                  placeholder="Enter email"
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter phone number"
                />
              </div>
            </section>

            {/* Business Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Business Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Business details extracted from your saved QR URL.
                </p>
              </div>

              <div className="space-y-5">
                <InputField
                  label="Business Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter business name"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputField
                    label="Business Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter location"
                  />

                  <InputField
                    label="Industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Restaurant, Hotel, Salon..."
                  />
                </div>

                <InputField
                  label="Services"
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Food, Catering, Delivery"
                  description="Separate services with commas."
                />

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Business Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Describe your business..."
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${
                      editing
                        ? "border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-600"
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Google Business */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Google Business Profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your Google review settings.
                </p>
              </div>

              <div className="space-y-5">
                <InputField
                  label="Google Place ID"
                  name="placeId"
                  value={form.placeId}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter Google Place ID"
                />

                <InputField
                  label="Google Review URL"
                  name="googleUrl"
                  value={form.googleUrl}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="https://g.page/r/..."
                />
              </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Change your account password.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={!editing}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`w-full rounded-xl border px-4 py-3 pr-16 text-sm outline-none ${
                      editing
                        ? "border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        : "cursor-not-allowed border-gray-100 bg-gray-50"
                    }`}
                  />

                  <button
                    type="button"
                    disabled={!editing}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 disabled:opacity-40"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Leave blank if you do not want to change your password.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-base font-bold">Account Overview</h3>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-gray-400">Account ID</p>
                  <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                    {client._id || "N/A"}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">Account Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-emerald-600">
                    {client.status || "Active"}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">Registered Email</p>
                  <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                    {client.email || "N/A"}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">Business Name</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {client.businessName || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-indigo-600">
                ?
              </div>

              <h3 className="font-bold text-gray-900">Need Help?</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                If you need assistance with your business profile or account
                settings, contact our support team.
              </p>
            </section>
          </div>
        </div>

        {/* Bottom Save Buttons */}
        {editing && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Discard Changes
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Account Settings · Business Profile Management
        </p>
      </div>
    </main>
  );
};

export default Page;