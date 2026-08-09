import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = '/Users/pro/work/multiai/buzz';
const OUTPUT_DIR = '/Users/pro/work/multiai/i18n/buzz';
const GIT_COMMIT = '5bf7867';

// Recursive function to expand **,*,* patterns
function expandGlobPatterns(patterns: string[]): string[] {
  const results: string[] = [];
  for (const pattern of patterns) {
    if (pattern.includes('**')) {
      // Handle ** pattern
      const parts = pattern.split('/');
      const starIdx = parts.findIndex(p => p.includes('*') && !p.includes('**'));
      if (starIdx === -1) {
        // Just ** without other wildcards - find all matching
        const base = pattern.replace('**', '');
        const basePath = path.join(ROOT_DIR, base);
        if (fs.existsSync(basePath)) {
          const files = getAllFiles(basePath, base);
          results.push(...files);
        }
      } else {
        // Handle multi-level wildcards
        const before = parts.slice(0, starIdx).join('/');
        const after = parts.slice(starIdx + 1).join('/');
        const basePath = path.join(ROOT_DIR, before);
        if (fs.existsSync(basePath)) {
          const files = getAllFiles(basePath, after ? [after] : []);
          results.push(...files);
        }
      }
    } else if (pattern.includes('*')) {
      // Single level wildcard
      const parts = pattern.split('/');
      const starIdx = parts.findIndex(p => p.includes('*'));
      const before = parts.slice(0, starIdx).join('/');
      const afterPart = parts[starIdx];
      const after = parts.slice(starIdx + 1).join('/');

      const basePath = path.join(ROOT_DIR, before);
      if (fs.existsSync(basePath)) {
        const entries = fs.readdirSync(basePath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile()) {
            const match = afterPart.replace(/\*/g, '.*').replace(/\./g, '\\.');
            const regex = new RegExp(`^${match}$`);
            if (regex.test(entry.name)) {
              const relPath = path.relative(ROOT_DIR, path.join(before, entry.name));
              if (!after || entry.name.endsWith(after.replace(/\*/g, ''))) {
                results.push(path.join(ROOT_DIR, relPath));
              }
            }
          }
        }
      }
    } else {
      // Exact path
      const fullPath = path.join(ROOT_DIR, pattern);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        results.push(fullPath);
      }
    }
  }
  return [...new Set(results)];
}

function getAllFiles(dir: string, suffixPatterns: string[]): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getAllFiles(fullPath, suffixPatterns));
      } else if (entry.isFile()) {
        // Check if matches suffix patterns
        if (suffixPatterns.length === 0 || suffixPatterns.some(p => {
          const extPattern = p.replace(/\*/g, '.*');
          const regex = new RegExp(`^.*${extPattern}$`);
          return regex.test(entry.name);
        })) {
          results.push(fullPath);
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }
  return results;
}

// Common i18n function patterns to look for
const I18N_PATTERNS = [
  // t('...') or t("...")
  /t\(\s*['"]([^'"]+)['"]\s*\)/g,
  // i18n.t('...') or i18n.t("...")
  /i18n\.t\(\s*['"]([^'"]+)['"]\s*\)/g,
  // __('...') or __("...")
  /__\(\s*['"]([^'"]+)['"]\s*\)/g,
  // translate('...')
  /translate\(\s*['"]([^'"]+)['"]\s*\)/g,
  // _t('...')
  /_t\(\s*['"]([^'"]+)['"]\s*\)/g,
  // intl.formatMessage({ defaultMessage: '...' })
  /defaultMessage:\s*['"]([^'"]+)['"]/g,
  // <FormattedMessage defaultMessage="..." />
  /defaultMessage\s*=\s*["']([^"']+)["']/g,
  // echo __('...') (PHP)
  /__\(\s*['"]([^'"]+)['"]\s*\)/g,
];

// Strings to skip (common non-i18n strings)
const SKIP_STRINGS = [
  // File paths
  /^\/[\w\/\.\-]+$/,
  // URLs
  /^https?:\/\//,
  // Email addresses
  /^[\w\.\-]+@[\w\.\-]+\.\w+$/,
  // CSS classes
  /^\.[\w\-]+$/,
  // Common JS/JSON keys that aren't user-facing strings
  /^(id|key|name|value|type|status|count|index|index|length|width|height|top|left|right|bottom|x|y|z|href|src|alt|title|placeholder|disabled|checked|selected|hidden|visible|active|loading|error|success|warning|info|color|size|variant|theme|mode|direction|align|justify|flex|grid|gutter|margin|padding|border|shadow|radius|opacity|transform|transition|animation|easing|delay|duration|interval|timeout|cursor|overflow|whitespace|text|font|weight|family|line|letter|word|indent|decoration|columns|gap|order|wrap|flow|direction|shrink|basis|grow|auto|initial|inherit|unset|revert|none|block|inline|flex|grid|table|list|run-in|compact|marker|ruby|shadow|first|last|only|nth|child|type|of|even|odd|root|nth-child|nth-of-type|empty|hover|focus|active|visited|link|target|disabled|enabled|checked|indeterminate|placeholder-shown|read-only|required|valid|invalid|in-range|out-of-range|user-valid|user-invalid|autofill|before|after|selection|backdrop|marker|placeholder|cue|scrollbar|slider|track|progress|meter|button|input|textarea|select|option|optgroup|fieldset|legend|label|datalist|output|details|summary|dialog|article|section|nav|aside|header|footer|main|figure|figcaption|mark|time|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|sub|sup|small|big|pre|code|kbd|samp|var|abbr|address|b|strong|i|em|u|s|strike|del|q|cite|dfn|abbr|data|time|u|mark|ruby|rt|rp|bdi|bdo|span|br)/i,
  // Hex colors
  /^#[0-9a-fA-F]{3,8}$/,
  // CSS values
  /^(hidden|visible|collapse|separate|collapse|solid|double|groove|ridge|inset|outset|none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|unset|initial|inherit|auto|0%|100%|0px|1px|2px|3px|4px|5px|6px|8px|10px|12px|16px|20px|24px|32px|40px|48px|64px|80px|96px|100px|120px|140px|160px|180px|200px|250px|300px|350px|400px|450px|500px|550px|600px|650px|700px|750px|800px|850px|900px|950px|1000px|1050px|1100px|1150px|1200px|1250px|1300px|1350px|1400px)$/,
  // Numbers
  /^\d+\.?\d*$/,
  // Generic placeholders that might not need translation
  /^\{.*\}$/,
  /^\[.*\]$/,
  // Very short strings that might be codes
  /^[a-z0-9_-]{1,3}$/i,
];

function shouldSkip(str: string): boolean {
  // Check against common skip patterns
  if (SKIP_STRINGS.some(pattern => pattern.test(str))) {
    return true;
  }
  // Skip very short strings (likely not user-facing)
  if (str.length < 2) {
    return true;
  }
  // Skip strings that look like code/keys
  if (/^[A-Z_]+$/.test(str) && str.length > 5) {
    return true;
  }
  // Skip strings with template literal syntax
  if (str.includes('${') || str.includes('{') || str.includes('}')) {
    return true;
  }
  return false;
}

function normalizeKey(str: string): string {
  // Replace spaces with underscores
  let key = str.trim().replace(/\s+/g, '_');
  // Replace dots with underscores (keep structure)
  key = key.replace(/\./g, '_');
  // Remove any characters that might break as JSON keys but preserve readability
  // Keep letters, numbers, underscores, hyphens
  key = key.replace(/[^\w\-]/g, '_');
  // Collapse multiple underscores
  key = key.replace(/_+/g, '_');
  // Trim underscores from edges
  key = key.replace(/^_|_$/g, '');
  return key.toLowerCase();
}

interface ExtractedString {
  key: string;
  value: string;
  line: number;
  file: string;
}

function extractFromLine(line: string, lineNum: number, filePath: string): ExtractedString[] {
  const results: ExtractedString[] = [];
  const relativePath = path.relative(ROOT_DIR, filePath);
  const pathParts = relativePath.split(path.sep);
  const fileName = pathParts.pop() || '';
  const ext = path.extname(fileName).slice(1);
  const nameWithoutExt = path.basename(fileName, path.extname(fileName));

  // Build key prefix: sourcefolder.subfolder...filename.ext
  const keyPrefix = [...pathParts, `${nameWithoutExt}.${ext}`].join('.');

  for (const pattern of I18N_PATTERNS) {
    let match;
    // Reset regex state
    pattern.lastIndex = 0;
    while ((match = pattern.exec(line)) !== null) {
      const extracted = match[1];
      if (extracted && !shouldSkip(extracted)) {
        // Handle duplicate matches from different patterns
        const key = `${keyPrefix}.${lineNum}.${normalizeKey(extracted)}`;
        results.push({
          key,
          value: extracted,
          line: lineNum,
          file: relativePath
        });
      }
    }
  }

  return results.map(r => ({ ...r }));
}

// Main extraction function
function extractAllStrings(): Map<string, string> {
  // Source files to scan
  const sourceFiles = [
    // TypeScript/JavaScript source files
    '**/*.{ts,tsx,js,jsx,vue}',
    // Exclude test files and config files from certain patterns
    '!**/*.spec.*',
    '!**/*.test.*',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.*',
    '!**/vite.config.*',
    '!**/tailwind.config.*',
    '!**/postcss.config.*',
    '!**/biome.json',
    '!**/playwright*.ts',
    '!**/*.schema.json',
    '!**/scripts/**',
  ];

  const extracted = new Map<string, string>();

  function scanDirectory(dir: string, excludePatterns: RegExp[]) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules and common exclusion dirs
        if (entry.isDirectory()) {
          if (['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'].includes(entry.name)) {
            continue;
          }
          // Skip playwright test directories at root level
          if (entry.name === 'tests' || entry.name.startsWith('test')) {
            // Still scan if it's not the root tests folder
            const parentRel = path.relative(ROOT_DIR, dir);
            if (parentRel === '' || parentRel.split(path.sep).length <= 1) {
              continue;
            }
          }
          scanDirectory(fullPath, excludePatterns);
          continue;
        }

        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).slice(1);
        if (!['ts', 'tsx', 'js', 'jsx', 'vue'].includes(ext)) continue;

        // Skip config files
        if (entry.name.includes('config') && (ext === 'ts' || ext === 'js' || ext === 'json')) {
          continue;
        }

        // Skip playwright test files
        if (entry.name.startsWith('playwright') || entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts')) {
          continue;
        }

        // Skip scripts directory
        if (path.relative(ROOT_DIR, fullPath).startsWith('scripts/')) {
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;
          const strings = extractFromLine(line, lineNum, fullPath);

          for (const str of strings) {
            // Use key as unique identifier
            if (!extracted.has(str.key)) {
              extracted.set(str.key, str.value);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning ${dir}:`, err);
    }
  }

  scanDirectory(ROOT_DIR, []);
  return extracted;
}

// Generate output
function generateOutput(extracted: Map<string, string>): object {
  const output: Record<string, string> = {};

  // Sort by key for consistent output
  const sortedKeys = Array.from(extracted.keys()).sort();

  for (const key of sortedKeys) {
    output[key] = extracted.get(key)!;
  }

  return output;
}

// Main
console.log('Extracting i18n strings...');
const extracted = extractAllStrings();
console.log(`Found ${extracted.size} unique strings`);

const output = generateOutput(extracted);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write output file
const outputPath = path.join(OUTPUT_DIR, `${GIT_COMMIT}.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Written to ${outputPath}`);

// Print summary
console.log('\nSample entries (first 20):');
const entries = Object.entries(output).slice(0, 20);
for (const [key, value] of entries) {
  console.log(`  ${key}: "${value}"`);
}
