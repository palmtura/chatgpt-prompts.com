import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, prompts } = body;

    // 1. Authenticate webmaster
    if (username !== "lukas" || password !== "Test123***!!!") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: "No prompts provided" }, { status: 400 });
    }

    // Paths
    const dataFilePath = path.join(process.cwd(), "lib/data.ts");
    const jsonFilePath = path.join(process.cwd(), "public/search-index.json");

    // 2. Read lib/data.ts
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Source data file not found" }, { status: 500 });
    }
    const fileContent = fs.readFileSync(dataFilePath, "utf-8");

    // Obtain current max ID to increment unique IDs
    // We can do a safe regex matching first or query existing array
    const promptsMatch = fileContent.match(/export const PROMPTS = (\[[\s\S]*?\]);/);
    let maxId = 106; // Fallback to current hardcoded max if regex fails
    if (promptsMatch) {
      try {
        // Safer parsing/eval just to inspect IDs
        const existingPrompts = eval(promptsMatch[1]);
        if (Array.isArray(existingPrompts)) {
          maxId = existingPrompts.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
        }
      } catch (e) {
        console.error("Failed to parse existing prompts for ID calculation", e);
      }
    }

    // 3. Format new prompt elements & calculate increments
    const newElementsMapped = prompts.map((p, index) => {
      const nextId = maxId + 1 + index;
      const cleanTitle = p.title 
        ? p.title.trim() 
        : p.text.split(/\s+/).slice(0, 5).join(" ") + "...";
      
      return {
        id: nextId,
        category: p.category || "Marketing",
        title: cleanTitle,
        text: p.text.trim(),
        industry: p.industry || "Universal"
      };
    });

    // 4. Update core codebase file: lib/data.ts
    const targetString = "export const FAQS";
    const targetIndex = fileContent.indexOf(targetString);
    if (targetIndex === -1) {
      return NextResponse.json({ error: "Failed to detect file anchors for lib/data.ts" }, { status: 500 });
    }

    const beforeFaqs = fileContent.substring(0, targetIndex);
    const afterFaqs = fileContent.substring(targetIndex);
    const closingBracketIndex = beforeFaqs.lastIndexOf("];");

    if (closingBracketIndex === -1) {
      return NextResponse.json({ error: "Failed to find closing bracket of prompts array" }, { status: 500 });
    }

    const part1 = beforeFaqs.substring(0, closingBracketIndex);
    
    // Check if the array in part1 is already populated or trailing commas
    const trimmedPart1 = part1.trim();
    const needsLeadingComma = !trimmedPart1.endsWith("[") && !trimmedPart1.endsWith(",");

    // Generate formatted rows string to insert
    const formattedRows = newElementsMapped.map((p) => {
      return `  { id: ${p.id}, category: ${JSON.stringify(p.category)}, title: ${JSON.stringify(p.title)}, text: ${JSON.stringify(p.text)}, industry: ${JSON.stringify(p.industry)}}`;
    }).join(",\n");

    const newCode = part1 + (needsLeadingComma ? ",\n" : "") + formattedRows + "\n];\n\n" + afterFaqs;
    fs.writeFileSync(dataFilePath, newCode, "utf-8");

    // 5. Automatically regenerate public/search-index.json to include these immediately
    const updatedFileContent = fs.readFileSync(dataFilePath, "utf-8");
    const updatedPromptsMatch = updatedFileContent.match(/export const PROMPTS = (\[[\s\S]*?\]);/);
    if (updatedPromptsMatch) {
      try {
        const promptsRaw = eval(updatedPromptsMatch[1]);
        const searchIndex = promptsRaw.map((p: any) => {
          const words = p.text.split(" ");
          const title = p.title || (words.slice(0, 5).join(" ") + "...");
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const description = p.text.length > 50 ? p.text.substring(0, 50) + "..." : p.text;

          return {
            id: p.id.toString(),
            slug: slug,
            title: title,
            category: p.category,
            industry: p.industry || "Universal",
            tags: [p.category.toLowerCase().replace(" ", "-")],
            description: description,
            prompt: p.text
          };
        });

        const publicDir = path.dirname(jsonFilePath);
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(jsonFilePath, JSON.stringify(searchIndex), "utf-8");
      } catch (err) {
        console.error("Failed to automatically synchronize search-index.json", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${newElementsMapped.length} prompts successfully added and search index synchronized.`,
      addedCount: newElementsMapped.length
    });
  } catch (error: any) {
    console.error("Error in save-prompts route:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
