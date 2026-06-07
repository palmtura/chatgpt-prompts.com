"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { ArrowRight, Menu, Search as SearchIcon, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PopularPrompts from "@/components/PopularPrompts";
import FAQ from "@/components/FAQ";
import Popup from "@/components/Popup";
import { useSearch } from "@/hooks/useSearch";
import { SearchResults } from "@/components/SearchResults";
import AdminDashboard from "@/components/AdminDashboard";

export default function Page() {
  const { query, setQuery, industryFilter, setIndustryFilter, results, isSearching, initSearch, hasLoaded } = useSearch();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main className="w-full">
        <Hero 
          query={query} 
          setQuery={setQuery} 
          industry={industryFilter}
          setIndustry={setIndustryFilter}
          initSearch={initSearch} 
          isSearching={isSearching}
        />
        {query.trim().length > 0 ? (
          <SearchResults results={results} isSearching={isSearching} />
        ) : (
          <>
            <CategorySection />
            <PopularPrompts />
            <ExtendedEditorial />
            <FAQ />
          </>
        )}
      </main>
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onRefreshSearchIndex={initSearch}
      />
      <Popup />
    </>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur border-b border-border transition-colors">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-sora text-lg text-white">
            <Image src="/chatgptpromptslogo.webp" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain rounded" />
            <span><span className="text-accent">ChatGPT</span>-Prompts</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-sans text-sm font-medium text-text-muted">
          <Link href="#categories" className="hover:text-white transition-colors">Marketing</Link>
          <Link href="#categories" className="hover:text-white transition-colors">Sales</Link>
          <Link href="#categories" className="hover:text-white transition-colors">Presentations</Link>
          <Link href="#categories" className="hover:text-white transition-colors">Email</Link>
          <Link href="#categories" className="hover:text-white transition-colors">Social</Link>
          <Link href="#categories" className="hover:text-white transition-colors">SEO</Link>
          <Link href="#categories" className="hover:text-white transition-colors">More</Link>
        </div>

        <div className="flex items-center">
          <a href="https://expertslides.ai" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-baseline bg-[#f3f3f3] hover:bg-[#050505] hover:ring-1 hover:ring-white font-sans font-bold text-[10.5px] uppercase tracking-widest px-5 py-2 rounded-full transition-all duration-300 group">
            <span className="text-black group-hover:animate-gradient-text transition-colors duration-300">
              CREATE AI DESIGNS
            </span>
            <sup className="ml-1 text-[8px] font-bold text-black group-hover:text-white transition-colors duration-300">
              (NEW)
            </sup>
          </a>
          <button className="md:hidden text-white ml-4">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ 
  query, 
  setQuery,
  industry,
  setIndustry,
  initSearch, 
  isSearching 
}: { 
  query: string;
  setQuery: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  initSearch: () => void;
  isSearching: boolean;
}) {
  return (
    <section className="relative w-full pt-10 pb-8 overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-dot-grid w-full h-[200%] -top-[50%] animate-[slide_60s_linear_infinite] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background pointer-events-none" />
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-2 md:px-4 flex flex-col items-center justify-center text-center">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-surface border border-border rounded-full w-fit mb-6 relative group overflow-hidden transition-colors hover:border-success/40">
          <div className="absolute inset-0 bg-gradient-to-r from-success/0 via-success/5 to-success/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse relative z-10 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="font-sans font-bold text-[12px] tracking-widest text-text-muted uppercase relative z-10">
            USE OR RESELL ALL CHATGPT PROMPTS - <span className="text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">100% FREE FOREVER</span>
          </span>
        </div>
        
        <h1 className="font-sora tracking-tight font-light text-[36px] md:text-[56px] leading-[1.1] mb-8 text-white text-center w-full lg:whitespace-nowrap px-0">
          ChatGPT Prompts <span className="block lg:inline">- <span className="font-sans italic animate-gradient-text">Instant Search</span></span>
        </h1>

        {/* Search Bar */}
        <div className="w-full max-w-[800px] relative group mx-auto flex flex-col md:flex-row gap-2 mt-8 md:mt-2">
          
          {/* Try for free pointer */}
          {query.trim().length === 0 && (
            <div className="hidden lg:flex absolute top-1/2 -left-20 -translate-y-[80%] z-30 pointer-events-none flex-col items-end scale-50 origin-bottom-right opacity-80">
              <div className="font-sora font-bold text-xl text-white mb-2 leading-tight text-left italic mr-12 rotate-[-4deg]">
                Try It Out<br />For Free
              </div>
              <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M 20 0 C 20 40, 40 55, 80 55" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="5 10" fill="none"/>
                <path d="M 65 40 L 85 55 L 65 70" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          )}

          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-20 text-text-muted transition-colors group-focus-within:text-white">
              <SearchIcon size={18} strokeWidth={2} />
            </div>
            
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={initSearch}
              placeholder="Search thousands of ChatGPT prompts..." 
              className="w-full bg-surface border border-border rounded-xl md:rounded-2xl py-3 md:py-[18px] pl-12 pr-12 text-[#ffffff] font-sora text-sm md:text-base placeholder:text-text-muted/60 transition-all duration-300 focus:outline-none focus:border-white focus:shadow-[0_0_24px_rgba(255,255,255,0.1)] outline-none relative z-10"
            />

            {isSearching && (
              <div className="absolute inset-y-0 right-5 flex items-center z-20">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Industry Filter */}
          <div className="relative min-w-[140px] md:w-[150px] z-20 group/filter">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-20 text-text-muted transition-colors group-focus-within/filter:text-white">
              <Filter size={16} strokeWidth={2} />
            </div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-full bg-surface border border-border rounded-xl md:rounded-2xl py-3 md:py-[18px] pl-10 pr-10 text-[#ffffff] font-sora text-xs md:text-sm cursor-pointer appearance-none outline-none focus:border-white transition-all duration-300 relative z-10"
            >
              <option className="bg-surface text-white" value="Universal">Universal</option>
              <option className="bg-surface text-white" value="Automotive">Automotive</option>
              <option className="bg-surface text-white" value="Agriculture">Agriculture</option>
              <option className="bg-surface text-white" value="Technology">Technology</option>
              <option className="bg-surface text-white" value="Healthcare">Healthcare</option>
              <option className="bg-surface text-white" value="Finance">Finance</option>
              <option className="bg-surface text-white" value="Real Estate">Real Estate</option>
              <option className="bg-surface text-white" value="Education">Education</option>
              <option className="bg-surface text-white" value="Retail">Retail</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-20 text-text-muted transition-colors group-focus-within/filter:text-white">
              <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          {/* Search Glow Effect */}
          <div className="absolute inset-0 bg-white/5 blur-xl -z-10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section id="categories" className="pb-8 md:pb-14 pt-2 px-6 md:px-12 w-full max-w-[1200px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {CATEGORIES.map((cat) => {
          return (
            <Link 
              href={cat.href}
              key={cat.id} 
              className="group aspect-square p-6 flex flex-col items-center justify-center bg-[#050505] border border-border/50 rounded-2xl transition-all duration-300 hover:bg-[#050505]"
            >
              <div className="relative w-[125px] h-[125px] md:w-[156px] md:h-[156px] mb-6 transition-transform duration-300 group-hover:scale-[1.15]">
                <Image 
                  src={`/${cat.id}.webp`}
                  alt={cat.name}
                  fill
                  className="object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <h3 className="font-sora text-sm md:text-lg font-medium text-white text-center tracking-tight">
                {cat.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ExtendedEditorial() {
  return (
    <div className="w-full border-t border-border bg-surface-alt/20">
      <div className="py-14 md:py-24 px-6 md:px-12 w-full max-w-[1200px] mx-auto flex flex-col gap-20">
        
        {/* Section 7.1 */}
        <section>
          <span className="font-sans font-medium text-[12px] tracking-[0.08em] text-text-muted uppercase mb-3 block">
            WHY IT MATTERS
          </span>
          <h2 className="font-sora text-3xl md:text-4xl text-white mb-6 tracking-tight">
            Why the Right ChatGPT Prompt Changes Everything
          </h2>
          <div className="space-y-6 font-sans text-text-primary leading-relaxed text-base md:text-lg">
            <p>
              Most people open ChatGPT and type whatever comes to mind. They get mediocre results and assume AI just isn&apos;t that good. The truth is that ChatGPT is only as good as the prompt you give it. A vague request produces a vague response. A precisely structured ChatGPT Prompt — with clear context, a defined output format, and a target audience — produces results you can actually use.
            </p>
            <p>
              The best ChatGPT Prompts share four traits: they define a role (&apos;Act as a senior marketing strategist&apos;), they provide context, they specify the format of the output, and they set constraints. When these four elements are in place, ChatGPT becomes less of a chatbot and more of a skilled, always-available collaborator.
            </p>
            <p>
              Every ChatGPT Prompt in our library has been written with these principles in mind. They are not generic — they are templates engineered to produce outputs you can use directly in your work, with minimal editing. Whether you need ChatGPT Prompts for a board presentation, a sales email, or a 30-day social media calendar, you will find it here, and it will work.
            </p>
          </div>
        </section>

        {/* Section 7.2 */}
        <section>
          <span className="font-sans font-medium text-[12px] tracking-[0.08em] text-text-muted uppercase mb-3 block">
            THE BENEFITS
          </span>
          <h2 className="font-sora text-3xl md:text-4xl text-white mb-6 tracking-tight">
            What You Gain with the Right ChatGPT Prompts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Save 3–5 Hours Per Week", desc: "The average professional spends hours writing emails, reports, and presentations. With well-structured ChatGPT Prompts, these tasks take minutes instead of hours." },
              { title: "Consistently High-Quality Output", desc: "Guessing at prompts produces inconsistent results. A proven ChatGPT Prompt template produces reliable, high-quality output every time — even for complex tasks." },
              { title: "Works Across All Models", desc: "Every ChatGPT Prompt in our library works with ChatGPT 3.5, GPT-4, GPT-4o, Claude, Gemini, and other large language models. Write once, use everywhere." },
              { title: "Free to Use", desc: "There is no paywall, no subscription, and no account required. Every ChatGPT Prompt on this site is 100% free for personal and commercial use." },
              { title: "Covers Every Professional Use Case", desc: "Whether you are a marketer, founder, consultant, designer, or HR professional, there is a category of ChatGPT Prompts built specifically for your daily tasks." },
              { title: "Customizable", desc: "Every prompt uses [brackets] for the parts you personalize. Swap in your product, audience, or tone in seconds and get results that are specifically yours." }
            ].map((b, i) => (
              <div key={i} className="bg-surface p-6 rounded-2xl border border-border">
                <h3 className="font-sora text-xl text-white mb-2">{b.title}</h3>
                <p className="font-sans text-text-primary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function Footer({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 px-6 md:px-12 mt-12 w-full">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
             <Link href="/" className="flex items-center gap-2 font-sora text-xl text-white mb-4 w-fit">
              <Image src="/chatgptpromptslogo.webp" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain rounded" />
              <span><span className="text-accent">ChatGPT</span>-Prompts</span>
            </Link>
            <p className="font-sans text-text-muted max-w-sm">
              The largest free library of ChatGPT Prompts. Hand-picked templates for professionals to save time and output better results. 100% free forever.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans font-semibold text-white mb-4">Categories</h4>
            <ul className="flex flex-col gap-3 font-sans text-sm text-text-muted">
              <li><Link href="#" className="hover:text-accent transition-colors">Marketing Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Sales Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Presentations Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Email Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Social Media Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">SEO & Content Prompts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-white mb-4">Resources</h4>
            <ul className="flex flex-col gap-3 font-sans text-sm text-text-muted">
              <li><Link href="#" className="hover:text-accent transition-colors">How to Write ChatGPT Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Most Popular Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">New Prompts</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between font-sans text-xs text-text-muted">
          <div>
            © 2024 chatgpt-prompts.com · All prompts are free to use. ·{" "}
            <button
              onClick={onOpenAdmin}
              className="hover:text-white underline cursor-pointer pr-1 transition-colors outline-none"
            >
              Webmaster
            </button>
          </div>
          <p className="mt-2 sm:mt-0">Not affiliated with OpenAI.</p>
        </div>
      </div>
    </footer>
  );
}
