import fs from 'fs';
import path from 'path';

// Regex to extract PROMPTS array
const dataFilePath = path.join(process.cwd(), 'lib/data.ts');
const dataContent = fs.readFileSync(dataFilePath, 'utf-8');

const promptsMatch = dataContent.match(/export const PROMPTS = (\[[\s\S]*?\]);/);
if (promptsMatch) {
  // Use a safer eval or robust parsing if it was complex, but simple eval works for static arrays
  const promptsRaw = eval(promptsMatch[1]);
  
  const searchIndex = promptsRaw.map(p => {
    // Generate title and description from text
    const words = p.text.split(' ');
    const title = words.slice(0, 5).join(' ') + '...';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const description = p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text;

    return {
      id: p.id.toString(),
      slug: slug,
      title: title,
      category: p.category,
      tags: [p.category.toLowerCase().replace(' ', '-')],
      description: description,
      prompt: p.text
    };
  });

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  fs.writeFileSync(path.join(publicDir, 'search-index.json'), JSON.stringify(searchIndex));
  console.log('Search index generated successfully');
} else {
  console.error('Failed to parse PROMPTS');
}
