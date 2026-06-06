"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

export default function Popup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("popup_shown");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem("popup_shown", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75"
            onClick={() => setIsVisible(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[600px] bg-surface rounded-2xl border border-border flex flex-col md:flex-row overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="p-8 md:w-3/5 flex flex-col justify-center">
              <span className="font-sans font-medium text-[12px] tracking-[0.08em] text-text-muted uppercase mb-3 block">
                POWER UP YOUR PRESENTATIONS
              </span>
              <h2 className="font-sora text-xl text-white mb-3">
                Try ExpertSlides — AI Presentations & Designs. Free.
              </h2>
              <p className="font-sans text-sm text-text-muted mb-6 leading-relaxed">
                Create stunning presentations in minutes with AI. Professional templates,
                smart layouts, and instant exports — built for people who use ChatGPT
                Prompts to get more done.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="#"
                  className="bg-cta hover:bg-neutral-200 text-black font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-full text-center transition-colors"
                >
                  Try ExpertSlides for Free &rarr;
                </a>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-text-muted hover:text-white text-xs text-center transition-colors font-sans"
                >
                  No thanks, I'll stick with plain slides
                </button>
              </div>
            </div>

            {/* Visual element placeholder for real image */}
            <div className="md:w-2/5 bg-surface-alt border-l border-border flex items-center justify-center p-4">
               {/* Stand-in for actual Image to prevent next/image errors without a valid remote URL */}
               <div className="w-full aspect-[4/3] rounded border border-border bg-background flex items-center justify-center text-xs text-text-muted">
                 App UI Preview
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
