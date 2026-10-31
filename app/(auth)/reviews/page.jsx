
"use client";

import { base_url } from "@/components/utils";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const Page = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${base_url}/review/getreviews`,
        { withCredentials: true }
      );

      const data = response.data;

      if (data.success && Array.isArray(data.reviews)) {
        setAllReviews(data.reviews);
      } else {
        setAllReviews([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load reviews. Please try again.");
      setAllReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  const averageRating = allReviews.length
    ? (
        allReviews.reduce((total, review) => total + review.rating, 0) /
        allReviews.length
      ).toFixed(1)
    : "0.0";

  const ratingCount = (rating) =>
    allReviews.filter((review) => review.rating === rating).length;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${
            star <= rating ? "text-amber-400" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <main className="h-screen overflow-auto bg-[#F8FAFC] px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-indigo-600">
              Customer Feedback
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Reviews & Ratings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and monitor your customer feedback.
            </p>
          </div>

          <button
            onClick={getReviews}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="text-lg">↻</span>
            Refresh Reviews
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Reviews
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                ★
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                {allReviews.length}
              </h2>
              <span className="text-xs font-medium text-gray-400">
                All time
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Average Rating
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-500">
                ★
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                {averageRating}
                <span className="ml-1 text-lg text-amber-400">★</span>
              </h2>
              <span className="text-xs font-medium text-gray-400">
                Out of 5
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                5 Star Reviews
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <span>✓</span>
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                {ratingCount(5)}
              </h2>
              <span className="text-xs font-medium text-emerald-600">
                Excellent
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {allReviews.length} reviews received
              </p>
            </div>

            <span className="w-fit rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              All Reviews
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-sm text-red-500">{error}</p>
              <button
                onClick={getReviews}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : allReviews.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl text-gray-400">
                ★
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                No Reviews Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your customer reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">

              {allReviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition duration-300 hover:border-indigo-200 hover:shadow-md"
                >
                  {/* Customer */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600">
                        C
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Customer
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Customer Feedback
                        </p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Review
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-3 flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-bold text-gray-600">
                      {review.rating}.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm leading-7 text-gray-600">
                    "{review.text}"
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-400">
                      {formatDate(review.time)}
                    </span>

                    <span className="text-xs font-medium text-indigo-600">
                      Customer Review
                    </span>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Review Management Dashboard · Customer Experience
        </p>

      </div>
    </main>
  );
};

export default Page;
