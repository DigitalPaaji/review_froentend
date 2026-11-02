
"use client";

import React, { useEffect, useState } from "react";
import { base_url } from "@/components/utils";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

axios.defaults.withCredentials = true;

/* =========================
   HELPERS
========================= */

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
};

const formatTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
};

const formatDateTime = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
};

const getQrDetails = (qrUrl) => {
  if (!qrUrl) return {};

  try {
    const url = new URL(qrUrl);

    return {
      location: url.searchParams.get("location") || "",
      industry: url.searchParams.get("industry") || "",
      services: url.searchParams.get("services") || "",
      description: url.searchParams.get("desc") || "",
    };
  } catch {
    return {};
  }
};

/* =========================
   REUSABLE COMPONENTS
========================= */

const StatCard = ({ title, value, icon, detail, accent }) => {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>

        <p className="mt-2 text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  );
};

const SectionTitle = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    {action}
  </div>
);

const Stars = ({ rating = 0 }) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= safeRating
              ? "text-amber-400"
              : "text-slate-200"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */

const Page = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${base_url}/client/auth/dashboard`
      );

      if (response.data.success) {
        setDashboard(response.data);
      } else {
        setError(
          response.data.message || "Unable to load dashboard"
        );
      }
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong while loading dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* LOADING */

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={fetchData}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const client = dashboard?.client || {};
  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};

  const todayReviews = dashboard?.todayReviews || [];
  const recentReviews = dashboard?.recentReviews || [];

  const qrDetails = getQrDetails(client.savedQrUrl);

  /* =========================
     LINE CHART
  ========================= */

  const lineData = {
    labels: charts.last7Days?.map((item) => item.label) || [],

    datasets: [
      {
        label: "Reviews",
        data: charts.last7Days?.map((item) => item.reviews) || [],

        borderColor: "#6366F1",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return "rgba(99,102,241,0.1)";

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );

          gradient.addColorStop(0, "rgba(99,102,241,0.25)");
          gradient.addColorStop(1, "rgba(99,102,241,0.01)");

          return gradient;
        },

        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "index",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0F172A",
        titleColor: "#FFFFFF",
        bodyColor: "#CBD5E1",
        padding: 12,
        displayColors: false,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: 11,
          },
        },
      },

      y: {
        beginAtZero: true,
        border: {
          display: false,
          dash: [4, 4],
        },
        grid: {
          color: "#F1F5F9",
        },
        ticks: {
          precision: 0,
          color: "#94A3B8",
          padding: 10,
        },
      },
    },
  };

  /* =========================
     DOUGHNUT CHART
  ========================= */

  const ratingCounts =
    charts.ratingDistribution?.map((item) => item.count) ||
    [0, 0, 0, 0, 0];

  const doughnutData = {
    labels: [
      "1 Star",
      "2 Stars",
      "3 Stars",
      "4 Stars",
      "5 Stars",
    ],

    datasets: [
      {
        data: ratingCounts,

        backgroundColor: [
          "#EF4444",
          "#F97316",
          "#F59E0B",
          "#84CC16",
          "#10B981",
        ],

        borderWidth: 0,
        hoverOffset: 7,
        spacing: 3,
        borderRadius: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "76%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
      },
    },
  };

  return (
    <main className="h-screen overflow-auto bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-indigo-600">
              Business Overview
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">
                {client.name || "Client"}
              </span>
              . Here's what's happening with your business.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-2 text-xs font-bold ${
                client.active
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              ● {client.active ? "Account Active" : "Account Inactive"}
            </span>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="text-lg">↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* ================= BUSINESS CARD ================= */}

        <div className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-[#171B3A] via-[#252B5A] to-[#4338A8] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-36 right-52 h-72 w-72 rounded-full border-[35px] border-white/5" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[2px] text-indigo-200">
                Your Business
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {client.businessName || "Business"}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-indigo-100">
                {qrDetails.location && (
                  <span>📍 {qrDetails.location}</span>
                )}

                {qrDetails.industry && (
                  <span>• {qrDetails.industry}</span>
                )}
              </div>

              <p className="mt-5 text-xs text-indigo-200">
                QR Code:{" "}
                <span className="font-semibold text-white">
                  {client.hasGeneratedQr ? "Generated" : "Not generated"}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md md:min-w-[230px]">
              <p className="text-xs font-medium text-indigo-100">
                QR Code Expiry
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {formatDate(client.expiryDate)}
              </h3>

              <p className="mt-2 text-xs text-indigo-200">
                Your QR code validity
              </p>
            </div>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Reviews"
            value={stats.totalReviews ?? 0}
            icon="💬"
            detail="All customer reviews"
            accent="bg-indigo-50"
          />

          <StatCard
            title="Today's Reviews"
            value={stats.todayReviews ?? 0}
            icon="📅"
            detail="Reviews received today"
            accent="bg-sky-50"
          />

          <StatCard
            title="Average Rating"
            value={`${stats.averageRating ?? 0} / 5`}
            icon="⭐"
            detail="Overall customer satisfaction"
            accent="bg-amber-50"
          />

          <StatCard
            title="5 Star Reviews"
            value={stats.fiveStarReviews ?? 0}
            icon="🏆"
            detail="Excellent customer feedback"
            accent="bg-emerald-50"
          />

          <StatCard
            title="This Month"
            value={stats.thisMonthReviews ?? 0}
            icon="📈"
            detail="Reviews this month"
            accent="bg-violet-50"
          />

          <StatCard
            title="Last 30 Days"
            value={stats.last30DaysReviews ?? 0}
            icon="📊"
            detail="Recent review activity"
            accent="bg-cyan-50"
          />

          {/* <StatCard
            title="4 Star Reviews"
            value={stats.fourStarReviews ?? 0}
            icon="👍"
            detail="Positive customer feedback"
            accent="bg-lime-50"
          />

          <StatCard
            title="Total Ratings"
            value={stats.totalReviews ?? 0}
            icon="🌟"
            detail="Customer rating submissions"
            accent="bg-orange-50"
          /> */}
        </div>

        {/* ================= CHARTS ================= */}

        <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* LINE CHART */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <SectionTitle
              title="Review Analytics"
              subtitle="Your daily review performance over the last 7 days."
              action={
                <span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">
                  Last 7 Days
                </span>
              }
            />

            <div className="h-[280px] w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </section>

          {/* DOUGHNUT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle
              title="Rating Distribution"
              subtitle="Customer rating breakdown."
            />

            <div className="relative mx-auto h-[210px] max-w-[250px]">
              <Doughnut
                data={doughnutData}
                options={doughnutOptions}
              />

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-slate-900">
                  {stats.averageRating ?? 0}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Average Rating
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {charts.ratingDistribution?.map((item) => {
                const total = stats.totalReviews || 0;
                const percentage = total
                  ? (item.count / total) * 100
                  : 0;

                const colors = {
                  1: "bg-red-500",
                  2: "bg-orange-500",
                  3: "bg-amber-500",
                  4: "bg-lime-500",
                  5: "bg-emerald-500",
                };

                return (
                  <div
                    key={item.rating}
                    className="flex items-center gap-3"
                  >
                    <span className="w-10 text-xs font-semibold text-slate-600">
                      {item.rating} ★
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${colors[item.rating]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="w-7 text-right text-xs font-semibold text-slate-500">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ================= TODAY REVIEWS ================= */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Today's Reviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customer feedback received today.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">
              {todayReviews.length} Reviews
            </span>
          </div>

          {todayReviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {todayReviews.map((review, index) => (
                <div
                  key={`${review.time}-${index}`}
                  className="flex gap-4 px-5 py-5 sm:px-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-lg">
                    ⭐
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars rating={review.rating} />

                      <span className="text-xs font-bold text-slate-600">
                        {review.rating}/5
                      </span>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        TODAY
                      </span>
                    </div>

                    <p className="mt-3 break-words text-sm leading-7 text-slate-600">
                      {review.text || "No review text available."}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      {formatTime(review.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <div className="text-4xl">💬</div>

              <h3 className="mt-3 font-semibold text-slate-700">
                No reviews today
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your new customer reviews will appear here.
              </p>
            </div>
          )}
        </section>

        {/* ================= RECENT REVIEWS ================= */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Reviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest feedback from your customers.
            </p>
          </div>

          {recentReviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentReviews.map((review, index) => (
                <div
                  key={`${review.time}-${index}`}
                  className="flex flex-col justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars rating={review.rating} />

                      <span className="text-xs font-semibold text-slate-500">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {review.text || "No review text available."}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-slate-400">
                    {formatDateTime(review.time)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              No reviews available yet.
            </div>
          )}
        </section>

        {/* FOOTER */}

        <div className="mt-8 border-t border-slate-200 py-5 text-center">
          <p className="text-xs text-slate-400">
            Business Review Dashboard · All times in IST
          </p>
        </div>
      </div>
    </main>
  );
};

export default Page;
