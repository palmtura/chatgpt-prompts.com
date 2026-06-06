"use client";
import React, { useEffect, useRef, useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptRecord } from "@/hooks/useSearch";

export function SearchResults({ results, isSearching }: { results: PromptRecord[], isSearching: boolean }) {
  const [displayedCount, setDisplayedCount] = useState(48);
  const observerRef = useRef<HTMLDivElement>(null);

  // Reset pagination when search results change
  useEffect(() => {
    setDisplayedCount(48);
  }, [results]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayedCount < results.length) {
        setDisplayedCount((prev) => prev + 48);
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, results.length]);

  const displayedResults = results.slice(0, displayedCount);

  if (isSearching) {
    return (
      <div className="py-32 w-full flex flex-col items-center justify-center gap-6">
        <span className="font-sora text-3xl font-medium text-white tracking-tight animate-pulse">
          Loading Prompts
        </span>
        <div className="w-64 h-[2px] bg-white/10 relative overflow-hidden rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[slideRight_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center w-full max-w-[1200px] mx-auto px-6 md:px-12">
        <h3 className="text-xl text-white font-sora mb-2">No results found</h3>
        <p className="text-text-muted font-sans text-sm">Try adjusting your search terms.</p>
      </div>
    );
  }

  return (
    <section className="pt-2 pb-14 md:pb-24 px-6 md:px-12 w-full max-w-[1200px] mx-auto">
      <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-3 w-full">
        <span className="font-sans text-[13px] text-text-muted">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedResults.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
      
      {displayedCount < results.length && (
        <div ref={observerRef} className="h-20 w-full mt-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </section>
  );
}

function PromptCard({ prompt }: { prompt: PromptRecord }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
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
          <span className="inline-flex items-center justify-center font-sans font-medium text-[9px] tracking-widest text-text-muted border border-border bg-surface-alt px-2 py-[2px] rounded uppercase">
            {prompt.category}
          </span>
          <span className="inline-flex items-center justify-center font-sans font-medium text-[9px] tracking-widest text-accent border border-accent/20 bg-accent/5 px-2 py-[2px] rounded uppercase">
            {prompt.industry || "Universal"}
          </span>
        </div>
        <h3 className="font-sora font-bold text-base text-white mb-2 line-clamp-2">
          {prompt.title}
        </h3>
        <p className="font-sans text-[12px] text-text-primary leading-relaxed">
          {prompt.prompt.split(/\s+/).slice(0, 9).join(' ')}{prompt.prompt.split(/\s+/).length > 9 ? '...' : ''}
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
