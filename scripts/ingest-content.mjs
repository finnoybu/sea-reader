import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ingestDir = 'content/_ingest_tmp';
const outDir = 'content/en';
const reportsDir = 'reports';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

const files = fs.readdirSync(ingestDir).filter(f => f.toLowerCase().endsWith('.md')).sort();
const report = [];
const seen = { ids: new Map(), slugs: new Set() };
let errors = 0;

for (const file of files) {
  const inPath = path.join(ingestDir, file);
  const raw = fs.readFileSync(inPath, 'utf8');
  const { data, content } = matter(raw);
  
  // Derive slug from filename
  const slug = path.basename(file, '.md').toLowerCase();
  
  // Ensure required fields
  if (data.id === null || data.id === undefined) {
    report.push(`⚠️  ${file}: missing id (skipped)`);
    errors++;
    continue;
  }
  if (!data.title) {
    report.push(`⚠️  ${file}: id=${data.id}, missing title (skipped)`);
    errors++;
    continue;
  }
  
  // Check for duplicates
  if (seen.ids.has(data.id)) {
    report.push(`❌ ${file}: id=${data.id} DUPLICATE with ${seen.ids.get(data.id)}`);
    errors++;
    continue;
  }
  if (seen.slugs.has(slug)) {
    report.push(`❌ ${file}: slug="${slug}" DUPLICATE`);
    errors++;
    continue;
  }
  
  seen.ids.set(data.id, file);
  seen.slugs.add(slug);
  
  // Fix/add fields
  data.slug = slug;
  if (!data.hero) {
    data.hero = { image: `/images/${slug}.jpg` };
  } else if (typeof data.hero === 'string') {
    // hero is already a string (image URL), wrap it
    data.hero = { image: data.hero };
  } else if (!data.hero.image) {
    // hero is an object but missing image field
    data.hero.image = `/images/${slug}.jpg`;
  }
  
  // Reconstruct file with corrected frontmatter
  const frontmatter = Object.entries(data)
    .map(([k, v]) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'object') {
        const entries = Object.entries(v).filter(([,v2]) => v2 !== null && v2 !== undefined);
        if (entries.length === 0) return null;
        return `${k}:\n${entries.map(([k2, v2]) => {
          if (typeof v2 === 'string') {
            const escaped = v2.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            return `  ${k2}: "${escaped}"`;
          }
          return `  ${k2}: ${v2}`;
        }).join('\n')}`;
      }
      if (typeof v === 'string') {
        const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `${k}: "${escaped}"`;
      }
      return `${k}: ${v}`;
    })
    .filter(x => x !== null)
    .join('\n');
  
  const outContent = `---\n${frontmatter}\n---\n\n${content}`;
  const outPath = path.join(outDir, file);
  fs.writeFileSync(outPath, outContent, 'utf8');
  
  report.push(`✅ ${file}: id=${data.id}, slug="${slug}"`);
}

report.unshift(`# Content Ingestion Report\n\n**Date**: ${new Date().toISOString()}\n**Total files**: ${files.length}\n**Processed**: ${files.length - errors}\n**Errors**: ${errors}\n`);
fs.writeFileSync(path.join(reportsDir, 'ingestion_report.md'), report.join('\n'), 'utf8');

console.log(report.join('\n'));
process.exit(errors > 0 ? 1 : 0);
