const fs = require('fs');
const path = require('path');

const ROOT = '/Users/pro/work/multiai/buzz';
const OUT = '/Users/pro/work/multiai/i18n/buzz';
const HASH = '5bf7867';

// 한글/일본어/중국어 포함 시 항상 포함
// 영문은 2단어 이상 구절이거나 UI 키워드일 때만
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
  'List','Grid','Table','Calendar','Map','List','Grid',
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
  'Progress','Complete','Processing','Waiting','Queued',
  'Today','Yesterday','Tomorrow','Week','Month','Year',
  'Hour','Minute','Second','Now','First','Last','All','None','Any',
  'Always','Never','Home','Feed','Inbox','Drafts','Sent',
  'Notifications','Billing','Subscription','Plan','Upgrade',
  'Free','Premium','Pro','Enterprise','Business',
  'Basic','Standard','Advanced',
  'Congratulations','Achievement','Award','Badge',
  'Warning','Caution','Notice','Info',
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

const TAILWIND = new Set([
  'flex','grid','block','inline','hidden','visible',
  'text-','font-','leading-','tracking-','whitespace-',
  'bg-','bg-gradient-to','from-','via-','to-',
  'border-','rounded-','shadow-','opacity-',
  'p-','px-','py-','pt-','pb-','pl-','pr-',
  'm-','mx-','my-','mt-','mb-','ml-','mr-',
  'w-','h-','min-w-','min-h-','max-w-','max-h-',
  'space-','gap-','divide-','overflow-','cursor-',
  'select-','z-','align-','justify-','flex-','order-',
  'shrink-','grow-','basis-','aspect-','size-',
  'top-','right-','bottom-','left-','inset-',
  'translate-','rotate-','scale-','skew-',
  'transition-','duration-','delay-','ease-',
  'animate-','transform-','origin-',
  'scroll-','touch-','resize-','object-',
  'fill-','stroke-','stroke-width','stroke-linecap',
  'stroke-linejoin','vector-effect',
  'sr-only','not-sr-only','pointer-events',
  'relative','absolute','fixed','sticky','static',
  'inset','float','clear','table','table-row','table-cell',
  'list','list-item','contents','group','column',
  'auto','none','full','screen'
]);

function isTailwindClass(str) {
  const first = str.split(/\s+/)[0].toLowerCase();
  if (TAILWIND.has(first)) return true;
  for (const p of TAILWIND) {
    if (first.startsWith(p)) return true;
  }
  return false;
}

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
  if (/^[\d\s.,;:!?()\-+*\/%&|^~<>{}[\]\\@#$`']*$/i.test(t)) return false;

  // SVG path 제외
  if (/^[MmLlHhVvCcSsQqTtAaZz][\d.,\s\-+]+$/.test(t) && t.length > 10) return false;

  // Tailwind 클래스 제외
  if (isTailwindClass(t)) return false;

  // 영문 텍스트
  if (/^[A-Za-z\s\-'.!?,;:()@]+$/.test(t)) {
    const words = t.split(/\s+/);
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
  const parts = relPath.split(path.sep);
  const root = parts[0];
  const fname = path.basename(fileName, path.extname(fileName));
  const sanitized = text
    .replace(/[^a-zA-Z0-9가-힣ぁ-ゟァ-ヺー一-龯々〆ヽヾ\-_]/g, '_')
    .replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100);
  const suffix = sanitized || `line${lineNum}`;
  const keyParts = [root];
  parts.slice(1).forEach(p => {
    if (!['node_modules','.git','.vscode','.claude','.github','dist','build','target','public','tests','__tests__','fixtures','mocks','e2e','playwright','.turbo'].includes(p)) {
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
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    // 이미 i18n 처리된 라인 제외
    if (/\b(?:t\s*\(|useTranslation|i18n\.t|i18n\.translate|intl\.|req\.t|ctx\.t|__\(|defineMessages|FormattedMessage|<Trans\b)/i.test(trimmed)) continue;
    // import/export 제외
    if (/^(?:import|export)\s+/.test(trimmed)) continue;

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
      /label={"([^}]+)"}/, /value={"([^}]+)"}/, /children={"([^}]+)"}/
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

console.log('=== i18n 추출 시작 (Fast v2) ===');
console.log(`Git Hash: ${HASH}`);

// 주요 소스 폴더만 스캔 (web/src, admin-web/src, desktop/src)
const SRC_DIRS = [
  path.join(ROOT, 'web/src'),
  path.join(ROOT, 'admin-web/src'),
  path.join(ROOT, 'desktop/src')
];

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.vscode', '.claude', '.github', 'dist', 'build', 'target', 'public', 'tests', '__tests__', 'fixtures', 'mocks', 'e2e', 'playwright', '.turbo']);

function collectFiles(dirPath, relPath) {
  const files = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const rel = relPath ? `${relPath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          files.push(...collectFiles(fullPath, rel));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts','.tsx','.js','.jsx','.vue','.svelte','.rs'].includes(ext)) {
          // 설정 파일 제외
          if (/\.config\./.test(fullPath)) continue;
          if (/\.spec\./.test(fullPath)) continue;
          if (/\.test\./.test(fullPath)) continue;
          if (/playwright/.test(fullPath)) continue;
          if (/vite\.config/.test(fullPath)) continue;
          if (/tailwind\.config/.test(fullPath)) continue;
          if (/postcss\.config/.test(fullPath)) continue;
          if (/biome\.config/.test(fullPath)) continue;
          if (/tsconfig/.test(fullPath)) continue;
          if (/\.d\.ts$/.test(fullPath)) continue;
          files.push({ fullPath, relativePath: rel });
        }
      }
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

console.log(`📄 스캔 대상 파일: ${allFiles.length}개`);

console.log('\n⏳ 추출 중...');
const allStrings = [];
for (let i = 0; i < allFiles.length; i++) {
  const file = allFiles[i];
  try {
    const strs = extractFile(file.fullPath);
    allStrings.push(...strs);
  } catch (e) {}
  if ((i + 1) % 100 === 0) console.log(`  ⏩ ${i + 1}/${allFiles.length} (${(allStrings.length).toLocaleString()}개 문자열)`);
}

console.log(`\n📊 추출 완료: ${allStrings.length}개`);

// 중복 제거
const uniqueMap = new Map();
for (const item of allStrings) {
  if (!uniqueMap.has(item.key)) uniqueMap.set(item.key, item);
}
const unique = Array.from(uniqueMap.values());

// 저장
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const outputPath = path.join(OUT, `${HASH}.json`);
fs.writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8');

const korean = unique.filter(r => /[가-힣]/.test(r.value)).length;
const japanese = unique.filter(r => /[ぁ-ゟァ-ヺー]/.test(r.value)).length;
const chinese = unique.filter(r => /[一-龯]/.test(r.value)).length;
const english = unique.filter(r => /[A-Za-z]{3,}/.test(r.value) && !/[가-힣ぁ-ゟァ-ヺー一-龯]/.test(r.value)).length;

console.log('\n=== ✅ 추출 완료 ===');
console.log(`파일: ${outputPath}`);
console.log(`총 문자열: ${unique.length}개`);
console.log(`🇰🇷 한글: ${korean}개`);
console.log(`🇯🇵 일본어: ${japanese}개`);
console.log(`🇨🇳 중국어: ${chinese}개`);
console.log(`🇺🇸 영어: ${english}개`);

console.log('\n=== 샘플 (처음 30개) ===');
unique.slice(0, 30).forEach((r, i) => {
  console.log(`${i + 1}. [${r.key}] "${r.value}"`);
});
if (unique.length > 30) console.log(`   ... 외 ${unique.length - 30}개`);
