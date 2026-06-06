"use client";

import { useState } from "react";
import { FAQS } from "@/lib/data";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 md:py-24 px-6 md:px-12 w-full max-w-[1200px] mx-auto">
      <div className="mb-12 text-center">
        <span className="font-sans font-medium text-[12px] tracking-[0.08em] text-text-muted uppercase mb-3 block">
          FAQ
        </span>
        <h2 className="font-sora text-3xl md:text-4xl text-white mb-4 tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="bg-surface border border-border rounded-xl overflow-hidden transition-colors hover:border-surface-alt"
            >
              <button
                className="w-full text-left p-6 flex justify-between items-center bg-transparent gap-4"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <span className="font-sora text-lg text-white">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={cn("text-text-muted transition-transform duration-200 shrink-0", isOpen && "rotate-180")} 
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-6"
                  >
                    <p className="font-sans text-base text-text-primary leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
