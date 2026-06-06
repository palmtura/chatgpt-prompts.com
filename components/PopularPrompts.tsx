"use client";

import { useState } from "react";
import { PROMPTS } from "@/lib/data";
import { Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PopularPrompts() {
  const filteredPrompts = PROMPTS.slice(0, 50);

  return (
    <section className="pt-4 pb-4 px-6 md:px-12 w-full max-w-[1200px] mx-auto" id="popular">
      <div className="mb-6">
        <span className="font-sans font-medium text-[12px] tracking-[0.08em] text-text-muted uppercase mb-1.5 block">
          MOST POPULAR
        </span>
        <h2 className="font-sora text-3xl md:text-4xl text-white mb-2 tracking-tight">
          50 ChatGPT Prompts Professionals Use Every Day
        </h2>
        <p className="font-sans text-text-primary max-w-2xl text-sm md:text-base">
          Hand-picked from 11 categories. Click any prompt to copy it instantly — no account needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}

function PromptCard({ prompt }: { prompt: typeof PROMPTS[number] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-surface border border-border rounded-2xl pt-4 px-6 pb-12 transition-all duration-300 overflow-hidden cursor-pointer",
        copied ? "border-success bg-success/5" : "hover:border-white"
      )}
      onClick={handleCopy}
    >
      {/* Green flash overlay on click */}
      <div className={cn(
        "absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none",
        copied ? "bg-success/20 opacity-100" : "opacity-0"
      )} />
      
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 shadow-[0_0_16px_rgba(255,255,255,0.05)] pointer-events-none transition-all duration-300" />
      
      <div className="flex flex-col relative z-10 h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center font-sans font-medium text-[9px] tracking-widest text-accent border border-accent/20 bg-accent/5 px-2 py-[2px] rounded uppercase">
            {prompt.industry || "Universal"}
          </span>
          <span className="inline-flex items-center justify-center font-sans font-medium text-[9px] tracking-widest text-text-muted border border-border bg-surface-alt px-2 py-[2px] rounded uppercase">
            {prompt.category}
          </span>
        </div>
        <h3 className="font-sora font-bold text-base text-white mb-2 line-clamp-2">
          {/* @ts-ignore -- title added via script but might not be in type signature yet */}
          {prompt.title}
        </h3>
        <p className="font-sans text-[12px] text-text-primary leading-relaxed">
          {prompt.text.split(/\s+/).slice(0, 9).join(' ')}{prompt.text.split(/\s+/).length > 9 ? '...' : ''}
        </p>
      </div>

      {/* Pop up bottom bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center z-20 pointer-events-none transition-transform duration-300",
        copied ? "translate-y-0 bg-success text-black shadow-[0_-10px_30px_rgba(74,222,128,0.2)]" : "translate-y-full group-hover:translate-y-0 bg-white text-black shadow-[0_-10px_30px_rgba(255,255,255,0.1)]"
      )}>
        <div className="flex items-center gap-2 font-sans text-[11px] tracking-widest font-bold">
          <span>{copied ? "COPIED!" : "CLICK BOX TO COPY"}</span>
          {copied ? <CheckCircle size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2.5} />}
        </div>
      </div>
    </div>
  );
}
