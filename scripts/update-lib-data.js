const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the PROMPTS array directly
const parts = content.split('export const PROMPTS = [');
if (parts.length > 1) {
  const PROMPTS_part = parts[1].split('];')[0];
  const items = PROMPTS_part.split('},').map(i => i.trim());
  const newItems = items.map(itemStr => {
    let raw = itemStr;
    if (raw.endsWith('}')) {
      raw = raw.slice(0, -1);
    }
    // Extract text
    const textMatch = raw.match(/text:\s*"([^"]+)"/);
    if (!textMatch) return itemStr;
    
    let text = textMatch[1].split(/[.:]/)[0].trim();
    const dangling = ["for", "a", "an", "the", "vs", "to", "with", "about", "in", "on", "of", "and", "by"];
    const prefixes = [
      /^(Write\s+a\s+|Write\s+an\s+|Write\s+|Create\s+a\s+|Create\s+an\s+|Create\s+|Generate\s+a\s+|Generate\s+an\s+|Generate\s+|Draft\s+a\s+|Draft\s+an\s+|Draft\s+|Suggest\s+|Develop\s+a\s+|Turn\s+(?:this\s+)?|Help\s+me\s+|Rewrite\s+this\s+|Rewrite\s+these\s+|Summarize\s+this\s+|Prioritize\s+these\s+|Conduct\s+a\s+)/i
    ];
    for (const p of prefixes) {
      text = text.replace(p, '');
    }
    text = text.replace(/^\d+\s+/, '');
    text = text.replace(/\[([^\]]+)\]/g, '$1');
    
    let words = text.split(/\s+/).slice(0, 5);
    while (words.length > 0 && dangling.includes(words[words.length - 1].toLowerCase())) {
      words.pop();
    }
    
    let title = words.join(' ').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Add title before text
    return raw.replace(/text:\s*"/, `title: "${title}", text: "`) + '}';
  });
  
  const newContent = parts[0] + 'export const PROMPTS = [\n  ' + newItems.join(',\n  ') + '\n];' + parts[1].substring(PROMPTS_part.length + 2);
  fs.writeFileSync(filePath, newContent);
}
