/**
 * i18n 문자열 추출 - 단순/빠른 버전
 * 데스크탑/src, web/src, admin-web/src 주요 소스만 스캔
 */

const fs = require('fs');
const path = require('path');

const SOURCE_ROOT = '/Users/pro/work/multiai/buzz';
const OUTPUT_DIR = '/Users/pro/work/multiai/i18n/buzz';
const GIT_HASH = '5bf7867';

// Tailwind 클래스 제외 목록
const TAILWIND_EXCLUDE = new Set([
  'flex', 'grid', 'block', 'inline', 'hidden', 'visible',
  'text-', 'font-', 'leading-', 'tracking-', 'whitespace-',
  'bg-', 'bg-gradient-to', 'from-', 'via-', 'to-',
  'border-', 'rounded-', 'shadow-', 'opacity-',
  'p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-',
  'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
  'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
  'space-', 'gap-', 'divide-', 'overflow-', 'cursor-',
  'select-', 'z-', 'align-', 'justify-', 'flex-', 'order-',
  'shrink-', 'grow-', 'basis-', 'aspect-', 'size-',
  'top-', 'right-', 'bottom-', 'left-', 'inset-',
  'translate-', 'rotate-', 'scale-', 'skew-',
  'transition-', 'duration-', 'delay-', 'ease-',
  'animate-', 'transform-', 'origin-',
  'scroll-', 'touch-', 'resize-', 'object-',
  'fill-', 'stroke-', 'stroke-width', 'stroke-linecap',
  'stroke-linejoin', 'vector-effect',
  'sr-only', 'not-sr-only', 'pointer-events',
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'inset', 'inset-x', 'inset-y', 'inset-inline',
  'float', 'clear', 'table', 'table-row', 'table-cell',
  'list', 'list-item', 'contents', 'group', 'column',
  'col-span', 'row-span', 'grid-cols', 'grid-rows',
  'auto', 'none', 'full', 'screen', 'min', 'max',
  'vw', 'vh', 'dvh', 'dvw', 'svh', 'svw', 'lvh', 'lvw'
]);

// UI 키워드 (단일 영단어인 경우 이것만 포함)
const UI_WORDS = new Set([
  'Save', 'Cancel', 'Submit', 'Create', 'Update', 'Delete', 'Remove', 'Add', 'Edit',
  'Send', 'Clear', 'Copy', 'Paste', 'Cut', 'Select', 'Search', 'Filter',
  'Sort', 'Upload', 'Download', 'Print', 'Share', 'Export', 'Import', 'Refresh',
  'Close', 'Open', 'New', 'Done', 'Finish', 'Next', 'Previous', 'Back', 'Continue',
  'Skip', 'Later', 'More', 'Less', 'All', 'None', 'Any', 'Show', 'Hide', 'View',
  'Expand', 'Collapse', 'Minimize', 'Maximize', 'Restore', 'Enable', 'Disable',
  'On', 'Off', 'Agree', 'Disagree', 'Accept', 'Decline',
  'Confirm', 'Approve', 'Reject', 'Block', 'Unblock', 'Mute', 'Unmute',
  'Pin', 'Unpin', 'Star', 'Unstar', 'Follow', 'Unfollow', 'Subscribe',
  'Unsubscribe', 'Join', 'Leave', 'Start', 'Stop', 'Pause', 'Resume', 'Play',
  'Record', 'Attach', 'Link', 'Unlink', 'Connect', 'Disconnect',
  'Invite', 'Request', 'Report', 'Flag', 'Help', 'Support',
  'Login', 'Logout', 'Sign', 'Register',
  'Success', 'Error', 'Failed', 'Warning', 'Danger', 'Alert', 'Notice', 'Info',
  'OK', 'Yes', 'No', 'True', 'False',
  'Online', 'Offline', 'Away', 'Busy', 'Idle',
  'Active', 'Inactive', 'Pending', 'Closed', 'Open', 'Locked',
  'Enabled', 'Disabled', 'Visible', 'Hidden', 'Public', 'Private', 'Shared',
  'Home', 'Feed', 'Inbox', 'Outbox', 'Drafts', 'Sent', 'Archive', 'Trash',
  'Profile', 'Settings', 'Account', 'Notifications', 'Privacy', 'Security',
  'Billing', 'Subscription', 'Plan', 'Upgrade', 'Downgrade',
  'Free', 'Premium', 'Pro', 'Enterprise', 'Team', 'Business',
  'Basic', 'Standard', 'Advanced', 'Custom',
  'Activity', 'History', 'Log', 'Logs', 'Dashboard',
  'Library', 'Favorites', 'Bookmarks', 'Files', 'Media',
  'Chat', 'Messages', 'Threads', 'Channels', 'Rooms', 'Conversations',
  'Contacts', 'Friends', 'Followers', 'Following', 'Members', 'Users',
  'Team', 'Workspace', 'Organization', 'Group', 'Community',
  'Post', 'Comment', 'Reply', 'Quote', 'Mention', 'Tag', 'Hashtag',
  'Emoji', 'Reaction', 'Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry',
  'Title', 'Description', 'Content', 'Summary', 'Detail',
  'Name', 'Username', 'Email', 'Password', 'Phone', 'Address', 'Website',
  'Avatar', 'Icon', 'Image', 'Video', 'Audio', 'File', 'Document',
  'Subject', 'Body', 'From', 'To', 'Cc', 'Bcc',
  'Date', 'Time', 'Created', 'Updated', 'Deleted', 'Modified',
  'Category', 'Type', 'Status', 'Priority', 'Label', 'Tags',
  'Language', 'Region', 'Timezone', 'Currency', 'Country', 'State', 'City',
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Week', 'Month', 'Year', 'Day', 'Hour', 'Minute', 'Second',
  'Morning', 'Afternoon', 'Evening', 'Night',
  'Today', 'Yesterday', 'Tomorrow', 'Now', 'Later', 'Soon', 'Earlier',
  'Weekday', 'Weekend', 'AM', 'PM', 'UTC', 'GMT',
  'Congratulations', 'Achievement', 'Award', 'Badge', 'Level', 'Point', 'Score', 'Rank',
  'Greeting', 'Welcome', 'Hello', 'Hi', 'Thanks', 'Sorry',
  'Mention', 'Mentions', 'Notification', 'Notifications',
  'New', 'Updates', 'Activity', 'Changes',
  'Loading', 'Processing', 'Complete', 'Progress', 'Waiting', 'Queued',
  'List', 'Grid', 'Table', 'Calendar', 'Map',
  'Plus', 'Minus', 'Check',
  'Plus', 'Minus', 'Settings', 'Profile', 'Account',
  'Upload', 'Download', 'Save', 'Open', 'Preview',
  'Copy', 'Cut', 'Paste', 'Select', 'Clear', 'Apply',
  'Submit', 'Cancel', 'Save', 'Delete', 'Create', 'Edit', 'Update',
  'Back', 'Next', 'Previous', 'Finish', 'Continue', 'Close',
  'Show', 'Hide', 'View', 'Open', 'New', 'Add', 'Edit', 'Delete',
  'Search', 'Filter', 'Sort', 'List', 'Grid',
  'Info', 'Help', 'Warning', 'Danger', 'Alert',
  'On', 'Off', 'Enable', 'Disable',
  'Done', 'Skip', 'Later', 'Today', 'Now', 'Soon',
  'Stop', 'Start', 'Pause', 'Play', 'Record',
  'Copy', 'Cut', 'Paste', 'Select', 'All',
  'Up', 'Down', 'Left', 'Right', 'Top', 'Bottom',
  'First', 'Last', 'Previous', 'Next', 'Prev',
  'Today', 'Yesterday', 'Tomorrow', 'This', 'Week', 'Month', 'Year',
  'Delete', 'Remove', 'Cancel', 'Save', 'Edit', 'Update', 'Add',
  'Search', 'Filter', 'Sort', 'List', 'Grid',
  'Settings', 'Options', 'Preferences', 'Config',
  'Profile', 'Account', 'User', 'Admin', 'Owner',
  'Message', 'Chat', 'Thread', 'Channel', 'Room',
  'File', 'Image', 'Video', 'Audio', 'Document',
  'Link', 'URL', 'Email', 'Phone', 'Address',
  'Password', 'Username', 'Name', 'Avatar', 'Icon',
  'Title', 'Description', 'Content', 'Summary', 'Detail',
  'Status', 'Type', 'Category', 'Tag', 'Label',
  'Date', 'Time', 'Created', 'Updated', 'Deleted',
  'Public', 'Private', 'Shared', 'Visible', 'Hidden',
  'Success', 'Error', 'Warning', 'Info', 'Loading',
  'Please', 'Try', 'Again', 'Retry', 'Refresh',
  'Welcome', 'Hello', 'Hi', 'Thanks', 'Sorry',
  'Confirm', 'Cancel', 'OK', 'Yes', 'No',
  'Close', 'Open', 'New', 'Add', 'Edit', 'Delete',
  'Enter', 'Space', 'Escape', 'Tab',
  'Click', 'Tap', 'Press',
  'Missing', 'Required', 'Invalid', 'Found', 'Available',
  'Select', 'Choose', 'Pick', 'Option', 'Default', 'Custom',
  'Here', 'There', 'Where', 'When', 'Why', 'How',
  'About', 'Contact', 'Feedback', 'Report', 'Issue', 'Bug',
  'Feature', 'Request', 'Suggestion', 'Improvement',
  'Online', 'Offline', 'Away', 'Busy', 'Disturb',
  'Friend', 'Follow', 'Like', 'Love',
  'Admin', 'Moderator', 'Owner', 'Guest', 'Visitor',
  'Role', 'Permission', 'Access',
  'Language', 'Theme', 'Color', 'Font', 'Size', 'Layout',
  'Dark', 'Light', 'System', 'Auto',
  'Server', 'Client', 'Local', 'Remote', 'Cloud', 'Sync',
  'Connection', 'Network', 'Internet',
  'Progress', 'Complete', 'Processing', 'Waiting', 'Queued',
  'Today', 'Yesterday', 'Tomorrow', 'Week', 'Month', 'Year',
  'Hour', 'Minute', 'Second', 'Now', 'First', 'Last', 'All', 'None', 'Any',
  'Always', 'Never', 'Home', 'Feed', 'Inbox', 'Drafts', 'Sent',
  'Notifications', 'Billing', 'Subscription', 'Plan', 'Upgrade',
  'Free', 'Premium', 'Pro', 'Enterprise', 'Business',
  'Basic', 'Standard', 'Advanced',
  'Congratulations', 'Achievement', 'Award', 'Badge',
  'Warning', 'Danger', 'Alert', 'Caution', 'Notice', 'Info',
  'Create', 'Edit', 'Update', 'Delete', 'Remove', 'Add',
  'Save', 'Draft', 'Publish', 'Schedule', 'Post', 'Share', 'Bookmark',
  'Notification', 'Mention', 'Reaction', 'Emoji',
  'Connect', 'Disconnect', 'Invite', 'Request', 'Approve', 'Reject',
  'Block', 'Unblock', 'Mute', 'Unmute', 'Pin', 'Unpin', 'Star', 'Unstar',
  'Follow', 'Unfollow', 'Subscribe', 'Unsubscribe',
  'Agree', 'Disagree', 'Accept', 'Decline',
  'Continue', 'Pause', 'Resume', 'Stop',
  'Open', 'Close', 'Minimize', 'Maximize', 'Restore',
  'Refresh', 'Reload', 'Retry', 'Cancel',
  'Submit', 'Reset', 'Clear', 'Apply',
  'Search', 'Filter', 'Sort', 'Group', 'View',
  'List', 'Grid', 'Table', 'Calendar', 'Map',
  'Day', 'Week', 'Month', 'Year', 'All', 'Today',
  'Now', 'Later', 'Soon', 'Earlier', 'Yesterday', 'Tomorrow',
  'Morning', 'Afternoon', 'Evening', 'Night',
  'Weekday', 'Weekend', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]);

const EXCLUDE_PATTERNS = [
  /\.config\./, /\.spec\./, /\.test\./, /^playwright\./, /^vite\.config/,
  /^tailwind\.config/, /^postcss\.config/, /^biome\.config/, /^tsconfig/,
  /^\.d\.ts$/, /^\.lock$/, /^package\.json$/, /\/scripts\//, /\/\.vscode\//,
  /\/\.github\//, /\/\.claude\//, /\/benchmarks\//, /\/examples\//, /\/docs\//,
  /\/migrations\//, /\/schema\//, /\/target\//
];

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.rs']);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.vscode', '.claude', '.github', 'dist', 'build', 'target', 'public', 'tests', '__tests__', 'fixtures', 'mocks', 'e2e', 'playwright', '.turbo']);

function shouldExcludeFile(fp) {
  const ext = path.extname(fp).toLowerCase();
  if (!SOURCE_EXTS.has(ext)) return true;
  for (const p of EXCLUDE_PATTERNS) if (p.test(fp)) return true;
  return false;
}

function isI18nLine(line) {
  return /\b(?:t\s*\(|useTranslation|i18n\.t|i18n\.translate|intl\.|req\.t|ctx\.t|__\(|defineMessages|FormattedMessage|<Trans\b)/i.test(line);
}

function isImportExport(line) {
  return /^(?:import|export)\s+/.test(line);
}

function makeKey(relativePath, fileName, lineNum, text) {
  const parts = relativePath.split(path.sep);
  const srcRoot = parts[0];
  const fname = path.basename(fileName, path.extname(fileName));
  const sanitized = text
    .replace(/[^a-zA-Z0-9가-힣ぁ-ゟァ-ヺー一-龯々〆ヽヾ\-_]/g, '_')
    .replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100);
  const suffix = sanitized || `line${lineNum}`;
  const keyParts = [srcRoot];
  parts.slice(1).forEach(p => { if (!EXCLUDE_DIRS.has(p)) keyParts.push(p); });
  keyParts.push(fname, String(lineNum), suffix);
  return keyParts.join('.');
}

function isUICandidate(text) {
  if (!text || !text.trim()) return false;
  const t = text.trim();
  if (t.length <= 1) return false;

  // 한글/일본어/중국어는 무조건 UI 텍스트로 간주
  if (/[가-힣]/.test(t)) return true;
  if (/[ぁ-ゟァ-ヺー]/.test(t)) return true;
  if (/[一-龯]/.test(t)) return true;

  // 기술 패턴 제외
  if (/^https?:\/\//.test(t)) return false;
  if (/^mailto:/.test(t)) return false;
  if (/^#?[0-9a-fA-F]{3,8}$/.test(t)) return false;
  if (/^[a-f0-9]{8,}$/i.test(t)) return false;
  if (/^[\d\s.,;:!?()\-+*\/%&|^~<>{}[\]\\@#$`']*$/i.test(t)) return false;

  // SVG path 데이터 제외
  if (/^[MmLlHhVvCcSsQqTtAaZz][\d.,\s\-+]+$/.test(t) && t.length > 10) return false;

  // Tailwind CSS 클래스 제외
  const first = t.split(/\s+/)[0].toLowerCase();
  if (TAILWIND_EXCLUDE.has(first) || TAILWIND_EXCLUDE.has(first.replace(/[^a-z]/g, ''))) {
    for (const p of TAILWIND_EXCLUDE) {
      if (first.startsWith(p)) return false;
    }
  }

  // 영문 텍스트
  if (/^[A-Za-z\s\-'.!?,;:()@]+$/.test(t)) {
    const words = t.split(/\s+/);
    if (words.length >= 2 && t.length >= 4) return true;
    if (words.length === 1) {
      return UI_WORDS.has(t) || UI_WORDS.has(t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    }
    return false;
  }

  // 이모지만 있는 경우 제외
  if (/^[\p{Emoji}\s]+$/u.test(t) && t.length > 3) return false;
  return false;
}

function extractFile(filePath) {
  const results = [];
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) { return results; }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    if (isI18nLine(trimmed)) continue;
    if (isImportExport(trimmed)) continue;

    const candidates = [];
    let m;

    // 큰따옴표
    const dq = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    dq.lastIndex = 0;
    while ((m = dq.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && isUICandidate(c)) candidates.push(c);
    }

    // 작은따옴표
    const sq = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
    sq.lastIndex = 0;
    while ((m = sq.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && isUICandidate(c)) candidates.push(c);
    }

    // 템플릿 리터럴
    const tmpl = /`([^`\\]*?)`/g;
    tmpl.lastIndex = 0;
    while ((m = tmpl.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && !c.includes('{') && !c.includes('}') && !c.includes('$') && isUICandidate(c)) {
        candidates.push(c);
      }
    }

    // JSX 텍스트
    const jsx = />([^<>{}]+)</g;
    jsx.lastIndex = 0;
    while ((m = jsx.exec(trimmed)) !== null) {
      const c = m[1].trim();
      if (c && c.length >= 2 && isUICandidate(c)) candidates.push(c);
    }

    // JSX 속성
    const attrs = [
      /aria-label=["']([^"']+)["']/i, /aria-labelledby=["']([^"']+)["']/i,
      /alt=["']([^"']+)["']/i, /title=["']([^"']+)["']/i,
      /placeholder=["']([^"']+)["']/i, /placeholder={"([^}]+)"}/,
      /label={"([^}]+)"}/, /value={"([^}]+)"}/, /children={"([^}]+)"}/
    ];
    for (const re of attrs) {
      let am;
      re.lastIndex = 0;
      while ((am = re.exec(trimmed)) !== null) {
        const c = am[1] || am[2] || '';
        if (c && isUICandidate(c)) candidates.push(c);
      }
    }

    [...new Set(candidates)].forEach(str => {
      const key = makeKey(filePath, path.basename(filePath), lineNum, str);
      const existing = results.find(r => r.key === key);
      if (!existing) results.push({ key, value: str });
    });
  }
  return results;
}

function walkDir(dirPath, relativePath) {
  const files = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry.name)) files.push(...walkDir(fullPath, rel));
      } else if (entry.isFile()) {
        if (!shouldExcludeFile(fullPath)) files.push({ fullPath, relativePath: rel });
      }
    }
  } catch (e) {}
  return files;
}

console.log('=== i18n 추출 시작 ===');
const allFiles = [];
for (const lib of ['web', 'admin-web', 'desktop', 'mobile', 'crates', 'script']) {
  const libPath = path.join(SOURCE_ROOT, lib);
  if (fs.existsSync(libPath)) {
    const files = walkDir(libPath, lib);
    allFiles.push(...files);
  }
}
console.log(`📄 파일: ${allFiles.length}개`);

console.log('\n⏳ 추출 중...');
const allStrings = [];
for (let i = 0; i < allFiles.length; i++) {
  const file = allFiles[i];
  try {
    allStrings.push(...extractFile(file.fullPath));
  } catch (e) {}
  if ((i + 1) % 200 === 0) console.log(`  ⏩ ${i + 1}/${allFiles.length}`);
}

console.log(`\n📊 추출: ${allStrings.length}개`);

const uniqueMap = new Map();
for (const item of allStrings) {
  if (!uniqueMap.has(item.key)) uniqueMap.set(item.key, item);
}
const unique = Array.from(uniqueMap.values());

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(OUTPUT_DIR, `${GIT_HASH}.json`);
fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');

const korean = unique.filter(r => /[가-힣]/.test(r.value)).length;
const japanese = unique.filter(r => /[ぁ-ゟァ-ヺー]/.test(r.value)).length;
const chinese = unique.filter(r => /[一-龯]/.test(r.value)).length;
const english = unique.filter(r => /[A-Za-z]{3,}/.test(r.value) && !/[가-힣ぁ-ゟァ-ヺー一-龯]/.test(r.value)).length;

console.log('\n=== ✅ 완료 ===');
console.log(`파일: ${outputPath}`);
console.log(`총: ${unique.length}개`);
console.log(`🇰🇷 한글: ${korean}개`);
console.log(`🇯🇵 일본어: ${japanese}개`);
console.log(`🇨🇳 중국어: ${chinese}개`);
console.log(`🇺🇸 영어: ${english}개`);

console.log('\n=== 샘플 (처음 30개) ===');
unique.slice(0, 30).forEach((r, i) => {
  console.log(`${i + 1}. [${r.key}] "${r.value}"`);
});
if (unique.length > 30) console.log(`   ... 외 ${unique.length - 30}개`);
