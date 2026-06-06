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
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      if (fuseInstance) {
        let searchResults = fuseInstance.search(query).map((r: any) => r.item);
        if (industryFilter !== "All") {
          searchResults = searchResults.filter((r: PromptRecord) => r.industry === industryFilter || r.industry === "Universal" || (!r.industry && industryFilter === "Universal"));
        }
        setResults(searchResults);
      }
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, industryFilter, hasLoaded]); // Depend on hasLoaded so if they type before loaded, it searches after load

  return { query, setQuery, industryFilter, setIndustryFilter, results, isSearching, initSearch, hasLoaded };
}
