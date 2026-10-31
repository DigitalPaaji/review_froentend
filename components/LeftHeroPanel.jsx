'use client';
import React, { useState, useEffect } from "react";
import { reviewSlides } from "./data/reviewSlides";

export default function LeftHeroPanel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviewSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentReview = reviewSlides[activeSlide];

  return (
    <div className="flex  h-screen relative bg-[#060911] p-10 flex-col justify-between overflow-hidden border-r border-indigo-500/20">
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('/admin.webp')` }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#060911]/60 via-[#090D16]/45 to-[#060911]/25 pointer-events-none"></div>

      <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center">
        <div className="flex items-center">
          <img src="/logo.webp" className="w-full h-20 object-cover" alt="Digital Paaji Logo" />
        </div>
      
        <h2 className="text-3xl xl:text-4xl font-light text-slate-100 mt-6">
          What <span className="font-serif italic font-normal text-indigo-400 underline decoration-indigo-500/50 underline-offset-8">clients</span>
        </h2>
        <p className="text-xs uppercase tracking-widest text-slate-300 font-semibold mb-8">say across all businesses</p>
        <div className="inline-block mb-6 px-3.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
          UNIVERSAL BUSINESS REVIEW PORTAL
        </div>
        
        <div className="relative w-full max-w-md mx-auto transition-all duration-700">
          <div className="absolute inset-x-4 -bottom-5 h-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm transform scale-95 z-0"></div>
          
          <div className="relative z-20 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl text-left transition-all duration-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {currentReview.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{currentReview.name}</h4>
                  <p className="text-[11px] text-indigo-300">{currentReview.role} • <span className="text-slate-300">{currentReview.business}</span></p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic min-h-[40px]">
              {currentReview.comment}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
              <span>Industry: <strong className="text-indigo-300">{currentReview.industry}</strong></span>
              <span className="bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/30">Verified Review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-[11px] text-slate-300 flex justify-between items-center border-t border-slate-800/80 pt-4">
        <span>&copy; 2026 Digital Paaji. All rights reserved.</span>
        <span className="text-indigo-300 font-medium">Review Panel</span>
      </div>
    </div>
  );
}