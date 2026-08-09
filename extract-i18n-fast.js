/**
 * i18n 빠른 추출 스크립트
 * 병렬 처리로 빠르게 UI 문자열 추출
 */

const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const SOURCE_ROOT = '/Users/pro/work/multiai/buzz';
const OUTPUT_DIR = '/Users/pro/work/multiai/i18n/buzz';
const GIT_HASH = '5bf7867';

// 제외 패턴
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.vscode', '.claude', '.github',
  'dist', 'build', 'target', 'public', 'tests', '__tests__',
  'fixtures', 'mocks', 'e2e', 'playwright', '.turbo'
]);

const EXCLUDE_FILE_PATTERNS = [
  /\.config\./, /\.spec\./, /\.test\./, /^playwright\./, /^vite\.config/,
  /^tailwind\.config/, /^postcss\.config/, /^biome\.config/, /^tsconfig/,
  /^\.d\.ts$/, /^\.lock$/, /^package\.json$/, /\/scripts\//, /\/\.vscode\//,
  /\/\.github\//, /\/\.claude\//, /\/benchmarks\//, /\/examples\//, /\/docs\//,
  /\/migrations\//, /\/schema\//
];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.rs']);

// UI 키워드로 간주할 단어 (단일 영단어로 추출되는 경우 이것만 포함)
const UI_SINGLE_WORDS = new Set([
  'Save', 'Cancel', 'Submit', 'Create', 'Update', 'Delete', 'Remove', 'Add', 'Edit',
  'Send', 'Clear', 'Copy', 'Paste', 'Cut', 'Select', 'Search', 'Filter',
  'Sort', 'Upload', 'Download', 'Print', 'Share', 'Export', 'Import', 'Refresh',
  'Close', 'Open', 'New', 'Done', 'Finish', 'Next', 'Previous', 'Back', 'Continue',
  'Skip', 'Later', 'More', 'Less', 'All', 'None', 'Any', 'Show', 'Hide', 'View',
  'Expand', 'Collapse', 'Minimize', 'Maximize', 'Restore', 'Enable', 'Disable',
  'On', 'Off', 'Activate', 'Deactivate', 'Agree', 'Disagree', 'Accept', 'Decline',
  'Confirm', 'Approve', 'Reject', 'Block', 'Unblock', 'Mute', 'Unmute',
  'Pin', 'Unpin', 'Star', 'Unstar', 'Follow', 'Unfollow', 'Subscribe',
  'Unsubscribe', 'Join', 'Leave', 'Start', 'Stop', 'Pause', 'Resume', 'Play',
  'Record', 'Attach', 'Link', 'Unlink', 'Connect', 'Disconnect',
  'Invite', 'Request', 'Report', 'Flag', 'Help', 'Support',
  'Login', 'Logout', 'Sign', 'Register', 'Success', 'Error', 'Failed',
  'Warning', 'Danger', 'Alert', 'Notice', 'Info', 'Warning',
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
  'Subject', 'Body', 'From', 'To', 'Cc', 'Bcc', 'Reply-To',
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
  'Search', 'Filter', 'Sort', 'Group', 'View', 'List', 'Grid', 'Table', 'Calendar',
  'List', 'Grid', 'Table', 'Calendar', 'Map',
  'Plus', 'Minus', 'Check', 'Search', 'Filter', 'Sort', 'Share', 'More',
  'Settings', 'Profile', 'Account', 'Notifications',
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
  'Search', 'Filter', 'Sort', 'View', 'Show',
  'More', 'Less', 'All', 'None', 'Some', 'Any',
  'First', 'Last', 'Previous', 'Next', 'Back',
  'Today', 'Yesterday', 'Tomorrow', 'Monday', 'Sunday',
  'Week', 'Month', 'Year', 'Hour', 'Minute', 'Second',
  'AM', 'PM', 'UTC', 'GMT',
  'Online', 'Offline', 'Away', 'Busy', 'Idle',
  'Admin', 'User', 'Member', 'Guest', 'Visitor',
  'Follow', 'Like', 'Share', 'Comment', 'Reply',
  'Subscribe', 'Unsubscribe', 'Mute', 'Unmute',
  'Block', 'Report', 'Flag', 'Spam', 'Abuse',
  'Upload', 'Download', 'Save', 'Open', 'Preview',
  'Copy', 'Cut', 'Paste', 'Select', 'Deselect',
  'Color', 'Size', 'Width', 'Height', 'Length',
  'Font', 'Weight', 'Style', 'Bold', 'Italic', 'Underline',
  'Align', 'Left', 'Center', 'Right', 'Justify',
  'Bullet', 'Number', 'List', 'Indent', 'Outdent',
  'Table', 'Cell', 'Row', 'Column', 'Grid',
  'Image', 'Video', 'Audio', 'File', 'Link', 'Quote',
  'Bold', 'Italic', 'Underline', 'Strikethrough',
  'Heading', 'Paragraph', 'Code', 'Pre', 'Blockquote',
  'Hashtag', 'Mention', 'Emoji', 'Gif', 'Sticker',
  'Reaction', 'Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry',
  'Subscribe', 'Unsubscribe', 'Mute', 'Follow', 'Unfollow',
  'Block', 'Unblock', 'Pin', 'Unpin', 'Star', 'Unstar',
  'Save', 'Bookmark', 'Archive', 'Delete', 'Restore',
  'Report', 'Flag', 'Spam', 'Abuse', 'Harassment',
  'Help', 'Support', 'Feedback', 'Suggestion', 'Complaint',
  'Terms', 'Privacy', 'Policy', 'License', 'Agreement',
  'About', 'Contact', 'Settings', 'Profile', 'Account',
  'Security', 'Notifications', 'Appearance', 'Theme',
  'Language', 'Region', 'Timezone', 'Date', 'Time',
  'Currency', 'Country', 'State', 'City', 'Zip',
  'Search', 'Find', 'Look', 'Query', 'Result',
  'Loading', 'Please wait', 'Processing', 'Complete',
  'Error', 'Failed', 'Success', 'Done', 'Warning',
  'Are you sure', 'Confirm', 'Cancel', 'OK'
]);

// Tailwind 클래스 제외 패턴
const TAILWIND_EXCLUDE = [
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
  'sr-only', 'not-sr-only', 'pointer-events'
];

// SVG path 데이터 패턴
const SVG_PATH_RE = /^[MmLlHhVvCcSsQqTtAaZz][\d.,\s\-+]+$/;

// 이미 i18n 처리된 라인
const I18N_LINE_RE = /\b(?:t\s*\(|useTranslation|i18n\.t|i18n\.translate|intl\.|req\.t|ctx\.t|__\(|defineMessages|FormattedMessage|<Trans\b)/i;

// import/export 문
const IMPORT_EXPORT_RE = /^(?:import|export)\s+/;

function shouldExcludeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return true;
  for (const pattern of EXCLUDE_FILE_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }
  return false;
}

function createKey(relativePath, fileName, lineNumber, text) {
  const parts = relativePath.split(path.sep);
  const sourceRoot = parts[0];
  const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

  const sanitized = text
    .replace(/[^a-zA-Z0-9가-힣ぁ-ゟァ-ヺー一-龯々〆ヽヾ\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);

  const keySuffix = sanitized || `line${lineNumber}`;
  const keyParts = [sourceRoot];
  parts.slice(1).forEach(part => {
    if (!EXCLUDE_DIRS.has(part)) keyParts.push(part);
  });
  keyParts.push(fileNameWithoutExt);
  keyParts.push(String(lineNumber));
  keyParts.push(keySuffix);

  return keyParts.join('.');
}

function isLikelyUIText(text) {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();
  if (trimmed.length <= 1) return false;

  // 한글/일본어/중국어 포함 시 UI 텍스트로 간주
  if (/[가-힣]/.test(trimmed)) return true;
  if (/[ぁ-ゟァ-ヺー]/.test(trimmed)) return true;
  if (/[一-龯]/.test(trimmed)) return true;

  // 기술 패턴 제외 (URL, 색상코드, SVG path 등)
  if (/^https?:\/\//.test(trimmed)) return false;
  if (/^mailto:/.test(trimmed)) return false;
  if (/^#?([0-9a-fA-F]{3,8})$/.test(trimmed)) return false;
  if (/^[a-f0-9]{8,}$/i.test(trimmed)) return false;
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(trimmed)) return false;
  if (/^[\d\s.,;:!?()\-+*\/%&|^~<>{}[\]\\@#$`']*$/i.test(trimmed)) return false;

  // SVG path 데이터 제외
  if (SVG_PATH_RE.test(trimmed) && trimmed.length > 10) return false;

  // Tailwind CSS 클래스 제외
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  if (TAILWIND_EXCLUDE.some(prefix => firstWord.startsWith(prefix))) return false;

  // 영문 텍스트
  if (/^[A-Za-z\s\-'.!?,;:()@]+$/.test(trimmed)) {
    const wordCount = trimmed.split(/\s+/).length;
    const lowerText = trimmed.toLowerCase();

    // 2단어 이상의 자연스러운 영문 문구인 경우 UI 텍스트로 간주
    if (wordCount >= 2 && trimmed.length >= 4) return true;

    // 단일 단어인 경우 UI 키워드인지 확인
    if (wordCount === 1) {
      return UI_SINGLE_WORDS.has(trimmed) ||
             UI_SINGLE_WORDS.has(trimmed.toLowerCase().charAt(0).toUpperCase() + trimmed.toLowerCase().slice(1));
    }
    return false;
  }

  // 이모지만 있는 경우 제외
  if (/^[\p{Emoji}\s]+$/u.test(trimmed) && trimmed.length > 3) return false;

  return false;
}

function extractStringsFromFile(filePath) {
  const strings = [];
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return strings;
  }

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) continue;
    if (I18N_LINE_RE.test(trimmedLine)) continue;
    if (IMPORT_EXPORT_RE.test(trimmedLine)) continue;

    const candidates = [];

    // 큰따옴표 문자열
    let m;
    const dq = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    dq.lastIndex = 0;
    while ((m = dq.exec(trimmedLine)) !== null) {
      const c = m[1];
      if (c && isLikelyUIText(c)) candidates.push(c);
    }

    // 작은따옴표 문자열
    const sq = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
    sq.lastIndex = 0;
    while ((m = sq.exec(trimmedLine)) !== null) {
      const c = m[1];
      if (c && isLikelyUIText(c)) candidates.push(c);
    }

    // 템플릿 리터럴
    const tmpl = /`([^`\\]*?)`/g;
    tmpl.lastIndex = 0;
    while ((m = tmpl.exec(trimmedLine)) !== null) {
      const c = m[1];
      if (c && !c.includes('{') && !c.includes('}') && !c.includes('$') && isLikelyUIText(c)) {
        candidates.push(c);
      }
    }

    // JSX 텍스트
    const jsxText = />([^<>{}]+)</g;
    jsxText.lastIndex = 0;
    while ((m = jsxText.exec(trimmedLine)) !== null) {
      const c = m[1].trim();
      if (c && c.length >= 2 && isLikelyUIText(c)) candidates.push(c);
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
      while ((am = re.exec(trimmedLine)) !== null) {
        const c = am[1] || am[2] || '';
        if (c && isLikelyUIText(c)) candidates.push(c);
      }
    }

    [...new Set(candidates)].forEach(str => {
      const key = createKey(filePath, path.basename(filePath), lineNumber, str);
      const existingKey = strings.find(s => s.key === key);
      if (!existingKey) strings.push({ key, value: str });
    });
  }

  return strings;
}

function walkDir(dirPath, relativePath = '') {
  const files = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const currentRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry.name)) {
          files.push(...walkDir(fullPath, currentRelativePath));
        }
      } else if (entry.isFile()) {
        if (!shouldExcludeFile(fullPath)) {
          files.push({ fullPath, relativePath: currentRelativePath });
        }
      }
    }
  } catch (e) {}
  return files;
}

if (isMainThread) {
  // 메인 스레드: 파일 수집 및 결과 집계
  console.log('=== i18n 문자열 추출 시작 (Fast) ===');
  console.log(`Git Hash: ${GIT_HASH}`);

  const allFiles = [];
  for (const lib of ['web', 'admin-web', 'desktop', 'mobile', 'crates', 'script']) {
    const libPath = path.join(SOURCE_ROOT, lib);
    if (fs.existsSync(libPath)) {
      const files = walkDir(libPath, lib);
      allFiles.push(...files);
    }
  }
  console.log(`📄 소스 파일: ${allFiles.length}개`);

  // 파일들을 청크로 나누어 병렬 처리
  const CHUNK_SIZE = 50;
  const chunks = [];
  for (let i = 0; i < allFiles.length; i += CHUNK_SIZE) {
    chunks.push(allFiles.slice(i, i + CHUNK_SIZE));
  }
  console.log(`🔄 ${chunks.length}개 청크로 분할`);

  const results = [];
  let completedChunks = 0;

  function processChunk(chunk) {
    return new Promise((resolve) => {
      const worker = new Worker(__filename, { workerData: { chunk } });
      worker.on('message', (strings) => {
        results.push(...strings);
        completedChunks++;
        if (completedChunks % 10 === 0) {
          console.log(`  ⏩ ${completedChunks}/${chunks.length} 청크 완료 (${results.length}개 문자열)`);
        }
        resolve();
      });
      worker.on('error', () => resolve());
    });
  }

  console.log('\n⏳ 추출 중...');
  (async () => {
    await Promise.all(chunks.map(processChunk));

    // 중복 제거
    const uniqueMap = new Map();
    for (const item of results) {
      if (!uniqueMap.has(item.key)) {
        uniqueMap.set(item.key, item);
      }
    }
    const uniqueResults = Array.from(uniqueMap.values());

    // 출력
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    const outputPath = path.join(OUTPUT_DIR, `${GIT_HASH}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(uniqueResults, null, 2), 'utf-8');

    const korean = uniqueResults.filter(r => /[가-힣]/.test(r.value)).length;
    const japanese = uniqueResults.filter(r => /[ぁ-ゟァ-ヺー]/.test(r.value)).length;
    const chinese = uniqueResults.filter(r => /[一-龯]/.test(r.value)).length;
    const english = uniqueResults.filter(r => /[A-Za-z]{3,}/.test(r.value) && !/[가-힣ぁ-ゟァ-ヺー一-龯]/.test(r.value)).length;

    console.log('\n=== ✅ 추출 완료 ===');
    console.log(`파일 저장: ${outputPath}`);
    console.log(`총 문자열: ${uniqueResults.length}개`);
    console.log(`  🇰🇷 한글: ${korean}개`);
    console.log(`  🇯🇵 일본어: ${japanese}개`);
    console.log(`  🇨🇳 중국어: ${chinese}개`);
    console.log(`  🇺🇸 영어: ${english}개`);

    console.log('\n=== 샘플 (처음 20개) ===');
    uniqueResults.slice(0, 20).forEach((r, i) => {
      console.log(`${i + 1}. [${r.key}] "${r.value}"`);
    });
    if (uniqueResults.length > 20) {
      console.log(`   ... 외 ${uniqueResults.length - 20}개`);
    }
  })();
} else {
  // 워커 스레드: 파일 처리
  const { chunk } = workerData;
  const localResults = [];
  for (const file of chunk) {
    try {
      localResults.push(...extractStringsFromFile(file.fullPath));
    } catch (e) {}
  }
  parentPort.postMessage(localResults);
}
