/**
 * i18n 문자열 추출 - Buzz 프로젝트 전체
 * 대상: crates/, web/, mobile/, migrations/, scripts/
 * 키 형식: 소스루트폴더.서브폴더...파일명.line.(문자열_공백은_언더바)
 */

const fs = require('fs');
const path = require('path');

const ROOT = '/Users/pro/work/multiai/buzz';
const OUT = '/Users/pro/work/multiai/i18n/buzz';
const HASH = '5bf7867';

// === UI 키워드 (영문 단일 단어) ===
const UI_WORDS = new Set([
  'Save','Cancel','Submit','Create','Update','Delete','Remove','Add','Edit',
  'Send','Clear','Copy','Paste','Cut','Select','Search','Filter','Sort',
  'Upload','Download','Share','Export','Import','Refresh','Retry',
  'Close','Open','New','Done','Finish','Next','Previous','Back','Continue',
  'Skip','Later','Show','Hide','View','Expand','Collapse','Minimize','Maximize',
  'Restore','Enable','Disable','Confirm','Approve','Reject','Block','Unblock',
  'Mute','Unmute','Pin','Star','Follow','Unfollow','Subscribe','Join','Leave',
  'Start','Stop','Pause','Resume','Play','Record','Connect','Disconnect',
  'Invite','Request','Report','Flag','Help','Support','Login','Logout','Sign',
  'Register','Success','Error','Failed','Warning','Alert','Notice','Info',
  'OK','Yes','No','Online','Offline','Away','Busy','Idle',
  'Active','Inactive','Pending','Closed','Locked','Visible','Hidden',
  'Public','Private','Shared','Home','Feed','Inbox','Drafts','Sent','Archive',
  'Profile','Settings','Account','Privacy','Security','Billing','Subscription',
  'Plan','Upgrade','Downgrade','Dashboard','Library','Favorites','Bookmarks',
  'Chat','Messages','Threads','Channels','Rooms','Conversations',
  'Contacts','Friends','Followers','Members','Users',
  'Team','Workspace','Organization','Group','Community',
  'Post','Comment','Reply','Quote','Mention','Tag','Emoji','Reaction',
  'Like','Love','Haha','Wow','Sad','Angry',
  'Title','Description','Content','Summary','Detail',
  'Name','Username','Email','Password','Phone','Address','Website',
  'Avatar','Icon','Image','Video','Audio','File','Document',
  'Subject','Body','From','To','Cc','Bcc',
  'Date','Time','Created','Updated','Deleted','Modified',
  'Category','Type','Status','Priority','Label','Tags',
  'Language','Region','Timezone','Currency','Country','State','City',
  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
  'January','February','March','April','May','June','July','August','September',
  'October','November','December',
  'Week','Month','Year','Day','Hour','Minute','Second',
  'Morning','Afternoon','Evening','Night',
  'Today','Yesterday','Tomorrow','Now','Later','Soon',
  'Welcome','Hello','Hi','Thanks','Sorry',
  'Notification','Notifications','Updates','Changes',
  'Loading','Processing','Progress','Waiting','Queued',
  'List','Grid','Table','Calendar','Map',
  'Enter','Space','Escape','Tab','Click','Tap','Press',
  'Missing','Required','Invalid','Found','Available',
  'Select','Choose','Pick','Option','Default','Custom',
  'Here','There','About','Contact','Feedback','Report','Issue','Bug',
  'Feature','Request','Suggestion','Improvement',
  'Friend','Follow','Admin','Moderator','Owner','Guest','Visitor',
  'Role','Permission','Access',
  'Language','Theme','Color','Font','Size','Layout',
  'Dark','Light','System','Auto',
  'Server','Client','Local','Remote','Cloud','Sync',
  'Connection','Network','Internet',
  'Please','Try','Again','Refresh',
  'Set','Get','Toggle','Switch','Change',
  'Check','Uncheck',
  'Bold','Italic','Underline','Strikethrough',
  'Bullet','Number','List','Indent','Outdent',
  'Cell','Row','Column',
  'Quote','Link','Hashtag','Gif','Sticker',
  'Spam','Abuse','Harassment',
  'Terms','Privacy','Policy','License','Agreement',
  'Appearance','Theme',
  'Find','Look','Query','Result',
  'Upload','Download','Save','Open','Preview',
  'Copy','Cut','Paste','Select','Deselect',
  'Color','Size','Width','Height','Length',
  'Font','Style',
  'Align','Left','Center','Right','Justify',
  'Heading','Paragraph','Code','Pre','Blockquote',
  'Subscribe','Unsubscribe','Mute','Follow','Unfollow',
  'Block','Unblock','Pin','Unpin','Star','Unstar',
  'Save','Bookmark','Archive','Delete','Restore',
  'Report','Flag','Spam','Abuse','Harassment',
  'Help','Support','Feedback','Suggestion','Complaint',
  'About','Contact','Settings','Profile','Account',
  'Security','Notifications','Appearance','Theme',
  'Language','Region','Timezone','Date','Time',
  'Currency','Country','State','City','Zip',
  'Search','Find','Look','Query','Result',
  'Loading','Processing','Complete',
  'Error','Failed','Success','Done','Warning',
  'Confirm','Cancel','OK',
  'Are','you','sure',
  'Play','Pause','Record','Stop','Start',
  'Add','Remove','Edit','Update','Delete','Create',
  'Search','Filter','Sort','Group','View',
  'List','Grid','Table','Calendar','Map',
  'Set','Get','Toggle','Switch','Change',
  'Check','Uncheck',
  'Copy','Cut','Paste','Select','Clear','Apply',
  'Submit','Cancel','Save','Delete','Create','Edit','Update',
  'Back','Next','Previous','Finish','Continue','Close',
  'Show','Hide','View','Open','New','Add','Edit','Delete',
  'Search','Filter','Sort','List','Grid',
  'Info','Help','Warning','Danger','Alert',
  'On','Off','Enable','Disable',
  'Done','Skip','Later','Today','Now','Soon',
  'Stop','Start','Pause','Play','Record',
  'Copy','Cut','Paste','Select','All',
  'Up','Down','Left','Right','Top','Bottom',
  'First','Last','Previous','Next','Prev',
  'Today','Yesterday','Tomorrow','This','Week','Month','Year',
  'Delete','Remove','Cancel','Save','Edit','Update','Add',
  'Search','Filter','Sort','List','Grid',
  'Settings','Options','Preferences','Config',
  'Profile','Account','User','Admin','Owner',
  'Message','Chat','Thread','Channel','Room',
  'File','Image','Video','Audio','Document',
  'Link','URL','Email','Phone','Address',
  'Password','Username','Name','Avatar','Icon',
  'Title','Description','Content','Summary','Detail',
  'Status','Type','Category','Tag','Label',
  'Date','Time','Created','Updated','Deleted',
  'Public','Private','Shared','Visible','Hidden',
  'Success','Error','Warning','Info','Loading',
  'Please','Try','Again','Retry','Refresh',
  'Welcome','Hello','Hi','Thanks','Sorry',
  'Confirm','Cancel','OK','Yes','No',
  'Close','Open','New','Add','Edit','Delete',
  'Enter','Space','Escape','Tab',
  'Click','Tap','Press',
  'Missing','Required','Invalid','Found','Available',
  'Select','Choose','Pick','Option','Default','Custom',
  'Here','There','Where','When','Why','How',
  'About','Contact','Feedback','Report','Issue','Bug',
  'Feature','Request','Suggestion','Improvement',
  'Online','Offline','Away','Busy','Disturb',
  'Friend','Follow','Like','Love',
  'Admin','Moderator','Owner','Guest','Visitor',
  'Role','Permission','Access',
  'Language','Theme','Color','Font','Size','Layout',
  'Dark','Light','System','Auto',
  'Server','Client','Local','Remote','Cloud','Sync',
  'Connection','Network','Internet',
  'Progress','Complete','Processing','Waiting','Queued',
  'Today','Yesterday','Tomorrow','Week','Month','Year',
  'Hour','Minute','Second','Now','First','Last','All','None','Any',
  'Always','Never','Home','Feed','Inbox','Drafts','Sent',
  'Notifications','Billing','Subscription','Plan','Upgrade',
  'Free','Premium','Pro','Enterprise','Business',
  'Basic','Standard','Advanced',
  'Congratulations','Achievement','Award','Badge',
  'Warning','Danger','Alert','Caution','Notice','Info',
  'Create','Edit','Update','Delete','Remove','Add',
  'Save','Draft','Publish','Schedule','Post','Share','Bookmark',
  'Notification','Mention','Reaction','Emoji',
  'Connect','Disconnect','Invite','Request','Approve','Reject',
  'Block','Unblock','Mute','Unmute','Pin','Unpin','Star','Unstar',
  'Follow','Unfollow','Subscribe','Unsubscribe',
  'Agree','Disagree','Accept','Decline',
  'Continue','Pause','Resume','Stop',
  'Open','Close','Minimize','Maximize','Restore',
  'Refresh','Reload','Retry','Cancel',
  'Submit','Reset','Clear','Apply',
  'Search','Filter','Sort','Group','View',
  'List','Grid','Table','Calendar','Map',
  'Day','Week','Month','Year','All','Today',
  'Now','Later','Soon','Earlier','Yesterday','Tomorrow',
  'Morning','Afternoon','Evening','Night',
  'Weekday','Weekend','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
  'Loading','Please wait','Processing','Complete',
  'Error','Failed','Success','Done','Warning',
  'Confirm','Cancel','OK',
  'Add','Remove','Save','Edit','Update',
  'Search','Filter','Sort','View','Show',
  'More','Less','All','None','Some','Any',
  'First','Last','Previous','Next','Back',
  'Today','Yesterday','Tomorrow','Week','Month','Year','Hour','Minute','Second',
  'AM','PM','UTC','GMT',
  'Online','Offline','Away','Busy','Idle',
  'Admin','User','Member','Guest','Visitor',
  'Follow','Like','Share','Comment','Reply',
  'Subscribe','Unsubscribe','Mute','Unmute',
  'Block','Report','Flag','Spam','Abuse',
  'Upload','Download','Save','Open','Preview',
  'Copy','Cut','Paste','Select','Deselect',
  'Color','Size','Width','Height','Length',
  'Font','Style','Bold','Italic','Underline',
  'Align','Left','Center','Right','Justify',
  'Bullet','Number','List','Indent','Outdent',
  'Table','Cell','Row','Column','Grid',
  'Image','Video','Audio','File','Link','Quote',
  'Bold','Italic','Underline','Strikethrough',
  'Heading','Paragraph','Code','Pre','Blockquote',
  'Hashtag','Mention','Emoji','Gif','Sticker',
  'Reaction','Like','Love','Haha','Wow','Sad','Angry',
  'Subscribe','Unsubscribe','Mute','Follow','Unfollow',
  'Block','Unblock','Pin','Unpin','Star','Unstar',
  'Save','Bookmark','Archive','Delete','Restore',
  'Report','Flag','Spam','Abuse','Harassment',
  'Help','Support','Feedback','Suggestion','Complaint',
  'Terms','Privacy','Policy','License','Agreement',
  'About','Contact','Settings','Profile','Account',
  'Security','Notifications','Appearance','Theme',
  'Language','Region','Timezone','Date','Time',
  'Currency','Country','State','City','Zip',
  'Search','Find','Look','Query','Result',
  'Loading','Processing','Complete',
  'Error','Failed','Success','Done','Warning',
  'Are you sure','Confirm','Cancel','OK',
  'Play','Pause','Record','Stop','Start',
  'Add','Remove','Edit','Update','Delete','Create',
  'Search','Filter','Sort','Group','View',
  'List','Grid','Table','Calendar','Map',
  'Set','Get','Toggle','Switch','Change',
  'Check','Uncheck',
  'Copy','Cut','Paste','Select','Clear','Apply',
  'Submit','Cancel','Save','Delete','Create','Edit','Update',
  'Back','Next','Previous','Finish','Continue','Close',
  'Show','Hide','View','Open','New','Add','Edit','Delete',
  'Search','Filter','Sort','List','Grid',
  'Info','Help','Warning','Danger','Alert',
  'On','Off','Enable','Disable',
  'Done','Skip','Later','Today','Now','Soon',
  'Stop','Start','Pause','Play','Record'
]);

// === Tailwind CSS 클래스 제외 ===
const TAILWIND_EXCLUDE = /^(?:flex|grid|block|inline|hidden|visible|text-|font-|leading-|tracking-|whitespace-|bg-|from-|via-|to-|border-|rounded-|shadow-|opacity-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|w-|h-|min-w-|min-h-|max-w-|max-h-|space-|gap-|divide-|overflow-|cursor-|select-|z-|align-|justify-|flex-|order-|shrink-|grow-|basis-|aspect-|size-|top-|right-|bottom-|left-|inset-|translate-|rotate-|scale-|skew-|transition-|duration-|delay-|ease-|animate-|transform-|origin-|scroll-|touch-|resize-|object-|fill-|stroke-|sr-only|not-sr-only|pointer-events|relative|absolute|fixed|sticky|static|inset|float|clear|table|list|contents|group|column|auto|none|full|screen|vw|vh|dvh|dvw|svh|svw|lvh|lvw)$/;

// === 제외할 디렉토리/폴더 ===
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.vscode', '.claude', '.github',
  'dist', 'build', 'target', 'public', '.turbo',
  'tests', '__tests__', 'fixtures', 'mocks', 'e2e', 'playwright',
  'schema', 'docs', 'examples', 'benchmarks', 'perf',
  'bin', 'patches'
]);

// === 소스 확장자 ===
const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.rs', '.sql', '.sh', '.py', '.toml', '.yaml', '.yml', '.json']);

// === 이미 i18n 처리된 패턴 ===
const I18N_PATTERNS = /\b(?:t\s*\(|useTranslation|i18n\.t|i18n\.translate|intl\.|req\.t|ctx\.t|__\(|defineMessages|FormattedMessage|<Trans\b|t!\(|tr!\(|gettext)/i;

function isUI(text) {
  if (!text || !text.trim()) return false;
  const t = text.trim();
  if (t.length <= 1) return false;

  // 한글/일본어/중국어는 무조건 포함
  if (/[가-힣]/.test(t)) return true;
  if (/[ぁ-ゟァ-ヺー]/.test(t)) return true;
  if (/[一-龯]/.test(t)) return true;

  // 기술 패턴 제외
  if (/^https?:\/\//.test(t)) return false;
  if (/^mailto:/.test(t)) return false;
  if (/^#?[0-9a-fA-F]{3,8}$/.test(t)) return false;
  if (/^[a-f0-9]{8,}$/i.test(t)) return false;

  // SVG path 제외
  if (/^[MmLlHhVvCcSsQqTtAaZz][\d.,\s\-+]+$/.test(t) && t.length > 10) return false;

  // Tailwind CSS 클래스 제외
  if (TAILWIND_EXCLUDE.test(t.split(/\s+/)[0].toLowerCase())) return false;

  // 영문 텍스트 처리
  if (/^[A-Za-z\s\-'.!?,;:()@]+$/.test(t)) {
    const words = t.split(/\s+/).filter(w => w.length > 0);
    // 2단어 이상 구절 또는 UI 키워드
    if (words.length >= 2 && t.length >= 4) return true;
    if (words.length === 1) {
      const capped = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      return UI_WORDS.has(t) || UI_WORDS.has(capped);
    }
    return false;
  }

  // 이모지만 있는 경우 제외
  if (/^[\p{Emoji}\s]+$/u.test(t) && t.length > 3) return false;
  return false;
}

function makeKey(relPath, fileName, lineNum, text) {
  // 공백을 언더바로 변환
  const sanitized = text
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9가-힣ぁ-ゟァ-ヺー一-龯々〆ヽヾ\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
  const suffix = sanitized || `line${lineNum}`;

  const parts = relPath.split(path.sep);
  const root = parts[0];
  const fname = path.basename(fileName, path.extname(fileName));

  const keyParts = [root];
  parts.slice(1).forEach(p => {
    if (!EXCLUDE_DIRS.has(p) && !p.startsWith('.') && p !== 'src-tauri') {
      keyParts.push(p);
    }
  });
  keyParts.push(fname, String(lineNum), suffix);
  return keyParts.join('.');
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

    // 주석 제외 (Rust, JS, TS, SQL)
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('--')) continue;

    // 이미 i18n 처리된 라인 제외
    if (I18N_PATTERNS.test(trimmed)) continue;

    // import/export 제외
    if (/^(?:import|export|use|mod|pub |fn |struct |enum |trait |impl |const |static |let |let mut )/i.test(trimmed)) continue;

    const candidates = [];
    let m;

    // 큰따옴표
    const dq = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    dq.lastIndex = 0;
    while ((m = dq.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && isUI(c)) candidates.push(c);
    }

    // 작은따옴표
    const sq = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
    sq.lastIndex = 0;
    while ((m = sq.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && isUI(c)) candidates.push(c);
    }

    // 템플릿 리터럴 (변수 없는 단순 텍스트만)
    const tmpl = /`([^`\\]*?)`/g;
    tmpl.lastIndex = 0;
    while ((m = tmpl.exec(trimmed)) !== null) {
      const c = m[1];
      if (c && !c.includes('{') && !c.includes('}') && !c.includes('$') && isUI(c)) {
        candidates.push(c);
      }
    }

    // JSX 텍스트
    const jsx = />([^<>{}]+)</g;
    jsx.lastIndex = 0;
    while ((m = jsx.exec(trimmed)) !== null) {
      const c = m[1].trim();
      if (c && c.length >= 2 && isUI(c)) candidates.push(c);
    }

    // JSX 속성
    const attrs = [
      /aria-label=["']([^"']+)["']/i, /aria-labelledby=["']([^"']+)["']/i,
      /alt=["']([^"']+)["']/i, /title=["']([^"']+)["']/i,
      /placeholder=["']([^"']+)["']/i, /placeholder={"([^}]+)"}/,
      /label={"([^}]+)"}/, /value={"([^}]+)"}/
    ];
    for (const re of attrs) {
      let am;
      re.lastIndex = 0;
      while ((am = re.exec(trimmed)) !== null) {
        const c = am[1] || am[2] || '';
        if (c && isUI(c)) candidates.push(c);
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

console.log('=== i18n 추출 시작 (Buzz 전체) ===');
console.log(`Git Hash: ${HASH}`);
console.log(`대상 루트:
  - crates/ (Rust 소스)
  - web/ (웹 클라이언트)
  - mobile/ (모바일 Flutter)
  - migrations/ (SQL 마이그레이션)
  - scripts/ (스크립트)`);

// 소스 디렉토리 수집
const SRC_DIRS = [
  path.join(ROOT, 'crates'),
  path.join(ROOT, 'web'),
  path.join(ROOT, 'mobile'),
  path.join(ROOT, 'migrations'),
  path.join(ROOT, 'scripts')
];

function collectFiles(dirPath, relPath) {
  const files = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const rel = relPath ? `${relPath}/${entry.name}` : entry.name;

      // excluded directory 체크
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        files.push(...collectFiles(fullPath, rel));
        continue;
      }

      // 파일 확장자 체크
      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTS.has(ext)) continue;

      // 설정 파일/테스트 파일 제외
      if (/\.config\./.test(fullPath)) continue;
      if (/\.spec\./.test(fullPath)) continue;
      if (/\.test\./.test(fullPath) && ext === '.rs') continue;
      if (/playwright/.test(fullPath)) continue;
      if (/tsconfig/.test(fullPath)) continue;
      if (/biome\.config/.test(fullPath)) continue;
      if (/tailwind\.config/.test(fullPath)) continue;
      if (/postcss\.config/.test(fullPath)) continue;
      if (/\.d\.ts$/.test(fullPath)) continue;
      if (/package\.json$/.test(fullPath)) continue;
      if (/\.lock$/.test(fullPath)) continue;
      if (/Cargo\.toml$/.test(fullPath) && !fullPath.includes('/crates/')) continue;

      files.push({ fullPath, relativePath: rel });
    }
  } catch (e) {}
  return files;
}

let allFiles = [];
for (const dir of SRC_DIRS) {
  if (fs.existsSync(dir)) {
    const files = collectFiles(dir, path.basename(dir));
    allFiles.push(...files);
  }
}

console.log(`\n📄 스캔 대상 파일: ${allFiles.length}개`);

console.log('\n⏳ 추출 중...');
const allStrings = [];
for (let i = 0; i < allFiles.length; i++) {
  const file = allFiles[i];
  try {
    const strs = extractFile(file.fullPath);
    allStrings.push(...strs);
  } catch (e) {}
  if ((i + 1) % 200 === 0) {
    console.log(`  ⏩ ${i + 1}/${allFiles.length} (${(allStrings.length).toLocaleString()}개 문자열)`);
  }
}

console.log(`\n📊 추출 완료: ${allStrings.length}개 (전체)`);

// 중복 제거
const uniqueMap = new Map();
for (const item of allStrings) {
  if (!uniqueMap.has(item.key)) uniqueMap.set(item.key, item);
}
const unique = Array.from(uniqueMap.values());

console.log(`📊 중복 제거 후: ${unique.length}개`);

// 저장
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const outputPath = path.join(OUT, `${HASH}.json`);
fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');

// 통계
const korean = unique.filter(r => /[가-힣]/.test(r.value)).length;
const japanese = unique.filter(r => /[ぁ-ゟァ-ヺー]/.test(r.value)).length;
const chinese = unique.filter(r => /[一-龯]/.test(r.value)).length;
const english = unique.filter(r => /^[A-Za-z\s\-'.!?,;:()@]+$/i.test(r.value) && r.value.trim().split(/\s+/).length >= 1 && /[A-Za-z]{3,}/.test(r.value)).length;

console.log('\n=== ✅ 추출 완료 ===');
console.log(`파일: ${outputPath}`);
console.log(`총 문자열: ${unique.length}개`);
console.log(`🇰🇷 한글: ${korean}개`);
console.log(`🇯🇵 일본어: ${japanese}개`);
console.log(`🇨🇳 중국어: ${chinese}개`);
console.log(`🇺🇸 영어: ${english}개`);

console.log('\n=== 샘플 (처음 50개) ===');
unique.slice(0, 50).forEach((r, i) => {
  console.log(`${i + 1}. [${r.key}] "${r.value}"`);
});
if (unique.length > 50) console.log(`   ... 외 ${unique.length - 50}개`);
