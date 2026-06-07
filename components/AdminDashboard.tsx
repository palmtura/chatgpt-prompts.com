"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  LogOut, 
  Download, 
  Sliders,
  Database,
  ArrowRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "Universal",
  "Automotive",
  "Agriculture",
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Education",
  "Retail"
];

const CATEGORIES_LIST = [
  "Marketing",
  "Sales",
  "Presentations",
  "Email",
  "Social Media",
  "SEO & Content",
  "Business",
  "HR & Recruiting",
  "Productivity",
  "Creative Writing",
  "Customer Service",
  "E-Commerce"
];

export default function AdminDashboard({ 
  isOpen, 
  onClose,
  onRefreshSearchIndex
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onRefreshSearchIndex?: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Upload & states
  const [defaultCategory, setDefaultCategory] = useState("Marketing");
  const [defaultIndustry, setDefaultIndustry] = useState("Universal");
  const [parsedPrompts, setParsedPrompts] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "lukas" && password === "Test123***!!!") {
      setIsAuthenticated(true);
      setLoginError("");
      setStatusMessage({ type: "", text: "" });
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setParsedPrompts([]);
    setStatusMessage({ type: "", text: "" });
  };

  // Helper to parse sheets/csv files via SheetJS
  const processFile = (file: File) => {
    setIsProcessing(true);
    setStatusMessage({ type: "", text: "" });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File content is empty");

        // Read workbook
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse rows as raw JSON array of objects
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawRows.length === 0) {
          throw new Error("No data found in sheet");
        }

        // Validate strictly for the three required columns: TITLE, PROMPT, CATEGORY
        const keys = Object.keys(rawRows[0]);
        const hasTitle = keys.some(k => k.toUpperCase() === "TITLE");
        const hasPrompt = keys.some(k => k.toUpperCase() === "PROMPT");
        const hasCategory = keys.some(k => k.toUpperCase() === "CATEGORY");

        if (!hasTitle || !hasPrompt || !hasCategory) {
          throw new Error("Invalid structure. The Excel sheet MUST contain the exact columns: TITLE, PROMPT, CATEGORY.");
        }

        const titleKey = keys.find(k => k.toUpperCase() === "TITLE")!;
        const promptKey = keys.find(k => k.toUpperCase() === "PROMPT")!;
        const categoryKey = keys.find(k => k.toUpperCase() === "CATEGORY")!;

        const mapped = rawRows.map((row) => {
          const promptText = row[promptKey] ? String(row[promptKey]).trim() : "";
          const rawTitle = row[titleKey] ? String(row[titleKey]).trim() : "";
          const rawCategory = row[categoryKey] ? String(row[categoryKey]).trim() : defaultCategory;

          return {
            title: rawTitle || (promptText.split(/\s+/).slice(0, 5).join(" ") + "..."),
            text: promptText,
            category: rawCategory,
            industry: defaultIndustry // Assigned from UI dropdown as requested
          };
        }).filter(item => item.text && item.text.length > 5);

        if (mapped.length === 0) {
          throw new Error("No valid prompt data found (prompts must be at least 5 characters long).");
        }

        setParsedPrompts(mapped);
        setStatusMessage({ 
          type: "success", 
          text: `Successfully parsed: ${mapped.length} prompts loaded from the file. Please review them in the table below.` 
        });
      } catch (err: any) {
        console.error("Parsing error:", err);
        setStatusMessage({ type: "error", text: `Error reading file: ${err.message || "Invalid file format"}` });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setStatusMessage({ type: "error", text: "A file reading error occurred." });
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit parsed prompts to API
  const handleSaveToDatabase = async () => {
    if (parsedPrompts.length === 0) return;
    setIsProcessing(true);
    setStatusMessage({ type: "info", text: "Generating static JSON bundle..." });

    try {
      await triggerIndexDownload();
      setStatusMessage({ 
        type: "success", 
        text: `Success! The complete JSON bundle has been downloaded. You can replace your public/search-index.json with this new file and commit it.` 
      });
      setParsedPrompts([]); // Clear table on success
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: `Error generating bundle: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Static site utility: Downloads absolute complete search JSON directly
  const triggerIndexDownload = async () => {
    try {
      const res = await fetch(`/search-index.json?v=${new Date().getTime()}`);
      const index = await res.json();
      
      const extraMapped = parsedPrompts.map((p, indexOffset) => {
        const nextId = 9999 + indexOffset;
        const words = p.text.split(" ");
        const title = p.title || (words.slice(0, 5).join(" ") + "...");
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const description = p.text.length > 50 ? p.text.substring(0, 50) + "..." : p.text;

        return {
          id: nextId.toString(),
          slug,
          title,
          category: p.category,
          industry: p.industry,
          tags: [p.category.toLowerCase().replace(" ", "-")],
          description,
          prompt: p.text
        };
      });

      const merged = [...index, ...extraMapped];
      const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "search-index.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Error building download bundle.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen">
      <div 
        className="w-full max-w-[900px] bg-surface rounded-2xl border border-border overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in-50 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with close button */}
        <div className="bg-surface-alt px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders size={18} className="text-accent" />
            <span className="font-sora text-sm uppercase tracking-wider font-bold text-white">
              Webmaster Admin Area
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-white transition-colors p-1 bg-background rounded-full border border-border"
          >
            <X size={16} />
          </button>
        </div>

        {!isAuthenticated ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="p-8 max-w-md mx-auto flex flex-col justify-center py-16">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 border border-accent/40">
                <Lock className="text-accent" size={24} />
              </div>
              <h2 className="font-sora text-2xl text-white font-medium mb-2">Webmaster Login</h2>
              <p className="font-sans text-xs text-text-muted">Access the webmaster panel with your administrator credentials.</p>
            </div>

            {loginError && (
              <div className="mb-4 bg-red-950/40 border border-red-500/50 rounded-xl p-3 flex items-center space-x-2 text-red-200 text-xs font-sans">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1.5 font-sans">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white font-sora text-sm focus:border-accent duration-200 focus:outline-none"
                  placeholder="e.g. lukas"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1.5 font-sans">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white font-sora text-sm focus:border-accent duration-200 focus:outline-none"
                  placeholder="Enter password..."
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-accent text-black font-semibold rounded-xl hover:opacity-90 duration-200 font-sans tracking-wide text-sm flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* AUTHENTICATED PANEL */
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Logged in info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-alt/40 border border-border p-4 rounded-xl gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-success" />
                </div>
                <div>
                  <h4 className="text-white font-sora text-sm font-semibold">Logged in as <u>lukas</u></h4>
                  <p className="text-[11px] text-success">Directly editing lib/data.ts & search-index.json</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="font-sans text-xs flex items-center space-x-1.5 px-3 py-1.5 bg-background border border-border text-text-muted hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>

            {/* Config Default category & default industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-alt/20 border border-border p-4 rounded-xl space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted font-sans font-semibold">
                  Default Category (Fallback)
                </label>
                <select 
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="w-full bg-background border border-border text-white text-xs font-sora rounded-lg py-2.5 px-3 outline-none focus:border-accent"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted">Used if columns cannot be fully identified.</p>
              </div>

              <div className="bg-surface-alt/20 border border-border p-4 rounded-xl space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted font-sans font-semibold">
                  Target Industry Dropdown
                </label>
                <select 
                  value={defaultIndustry}
                  onChange={(e) => setDefaultIndustry(e.target.value)}
                  className="w-full bg-background border border-border text-white text-xs font-sora rounded-lg py-2.5 px-3 outline-none focus:border-accent"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted">Imports will map to this industry for instant segmented searches!</p>
              </div>
            </div>

            {/* Drag & Drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[160px]",
                dragActive 
                  ? "border-accent bg-accent/5 scale-[0.99]" 
                  : "border-border bg-surface-alt/10 hover:border-text-muted/60 hover:bg-surface-alt/20"
              )}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <Upload className="text-text-muted group mt-1 mb-3 hover:text-white" size={32} />
              <h3 className="font-sora text-sm text-white font-medium mb-1">
                Upload Excel (.xlsx, .xls) or CSV here
              </h3>
              <p className="font-sans text-xs text-text-muted max-w-md">
                Drag and drop your file directly here, or click to browse files.
              </p>
              <span className="mt-3 inline-flex items-center text-[10px] font-medium text-accent border border-accent/20 bg-accent/5 px-2.5 py-[3px] rounded uppercase font-sans">
                Requires exact headers: TITLE, PROMPT, CATEGORY
              </span>
            </div>

            {/* Status alerts */}
            {statusMessage.text && (
              <div className={cn(
                "p-3.5 rounded-xl border flex items-start space-x-2 text-xs font-sans",
                statusMessage.type === "success" && "bg-success/10 border-success/30 text-success-alt",
                statusMessage.type === "error" && "bg-red-950/30 border-red-500/30 text-red-200",
                statusMessage.type === "info" && "bg-accent/10 border-accent/30 text-accent"
              )}>
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Preview Area */}
            {parsedPrompts.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-sora text-sm text-white font-medium">Preview (First 3 Rows):</h4>
                  <span className="text-xs text-text-muted font-sans font-medium bg-background px-2.5 py-1 rounded border border-border">
                    {parsedPrompts.length} rows loaded
                  </span>
                </div>
                
                <div className="bg-background border border-border rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-surface-alt/70 p-3 font-semibold text-white border-b border-border font-sora">
                    <div>Category</div>
                    <div>Industry</div>
                    <div>Title</div>
                    <div>Prompt Text (Snippet)</div>
                  </div>
                  <div className="divide-y divide-border">
                    {parsedPrompts.slice(0, 3).map((prompt, i) => (
                      <div key={i} className="grid grid-cols-4 p-3 text-text-muted font-sans font-light hover:bg-[#070707] duration-150">
                        <div className="truncate pr-2 font-medium text-white">{prompt.category}</div>
                        <div className="truncate pr-2 text-accent font-semibold">{prompt.industry}</div>
                        <div className="truncate pr-2 font-medium">{prompt.title}</div>
                        <div className="truncate text-text-primary italic">&quot;{prompt.text}&quot;</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm operations actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button 
                    disabled={isProcessing}
                    onClick={handleSaveToDatabase}
                    className="w-full sm:flex-1 py-3 bg-success text-black font-semibold rounded-xl hover:opacity-90 duration-200 font-sans tracking-wide text-xs flex items-center justify-center space-x-2 disabled:opacity-55 cursor-pointer"
                  >
                    <Database size={14} />
                    <span>Upload & Save to lib/data.ts (Permanent)</span>
                  </button>

                  <button 
                    onClick={triggerIndexDownload}
                    className="w-full sm:w-auto px-5 py-3 bg-background border border-border text-text-primary hover:text-white rounded-xl duration-200 font-sans text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download as search-index.json</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
        
        {/* Footer info in Admin modal */}
        <div className="bg-surface-alt/40 px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted font-sans">
          <span>Tip: Highly optimized for static hosting directly on your GitHub Page.</span>
          <span>© 2024 chatgpt-prompts.com Webmaster Panel</span>
        </div>
      </div>
    </div>
  );
}
