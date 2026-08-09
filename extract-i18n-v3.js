/**
 * i18n 문자열 추출 스크립트 v3
 * 소스 코드에서 UI 문자열을 추출하여 JSON 파일로 저장
 * 키 형식: 소스루트폴더.서브폴더.하위폴더.파일명.확장자.소스line.(적용할 문자열을 최대한 그대로 i18n적용이 가능한 .를 제외한 문자열을 키)
 *
 * 개선된 필터링:
 * - Tailwind CSS 클래스 제외 (flex, bg-, text-, px-, py- 등)
 * - 설정 파일 제외 (playwright.config.ts, vite.config.ts 등)
 * - SVG path 데이터 제외
 * - 코드 식별자 제외 (UI 키워드가 아닌 단일 영단어)
 * - 이미 i18n 처리된 라인 제외
 */

const fs = require('fs');
const path = require('path');

// 설정
const SOURCE_ROOT = '/Users/pro/work/multiai/buzz';
const OUTPUT_DIR = '/Users/pro/work/multiai/i18n/buzz';
const GIT_HASH = '5bf7867';

// 제외할 디렉토리
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.vscode', '.claude', '.github',
  'dist', 'build', '.next', '.output', 'coverage', '.turbo',
  'target', 'public', 'assets', 'icons', 'tests', '__tests__',
  'fixtures', 'mocks', 'e2e', 'playwright', '.turbo'
]);

// 확장자별 제외
const EXCLUDE_EXTENSIONS = new Set([
  '.json', '.toml', '.lock', '.css', '.scss', '.sass',
  '.html', '.md', '.mdx', '.yaml', '.yml', '.png', '.jpg', '.svg'
]);

// 소스 파일 확장자
const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.rs'
]);

// 설정/테스트 파일로 제외할 패턴
const EXCLUDE_FILE_PATTERNS = [
  /\.config\./,           // playwright.config.ts, tailwind.config.js 등
  /\.spec\./,             // 테스트 파일
  /\.test\./,             // 테스트 파일
  /^playwright\./,        // Playwright 관련
  /^vite\.config/,        // Vite 설정
  /^tailwind\.config/,    // Tailwind 설정
  /^postcss\.config/,     // PostCSS 설정
  /^biome\.config/,       // Biome 설정
  /^tsconfig/,            // TypeScript 설정
  /^\.d\.ts$/,            // 타입 선언 파일
  /^\.lock$/,             // lock 파일
  /^package\.json$/,      // 패키지 메타데이터
  /\/scripts\//,          // 스크립트 폴더
  /\/\.vscode\//,         // VSCode 설정
  /\/\.github\//,         // GitHub 설정
  /\/\.claude\//,         // Claude 설정
  /\/benchmarks\//,       // 벤치마크
  /\/examples\//,         // 예제
  /\/docs\//,             // 문서
  /\/migrations\//,       // DB 마이그레이션
  /\/schema\//            // 스키마 정의
];

// Tailwind CSS 클래스 접두사 (제외할 패턴)
const TAILWIND_PREFIXES = [
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
  'stroke-linejoin', 'vector-effect'
];

// SVG path 데이터 패턴 (제외)
const SVG_PATH_PATTERN = /^[MmLlHhVvCcSsQqTtAaZz][0-9.,\s\-+]+$/;

// 이메일, URL, 색상 코드 같은 기술 패턴 제외
const TECH_PATTERNS = [
  /^https?:\/\//,              // URL
  /^mailto:/,                  // 이메일 링크
  /^#?([0-9a-fA-F]{3,8})$/,   // CSS 색상 코드
  /^[a-f0-9]{8,}$/i,          // 긴 hex 문자열
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}/,  // 날짜 패턴 (YYYY-MM-DD)
  /^[\d\s.,;:!?()\-+*/%&|^~<>{}[\]\\@#$`']*$/  // 숫자/기호만
];

// 이미 i18n 처리된 라인 패턴
const I18N_PATTERNS = [
  /\bt\s*\(/i,
  /useTranslation/i,
  /i18n\.(t|translate)/i,
  /intl\./i,
  /req\.t/i,
  /ctx\.t/i,
  /__\(/i,
  /defineMessages/i,
  /FormattedMessage/i,
  /<Trans\b/i
];

// import/export 문 패턴
const IMPORT_EXPORT_PATTERNS = [
  /^import\s+/,
  /^export\s+/,
  /^export\s*\{/,
  /^(import|export)\s+.+from/
];

// UI 키워드로 간주할 단어 리스트
const UI_KEYWORDS = new Set([
  // 액션 버튼
  'Save', 'Cancel', 'Submit', 'Submit', 'Create', 'Update', 'Delete', 'Remove', 'Add', 'Edit',
  'Send', 'Clear', 'Copy', 'Paste', 'Cut', 'Select', 'Deselect', 'Search', 'Filter',
  'Sort', 'Upload', 'Download', 'Print', 'Share', 'Export', 'Import', 'Refresh', 'Retry',
  'Close', 'Open', 'New', 'Done', 'Finish', 'Next', 'Previous', 'Back', 'Continue',
  'Skip', 'Later', 'More', 'Less', 'All', 'None', 'Any', 'Some', 'Every',
  'Show', 'Hide', 'View', 'Expand', 'Collapse', 'Minimize', 'Maximize', 'Restore',
  'Enable', 'Disable', 'Turn', 'On', 'Off', 'Activate', 'Deactivate',
  'Agree', 'Disagree', 'Accept', 'Decline', 'Confirm', 'Cancel',
  'Approve', 'Reject', 'Block', 'Unblock', 'Mute', 'Unmute',
  'Pin', 'Unpin', 'Star', 'Unstar', 'Follow', 'Unfollow',
  'Subscribe', 'Unsubscribe', 'Join', 'Leave',
  'Start', 'Stop', 'Pause', 'Resume', 'Play', 'Record',
  'Attach', 'Link', 'Unlink', 'Connect', 'Disconnect',
  'Invite', 'Request', 'Approve', 'Reject',
  'Report', 'Flag', 'Spam', 'Abuse', 'Harassment',
  'Help', 'Support', 'Feedback', 'Suggestion', 'Complaint',
  'Login', 'Logout', 'Sign', 'Register', 'Subscribe', 'Unsubscribe',
  'Check', 'Uncheck', 'Toggle', 'Switch', 'Change', 'Choose', 'Pick', 'Select',
  'Search', 'Find', 'Look', 'Query', 'Result',
  // 상태/피드백
  'Loading', 'Processing', 'Complete', 'Progress', 'Waiting', 'Queued',
  'Success', 'Error', 'Failed', 'Warning', 'Danger', 'Alert', 'Notice', 'Info',
  'Done', 'OK', 'Yes', 'No', 'True', 'False',
  'Online', 'Offline', 'Away', 'Busy', 'Idle', 'Disturb',
  'Active', 'Inactive', 'Pending', 'Closed', 'Open', 'Locked', 'Unlocked',
  'Enabled', 'Disabled', 'Visible', 'Hidden', 'Public', 'Private', 'Shared',
  // 내비게이션/레이아웃
  'Home', 'Feed', 'Inbox', 'Outbox', 'Drafts', 'Sent', 'Archive', 'Trash',
  'Profile', 'Settings', 'Account', 'Notifications', 'Privacy', 'Security',
  'Billing', 'Subscription', 'Plan', 'Upgrade', 'Downgrade',
  'Free', 'Premium', 'Pro', 'Enterprise', 'Team', 'Business',
  'Basic', 'Standard', 'Advanced', 'Custom',
  'Activity', 'History', 'Log', 'Logs', 'Dashboard',
  'Library', 'Favorites', 'Bookmarks', 'Files', 'Media', 'Images', 'Videos',
  'Chat', 'Messages', 'Threads', 'Channels', 'Rooms', 'Conversations',
  'Contacts', 'Friends', 'Followers', 'Following', 'Members', 'Users',
  'Team', 'Workspace', 'Organization', 'Group', 'Community',
  // 콘텐츠
  'Post', 'Comment', 'Reply', 'Quote', 'Mention', 'Tag', 'Hashtag',
  'Emoji', 'Reaction', 'Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry',
  'Title', 'Description', 'Content', 'Summary', 'Detail',
  'Name', 'Username', 'Email', 'Password', 'Phone', 'Address', 'Website',
  'Avatar', 'Icon', 'Image', 'Video', 'Audio', 'File', 'Document',
  'Subject', 'Body', 'From', 'To', 'Cc', 'Bcc', 'Reply-To',
  'Date', 'Time', 'Created', 'Updated', 'Deleted', 'Modified',
  'Category', 'Type', 'Status', 'Priority', 'Label', 'Tags',
  'Language', 'Region', 'Timezone', 'Currency', 'Country', 'State', 'City',
  // 요일/월
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
  'Week', 'Month', 'Year', 'Day', 'Hour', 'Minute', 'Second',
  'Morning', 'Afternoon', 'Evening', 'Night',
  'Today', 'Yesterday', 'Tomorrow', 'Now', 'Later', 'Soon', 'Earlier',
  'Weekday', 'Weekend',
  // 시간대
  'AM', 'PM', 'UTC', 'GMT',
  // 이모지/감정
  'Congratulations', 'Achievement', 'Award', 'Badge', 'Level', 'Point', 'Score', 'Rank',
  'Greeting', 'Welcome', 'Hello', 'Hi', 'Thanks', 'Sorry',
  'Hello', 'Goodbye', 'See you', 'Later',
  // 멘션/알림
  'You', 'Your', 'Yours', 'Mine', 'Me', 'I', 'We', 'Our', 'Us',
  'Mention', 'Mentions', '@', 'Notification', 'Notifications',
  'New', 'Updates', 'Activity', 'Changes'
]);

/**
 * 파일이 제외 대상인지 확인
 */
function shouldExcludeFile(filePath, fileName) {
  // 확장자로 제외
  const ext = path.extname(filePath).toLowerCase();
  if (EXCLUDE_EXTENSIONS.has(ext)) return true;

  // 소스 파일 확장자가 아니면 제외
  if (!SOURCE_EXTENSIONS.has(ext)) return true;

  // 파일 경로 패턴으로 제외
  for (const pattern of EXCLUDE_FILE_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }

  return false;
}

/**
 * 폴더가 제외 대상인지 확인
 */
function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.has(dirName);
}

/**
 * 상대 경로에서 소스 루트 폴더 추출
 */
function getSourceRoot(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts[0]; // 첫 번째 디렉토리가 소스 루트
}

/**
 * i18n 키 생성
 * 형식: 소스루트폴더.서브폴더.하위폴더.파일명.확장자.소스line.(적용할 문자열을 최대한 그대로 i18n적용이 가능한 .를 제외한 문자열을 키)
 */
function createKey(relativePath, fileName, lineNumber, text) {
  const parts = relativePath.split(path.sep);
  const sourceRoot = parts[0];
  const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

  // 텍스트를 키 형태로 변환 (특수문자 제거, 점/공백을 언더스코어로)
  const sanitized = text
    .replace(/[^a-zA-Z0-9가-힣ぁ-ゟァ-ヺー一-龯々〆ヽヾ\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);  // 너무 길면 자르기

  const keySuffix = sanitized || `line${lineNumber}`;

  // 키 조합: 소스루트.서브폴더들.파일명.line.텍스트
  const keyParts = [sourceRoot];
  parts.slice(1).forEach(part => {
    if (!EXCLUDE_DIRS.has(part)) {
      keyParts.push(part);
    }
  });
  keyParts.push(fileNameWithoutExt);
  keyParts.push(String(lineNumber));
  keyParts.push(keySuffix);

  return keyParts.join('.');
}

/**
 * 문자열이 UI 텍스트인지 판별
 */
function isLikelyUIText(text) {
  if (!text || !text.trim()) return false;

  const trimmed = text.trim();

  // 1자 이하 제외
  if (trimmed.length <= 1) return false;

  // 한글/일본어/중국어 포함 시 UI 텍스트로 간주
  if (/[가-힣]/.test(trimmed)) return true;
  if (/[ぁ-ゟァ-ヺー]/.test(trimmed)) return true;
  if (/[一-龯]/.test(trimmed)) return true;

  // 기술 패턴 제외 (URL, 색상코드 등)
  for (const pattern of TECH_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // SVG path 데이터 제외
  if (SVG_PATH_PATTERN.test(trimmed) && trimmed.length > 10) return false;

  // Tailwind CSS 클래스 제외
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
  if (TAILWIND_PREFIXES.some(prefix => firstWord.startsWith(prefix))) {
    return false;
  }

  // 영문 텍스트 처리
  if (/^[A-Za-z\s\-'.!?,;:()@]+$/.test(trimmed)) {
    const wordCount = trimmed.split(/\s+/).length;
    const lowerText = trimmed.toLowerCase();

    // 2단어 이상의 자연스러운 영문 문구인 경우 UI 텍스트로 간주
    if (wordCount >= 2 && trimmed.length >= 5) {
      // 너무 짧은 구절 제외
      if (trimmed.length < 4) return false;
      return true;
    }

    // 단일 단어인 경우 UI 키워드인지 확인
    if (wordCount === 1) {
      // 대소문자 혼합이나 특별한 패턴이 아니면 키워드로 판단
      if (UI_KEYWORDS.has(trimmed)) return true;
      if (UI_KEYWORDS.has(trimmed.toLowerCase().charAt(0).toUpperCase() + trimmed.toLowerCase().slice(1))) {
        return true;
      }
      // 단일 영단어는 대부분 코드 식별자이므로 제외 (UI 키워드 제외)
      return false;
    }

    return false;
  }

  // 이모지만 있는 경우 제외
  if (/^[\p{Emoji}\s]+$/u.test(trimmed) && trimmed.length > 3) return false;

  // 일반 텍스트 패턴에 매칭되지 않으면 제외
  return false;
}

/**
 * 파일이 이미 i18n 처리되었는지 확인
 */
function isAlreadyI18nLine(line) {
  return I18N_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * import/export 문인지 확인
 */
function isImportExportLine(line) {
  return IMPORT_EXPORT_PATTERNS.some(pattern => pattern.test(line.trim()));
}

/**
 * 디렉토리 재귀적으로 탐색
 */
function walkDir(dirPath, relativePath = '') {
  const files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const currentRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (!shouldExcludeDir(entry.name)) {
          files.push(...walkDir(fullPath, currentRelativePath));
        }
      } else if (entry.isFile()) {
        if (!shouldExcludeFile(fullPath, entry.name)) {
          files.push({
            fullPath,
            fileName: entry.name,
            relativePath: currentRelativePath
          });
        }
      }
    }
  } catch (err) {
    console.error(`디렉토리 읽기 오류: ${dirPath} - ${err.message}`);
  }

  return files;
}

/**
 * 파일에서 문자열 추출
 */
function extractStringsFromFile(fileInfo) {
  const strings = [];
  const content = fs.readFileSync(fileInfo.fullPath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const trimmedLine = line.trim();

    // 이미 i18n 처리된 라인 스킵
    if (isAlreadyI18nLine(trimmedLine)) continue;

    // import/export 문 스킵
    if (isImportExportLine(trimmedLine)) continue;

    // 빈 줄이나 주석만 있는 줄 스킵
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      continue;
    }

    // 따옴표로 묶인 문자열 추출
    const candidates = [];

    // 큰따옴표 문자열
    let match;
    const dqRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    dqRegex.lastIndex = 0;
    while ((match = dqRegex.exec(trimmedLine)) !== null) {
      const content = match[1];
      if (content && isLikelyUIText(content)) {
        candidates.push(content);
      }
    }

    // 작은따옴표 문자열
    const sqRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
    sqRegex.lastIndex = 0;
    while ((match = sqRegex.exec(trimmedLine)) !== null) {
      const content = match[1];
      if (content && isLikelyUIText(content)) {
        candidates.push(content);
      }
    }

    // 템플릿 리터럴 (변수가 없는 단순 텍스트만)
    const tmplRegex = /`([^`\\]*?)`/g;
    tmplRegex.lastIndex = 0;
    while ((match = tmplRegex.exec(trimmedLine)) !== null) {
      const content = match[1];
      if (content && !content.includes('{') && !content.includes('}') &&
          !content.includes('$') && isLikelyUIText(content)) {
        candidates.push(content);
      }
    }

    // JSX 텍스트 콘텐츠 (>text< 패턴)
    const jsxTextRegex = />([^<>{}]+)</g;
    jsxTextRegex.lastIndex = 0;
    while ((match = jsxTextRegex.exec(trimmedLine)) !== null) {
      const text = match[1].trim();
      if (text && text.length >= 2 && isLikelyUIText(text)) {
        candidates.push(text);
      }
    }

    // 특정 JSX 속성 값 추출
    const attrPatterns = [
      /aria-label=["']([^"']+)["']/i,
      /aria-labelledby=["']([^"']+)["']/i,
      /alt=["']([^"']+)["']/i,
      /title=["']([^"']+)["']/i,
      /placeholder=["']([^"']+)["']/i,
      /placeholder={"([^}]+)"}/,
      /label={"([^}]+)"}/,
      /value={"([^}]+)"}/,
      /children={"([^}]+)"}/,
      /children>([^<]+)</
    ];

    for (const attrPattern of attrPatterns) {
      let attrMatch;
      attrPattern.lastIndex = 0;
      while ((attrMatch = attrPattern.exec(trimmedLine)) !== null) {
        const content = attrMatch[1] || attrMatch[2] || '';
        if (content && isLikelyUIText(content)) {
          candidates.push(content);
        }
      }
    }

    // 중복 제거하고 결과 추가
    [...new Set(candidates)].forEach(str => {
      const key = createKey(
        fileInfo.relativePath,
        fileInfo.fileName,
        lineNumber,
        str
      );

      const existingKey = strings.find(s => s.key === key);
      if (!existingKey) {
        strings.push({ key, value: str });
      }
    });
  }

  return strings;
}

/**
 * 메인 함수
 */
function main() {
  console.log('=== i18n 문자열 추출 시작 (v3) ===');
  console.log(`소스 루트: ${SOURCE_ROOT}`);
  console.log(`출력 디렉토리: ${OUTPUT_DIR}`);
  console.log(`Git Hash: ${GIT_HASH}`);
  console.log('');

  // 소스 파일 수집
  console.log('소스 파일 수집 중...');
  let allFiles = [];

  // 주요 소스 폴더 스캔
  const sourceLibs = ['web', 'admin-web', 'desktop', 'mobile', 'crates', 'script'];
  for (const lib of sourceLibs) {
    const libPath = path.join(SOURCE_ROOT, lib);
    if (fs.existsSync(libPath)) {
      console.log(`  📂 ${lib} 폴더 스캔 중...`);
      const files = walkDir(libPath, lib);
      allFiles = allFiles.concat(files);
      console.log(`    발견: ${files.length}개 파일`);
    } else {
      console.log(`  ⏭️  ${lib} 폴더 없음 (스킵)`);
    }
  }

  console.log(`\n📄 전체 파일: ${allFiles.length}개`);

  // 문자열 추출
  console.log('\n⏳ 문자열 추출 중...');
  let processedCount = 0;
  const extractedStrings = new Map(); // 중복 제거용 Map

  for (const file of allFiles) {
    processedCount++;

    if (processedCount % 200 === 0) {
      console.log(`  처리 중: ${processedCount}/${allFiles.length} 파일`);
    }

    try {
      const strings = extractStringsFromFile(file);

      for (const str of strings) {
        if (!extractedStrings.has(str.key)) {
          extractedStrings.set(str.key, str);
        }
      }
    } catch (err) {
      console.error(`  ❌ ${file.relativePath}: ${err.message}`);
    }
  }

  console.log(`  ✅ 완료: ${allFiles.length}개 파일 처리`);
  console.log(`  📊 추출 문자열: ${extractedStrings.size}개`);

  // 결과 JSON 생성
  const result = Array.from(extractedStrings.values()).map(item => ({
    key: item.key,
    value: item.value
  }));

  // 출력 디렉토리 생성 및 파일 저장
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, `${GIT_HASH}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  // 통계 계산
  const koreanCount = result.filter(r => /[가-힣]/.test(r.value)).length;
  const japaneseCount = result.filter(r => /[ぁ-ゟァ-ヺー]/.test(r.value)).length;
  const chineseCount = result.filter(r => /[一-龯]/.test(r.value)).length;
  const englishCount = result.filter(
    r => /[A-Za-z]{3,}/.test(r.value) &&
         !/[가-힣ぁ-ゟァ-ヺー一-龯]/.test(r.value)
  ).length;

  console.log('\n=== ✅ 추출 완료 ===');
  console.log(`파일 저장: ${outputPath}`);
  console.log(`총 문자열: ${result.length}개`);
  console.log(`  🇰🇷 한글: ${koreanCount}개`);
  console.log(`  🇯🇵 일본어: ${japaneseCount}개`);
  console.log(`  🇨🇳 중국어: ${chineseCount}개`);
  console.log(`  🇺🇸 영어: ${englishCount}개`);

  // 샘플 출력 (처음 30개)
  console.log('\n=== 샘플 (처음 30개) ===');
  result.slice(0, 30).forEach((item, index) => {
    console.log(`${index + 1}. [${item.key}]`);
    console.log(`   "${item.value}"`);
  });

  if (result.length > 30) {
    console.log(`   ... 외 ${result.length - 30}개`);
  }

  return result;
}

main();
