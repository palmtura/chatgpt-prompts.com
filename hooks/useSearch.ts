"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type PromptRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  industry: string;
  tags: string[];
  description: string;
  prompt: string;
};

let fuseInstance: any = null;
let searchIndex: PromptRecord[] = [];

export function useSearch() {
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("Universal");
  const [results, setResults] = useState<PromptRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const initSearch = useCallback(async () => {
    if (fuseInstance || hasLoaded) return;
    
    try {
      const [{ default: Fuse }, res] = await Promise.all([
        import('fuse.js'),
        fetch('/search-index.json')
      ]);
      
      const data = await res.json();
      searchIndex = data;
      
      fuseInstance = new Fuse(searchIndex, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'category', weight: 0.2 },
          { name: 'industry', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
          { name: 'prompt', weight: 0.2 },
        ],
        includeScore: true,
        threshold: 0.3,
        distance: 1000,
        ignoreLocation: true,
      });
      
      setHasLoaded(true);
    } catch (e) {
      console.error("Failed to initialize search", e);
    }
  }, [hasLoaded]);

  // Handle debounced search
  useEffect(() => {
    if (!query.trim()) {
      Promise.resolve().then(() => {
        setResults([]);
        setIsSearching(false);
      });
      return;
    }

    Promise.resolve().then(() => {
      setIsSearching(true);
    });
    const delayDebounceFn = setTimeout(() => {
      if (fuseInstance) {
        let searchResults = fuseInstance.search(query).map((r: any) => r.item);
        if (industryFilter) {
          searchResults = searchResults.filter((r: PromptRecord) => {
            const promptInd = r.industry || "Universal";
            return promptInd.toLowerCase() === industryFilter.toLowerCase();
          });
        }
        setResults(searchResults);
      }
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, industryFilter, hasLoaded]); // Depend on hasLoaded so if they type before loaded, it searches after load

  // Listen to custom event for prompt updates to clear search cache
  useEffect(() => {
    const handleUpdate = () => {
      fuseInstance = null;
      searchIndex = [];
      setHasLoaded(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("promptsUpdated", handleUpdate);
      return () => window.removeEventListener("promptsUpdated", handleUpdate);
    }
  }, []);

  return { query, setQuery, industryFilter, setIndustryFilter, results, isSearching, initSearch, hasLoaded };
}
