"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { base_url } from "@/components/utils";
import { ImCancelCircle } from "react-icons/im";

/* =========================================
   TESTIMONIAL DATA
========================================= */

const reviewSlides = [
  {
    business: "Club 16 Lounge & Bar",
    industry: "Hospitality & Nightlife",
    name: "Rohan Verma",
    role: "Regular Patron",
    avatar: "RV",
    comment:
      "The review portal makes sharing feedback simple and convenient. The QR-based process is quick and easy to use.",
  },
  {
    business: "Elite Salon & Spa",
    industry: "Beauty & Wellness",
    name: "Priya Sharma",
    role: "Client Experience",
    avatar: "PS",
    comment:
      "A clean and convenient way for customers to access a business's review page and share their feedback.",
  },
  {
    business: "Patiala Gourmet Sweets",
    industry: "Food & Bakery",
    name: "Harpreet Singh",
    role: "Customer Experience",
    avatar: "HS",
    comment:
      "The review portal offers a straightforward experience with a professional design and an easy-to-follow process.",
  },
];

const TYPING_MESSAGES = [
  "Understanding your business...",
  "Writing natural review ideas...",
  "Creating personalized suggestions...",
  "Polishing your review drafts...",
  "Almost ready...",
];

/* =========================================
   HELPERS
========================================= */

const parseExpiryDate = (value) => {
  if (!value || !String(value).trim()) return null;

  const trimmed = String(value).trim();
  let date;

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) return null;
    // seconds -> milliseconds
    date = new Date(numeric < 100000000000 ? numeric * 1000 : numeric);
  } else {
    date = new Date(trimmed);
  }

  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Copies text to clipboard.
 * IMPORTANT: must be called synchronously inside a user gesture (click/submit)
 * so that iOS Safari allows it. Never call it after an `await`.
 */
const copyToClipboard = (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
      return true;
    }
  } catch (e) {
    /* fall through to legacy */
  }
  return legacyCopy(text);
};

const legacyCopy = (text) => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.style.fontSize = "16px"; // prevents iOS zoom
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length); // iOS needs this

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch (e) {
    return false;
  }
};

/* =========================================
   TYPING LOADER
========================================= */

function TypingLoader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let characterIndex = 0;
    let pauseTimeout;
    const currentMessage = TYPING_MESSAGES[messageIndex];

    setDisplayText("");

    const interval = window.setInterval(() => {
      characterIndex++;
      setDisplayText(currentMessage.slice(0, characterIndex));

      if (characterIndex >= currentMessage.length) {
        window.clearInterval(interval);
        pauseTimeout = window.setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % TYPING_MESSAGES.length);
        }, 1300);
      }
    }, 45);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(pauseTimeout);
    };
  }, [messageIndex]);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-3xl bg-indigo-100 opacity-40" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl text-white shadow-xl shadow-indigo-200">
          ✍
        </div>
      </div>

      <h3 className="mt-6 text-base font-bold text-slate-800">
        We are writing your reviews
      </h3>

      <div className="mt-3 flex min-h-6 items-center justify-center">
        <p className="text-sm font-medium text-indigo-600">
          {displayText}
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-indigo-600 align-middle" />
        </p>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Please wait while we prepare your suggestions.
      </p>

      <div className="mt-6 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" />
      </div>

      <div className="mt-7 h-1.5 w-40 overflow-hidden rounded-full bg-indigo-50">
        <div className="h-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================
   MAIN REVIEW CONTENT
========================================= */

function ReviewContent() {
  const searchParams = useSearchParams();

  // Business details from URL
  const businessName = searchParams.get("business") || "Local Business";
  const location = searchParams.get("location") || "";
  const description = searchParams.get("desc") || "";
  const placeId = searchParams.get("placeid") || "";
  const services = searchParams.get("services") || "";
  const industry = searchParams.get("industry") || "";
  const uid = searchParams.get("uid") || "";
  const expiryTimestamp = searchParams.get("expires");

  const googleReviewUrl = placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        placeId
      )}`
    : "";

  // Review state
  const [stars, setStars] = useState(0);
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // User / modal state
  const [userId, setUserId] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // "form" | "done"
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phonenumber: "",
  });

  // UI state
  const [toastMessage, setToastMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [expiryStatus, setExpiryStatus] = useState("checking");
  const [expiryDate, setExpiryDate] = useState(null);

  const toastTimer = useRef(null);
  const requestIdRef = useRef(0);

  const isExpired = expiryStatus === "expired";
  const currentSlide = reviewSlides[activeSlide];

  const canContinue =
    !loading && !!selectedReview && !apiError && !!googleReviewUrl;

  /* ---------- Toast ---------- */

  const showToast = useCallback((message, duration = 3000) => {
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  /* ---------- Current user ---------- */

  const getUser = useCallback(async () => {
    try {
      const response = await axios.get(`${base_url}/user/get`, {
        withCredentials: true,
      });
      const data = response.data;
      setUserId(data?.success ? data.user?._id || null : null);
    } catch (error) {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  /* ---------- Testimonial slider ---------- */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviewSlides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  /* ---------- Expiry check ---------- */

  useEffect(() => {
    const expiry = parseExpiryDate(expiryTimestamp);

    if (!expiry) {
      setExpiryDate(null);
      setExpiryStatus("expired");
      return;
    }

    setExpiryDate(expiry);

    let timer;

    const checkExpiry = () => {
      const remaining = expiry.getTime() - Date.now();

      if (remaining <= 0) {
        setExpiryStatus("expired");
        return;
      }

      setExpiryStatus("valid");
      // setTimeout max is ~24.8 days
      timer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    };

    checkExpiry();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [expiryTimestamp]);

  /* ---------- Lock page scroll while modal is open ---------- */

  useEffect(() => {
    if (!showUserModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showUserModal]);

  /* ---------- Generate AI reviews ---------- */

  const fetchAiReviews = useCallback(
    async (selectedStars) => {
      if (expiryStatus !== "valid" || !selectedStars) return;

      const requestId = ++requestIdRef.current;

      setLoading(true);
      setApiError("");
      setReviewsList([]);
      setSelectedReview("");

      try {
        const response = await axios.post(
          `${base_url}/review/generate`,
          {
            businessName,
            location,
            description,
            services,
            industry,
            stars: selectedStars,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 60000,
          }
        );

        // Ignore stale responses (user changed stars / pressed regenerate)
        if (requestId !== requestIdRef.current) return;

        const data = response.data;

        if (!data?.success) {
          throw new Error(data?.message || "Unable to generate reviews.");
        }

        if (!Array.isArray(data.reviews) || data.reviews.length === 0) {
          throw new Error("The AI did not return any review suggestions.");
        }

        const validReviews = data.reviews.filter(
          (r) => typeof r === "string" && r.trim().length > 0
        );

        if (validReviews.length === 0) {
          throw new Error("No valid review suggestions were returned.");
        }

        setReviewsList(validReviews);
        setSelectedReview(validReviews[0]);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        console.error("Review generation error:", error);

        setApiError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong. Please try again."
        );
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [expiryStatus, businessName, location, description, services, industry]
  );

  useEffect(() => {
    if (expiryStatus === "valid" && stars) {
      fetchAiReviews(stars);
    }
  }, [stars, expiryStatus, fetchAiReviews]);

  /* ---------- Save review to backend (fire-and-forget) ---------- */

  const saveReview = useCallback(
    (rating, text, currentUserId) => {
      axios
        .post(`${base_url}/review/add/${uid}`, {
          rating,
          text,
          userId: currentUserId,
        })
        .catch((error) => console.error("Save review error:", error));
    },
    [uid]
  );

  /* =====================================================
     "Copy & Continue to Google"

     iOS Safari blocks window.open() when it is called after
     an `await`. So instead the button is a real <a target="_blank">.
     Inside the click we only do SYNCHRONOUS work (copy), and let the
     browser follow the link natively.
  ===================================================== */

  const handleContinueClick = (event) => {
    if (!canContinue || expiryStatus !== "valid") {
      event.preventDefault();
      return;
    }

    // Not logged in -> collect details first (don't open Google yet)
    if (!userId) {
      event.preventDefault();
      setModalStep("form");
      setShowUserModal(true);
      return;
    }

    const copied = copyToClipboard(selectedReview);
    showToast(
      copied
        ? "Review copied! Paste it into Google."
        : "Please copy your review manually."
    );

    // Not awaited on purpose, so the link opens immediately
    saveReview(stars, selectedReview, userId);
    // Default <a> behaviour then opens Google in a new tab.
  };

  /* ---------- Modal: submit user details ---------- */

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    // Copy now, while we are still inside the user gesture
    copyToClipboard(selectedReview);

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${base_url}/user/create`,
        {
          ...userData,
          text: selectedReview,
          clientId: uid,
          rating: stars,
        },
        { withCredentials: true }
      );

      const data = response.data;

      if (data?.success) {
        // Mark as identified; if API returns the user, store the id
        setUserId(data.user?._id || data.userId || "created");
        setModalStep("done");
        // Refresh from server to get the real id (cookie is now set)
        getUser();
      } else {
        showToast(data?.message || "Could not save your details.");
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Could not save your details. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Final step in modal: real link, so iOS opens it
  const handleModalOpenClick = () => {
    const copied = copyToClipboard(selectedReview);
    showToast(
      copied
        ? "Review copied! Paste it into Google."
        : "Please copy your review manually."
    );
    setShowUserModal(false);
  };

  /* ---------- Checking screen ---------- */

  if (expiryStatus === "checking") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#090D16] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
          <p className="mt-4 text-sm font-medium text-slate-300">
            Verifying your QR code...
          </p>
        </div>
      </main>
    );
  }

  /* ---------- Render ---------- */

  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#090D16] font-sans text-slate-100 selection:bg-indigo-500 selection:text-white lg:h-dvh lg:flex-row lg:overflow-hidden">
      {/* =====================================
          USER DETAILS MODAL
      ===================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowUserModal(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-500 transition hover:text-slate-800"
            >
              <ImCancelCircle className="h-5 w-5" />
            </button>

            {modalStep === "form" ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Enter Your Details
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Please provide your information to continue.
                  </p>
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="rv-name"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rv-name"
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rv-email"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rv-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter your email address"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rv-phone"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rv-phone"
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      minLength={10}
                      value={userData.phonenumber}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          phonenumber: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      placeholder="Enter 10-digit phone number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 font-bold text-white shadow-md shadow-indigo-100 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      "Continue →"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                  ✓
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-800">
                  Details saved
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your review is copied. Tap the button below, then paste it
                  into Google.
                </p>

                {/* Real link: works on iOS, no popup blocking */}
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleModalOpenClick}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 font-bold text-white shadow-md shadow-indigo-100 transition active:scale-[0.98]"
                >
                  Open Google Review
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================
          LEFT PANEL
      ===================================== */}
      <aside className="relative flex h-[18dvh] min-h-[110px] shrink-0 flex-col justify-center overflow-hidden border-b border-indigo-500/20 bg-[#060911] p-3 sm:p-4 lg:h-dvh lg:w-1/2 lg:min-h-0 lg:justify-between lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/admin.webp')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#060911]/80 via-[#090D16]/70 to-[#060911]/60" />

        {/* Logo */}
        <div className="relative z-10 flex items-center justify-center lg:justify-start">
          <img
            src="/logo.webp"
            alt="Digital Paaji"
            className="h-10 max-w-[180px] object-contain sm:h-12 lg:h-16 lg:max-w-[230px]"
          />
        </div>

        {/* Desktop content */}
        <div className="relative z-10 hidden w-full max-w-xl self-center lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Smart review portal
          </div>

          <h1 className="text-4xl font-light leading-tight text-white xl:text-5xl">
            Your experience.
            <br />
            <span className="font-serif italic text-indigo-400">
              Your voice.
            </span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Choose a rating, explore review drafts, and share feedback that
            reflects your actual experience.
          </p>

          {/* Testimonial card */}
          <div className="mt-9 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl xl:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white">
                  {currentSlide.avatar}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentSlide.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {currentSlide.role}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-sm">
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              “{currentSlide.comment}”
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Business category
                </p>
                <p className="mt-1 truncate text-xs font-medium text-indigo-300">
                  {currentSlide.industry}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[10px] text-indigo-200">
                Review portal
              </span>
            </div>
          </div>

          {/* Slider indicators */}
          <div className="mt-5 flex items-center gap-2">
            {reviewSlides.map((slide, index) => (
              <button
                key={slide.business}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={activeSlide === index}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-8 bg-indigo-400"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-1 text-center text-[10px] tracking-wider text-slate-300 lg:hidden">
          SMART BUSINESS REVIEW PORTAL
        </p>

        <footer className="relative z-10 hidden items-center justify-between border-t border-white/10 pt-4 text-[10px] text-slate-500 lg:flex">
          <span>© 2026 Digital Paaji</span>
          <span className="text-indigo-300">Review Portal</span>
        </footer>
      </aside>

      {/* =====================================
          RIGHT PANEL
          Mobile  : normal page scroll, sticky bottom button
          Desktop : fixed height, only the review list scrolls
      ===================================== */}
      <section className="flex min-w-0 flex-1 flex-col bg-white text-slate-900 lg:h-dvh lg:w-1/2 lg:flex-none lg:overflow-hidden">
        {isExpired ? (
          /* ---------- EXPIRED ---------- */
          <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
                ⏳
              </div>

              <h2 className="mt-5 text-xl font-bold text-red-800 sm:text-2xl">
                QR Code Expired
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-700">
                This review QR code is no longer active. Please contact the
                business owner or Digital Paaji team to get a new QR code.
              </p>

              {expiryDate && (
                <div className="mt-5 rounded-xl border border-red-200 bg-white/70 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                    Expired on
                  </p>
                  <p className="mt-1 text-sm font-semibold text-red-700">
                    {expiryDate.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}

              <p className="mt-5 text-xs text-red-500">
                Digital Paaji · Review Portal
              </p>
            </div>
          </div>
        ) : (
          /* ---------- ACTIVE ---------- */
          <>
            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-lg shadow-sm">
                ✨
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                  {businessName}
                </h2>

                {location && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    📍 {location}
                  </p>
                )}

                <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                  Select your rating and choose a review draft
                </p>
              </div>

              <span className="hidden shrink-0 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-indigo-600 sm:inline-flex">
                ✦ AI Reviews
              </span>
            </header>

            {/* Rating */}
            <div className="shrink-0 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-5">
              <div
                className={`flex items-center justify-between gap-3 rounded-xl border transition-all duration-300 ${
                  stars
                    ? "border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4"
                    : "flex-col border-amber-200 bg-amber-50 px-4 py-6 sm:px-6 sm:py-8"
                }`}
              >
                <div className={stars ? "" : "text-center"}>
                  <p
                    className={`font-bold text-slate-800 transition-all duration-300 ${
                      stars ? "text-xs" : "text-2xl sm:text-3xl"
                    }`}
                  >
                    {stars ? "Your rating" : "Rate your experience"}
                  </p>

                  <p
                    className={`mt-1 text-slate-500 transition-all duration-300 ${
                      stars ? "text-[10px]" : "text-sm sm:text-base"
                    }`}
                  >
                    {stars
                      ? "Choose 1-5 stars"
                      : "Tap a star below to get started"}
                  </p>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-1 transition-all duration-300 ${
                    stars ? "" : "mt-3"
                  }`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      aria-pressed={stars === star}
                      className={`rounded-lg leading-none transition-all duration-200 active:scale-90 ${
                        stars
                          ? "p-0.5 text-[28px]"
                          : "p-1 text-5xl hover:scale-110 sm:text-6xl"
                      } ${
                        star <= stars
                          ? "text-amber-400"
                          : "text-slate-300 hover:text-amber-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}

                  {stars > 0 && (
                    <span className="ml-1 text-[10px] font-bold tabular-nums text-slate-500">
                      {stars}/5
                    </span>
                  )}
                </div>
              </div>
            </div>

            {stars > 0 && (
              <>
                {/* Suggestions header */}
                <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                      Review suggestions
                      {reviewsList.length > 0 && (
                        <span className="ml-2 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                          {reviewsList.length}
                        </span>
                      )}
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Choose a draft that matches your actual experience
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchAiReviews(stars)}
                    disabled={loading}
                    className="shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border border-indigo-300 border-t-indigo-700" />
                        Generating...
                      </span>
                    ) : (
                      "↻ Regenerate"
                    )}
                  </button>
                </div>

                {/* Scrollable list:
                    - mobile: grows naturally, page scrolls
                    - desktop: takes remaining height and scrolls inside */}
                <div
                  className="px-4 pb-4 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:px-8"
                  style={{ WebkitOverflowScrolling: "touch" }}
                  aria-live="polite"
                >
                  {loading ? (
                    <TypingLoader />
                  ) : apiError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                        !
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-slate-800">
                        Could not generate reviews
                      </h3>

                      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                        {apiError}
                      </p>

                      <button
                        type="button"
                        onClick={() => fetchAiReviews(stars)}
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Try again
                      </button>
                    </div>
                  ) : reviewsList.length > 0 ? (
                    <div className="space-y-2.5">
                      {reviewsList.map((review, index) => {
                        const selected = selectedReview === review;

                        return (
                          <button
                            key={`${index}-${review.slice(0, 20)}`}
                            type="button"
                            onClick={() => setSelectedReview(review)}
                            aria-pressed={selected}
                            className={`block w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                              selected
                                ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-200"
                                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                Option {index + 1}
                              </span>

                              {selected ? (
                                <span className="rounded-full bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white">
                                  ✓ Selected
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  Select draft
                                </span>
                              )}
                            </div>

                            <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 sm:text-[13px] sm:leading-6">
                              {review}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <span className="text-3xl">✍️</span>

                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        Ready to write your review?
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Generate suggestions to get started.
                      </p>

                      <button
                        type="button"
                        onClick={() => fetchAiReviews(stars)}
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        Generate reviews
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer: sticky on mobile so the button is always reachable */}
                <footer className="sticky bottom-0 z-10 mt-auto shrink-0 border-t border-slate-100 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:static lg:px-8 lg:pb-5">
                  {/* Real anchor => iOS never blocks it */}
                  <a
                    href={canContinue ? googleReviewUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleContinueClick}
                    aria-disabled={!canContinue}
                    role="link"
                    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] sm:py-3.5 sm:text-sm ${
                      canContinue
                        ? ""
                        : "pointer-events-none cursor-not-allowed opacity-50"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                    </svg>
                    Copy &amp; Continue to Google
                    <span aria-hidden="true">→</span>
                  </a>

                  {!googleReviewUrl && (
                    <p className="mt-2 text-center text-[10px] text-red-500">
                      Google Place ID is missing for this business.
                    </p>
                  )}

                  <p className="mt-2 text-center text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                    Review the draft and make sure it reflects your genuine
                    experience.
                  </p>
                </footer>
              </>
            )}
          </>
        )}
      </section>

      {/* =====================================
          TOAST
      ===================================== */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-center text-xs font-medium text-white shadow-2xl lg:bottom-5"
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}

/* =========================================
   PAGE WITH SUSPENSE
========================================= */

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#090D16] text-sm text-indigo-300">
          Loading review portal...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}