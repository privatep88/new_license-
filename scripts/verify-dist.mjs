import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const AISTUDIO_ASSETS_DIR = path.join(ASSETS_DIR, 'aistudio');
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.png', '.webp', '.jpg', '.jpeg', '.svg']);

const REQUIRED_IMAGE_PREFIXES = [
  { prefix: 'saher_logo', dir: AISTUDIO_ASSETS_DIR, label: 'Official SAHER Logo' },
  { prefix: 'hero_slice', dir: AISTUDIO_ASSETS_DIR, label: 'Main Hero Visual' },
  { prefix: 'footer_skyline', dir: AISTUDIO_ASSETS_DIR, label: 'Footer Visual' },
  { prefix: 'login_full_backdrop', dir: AISTUDIO_ASSETS_DIR, label: 'Login Backdrop Visual' },
  { prefix: 'login_hero_scene', dir: AISTUDIO_ASSETS_DIR, label: 'Login Hero Scene' },
  { prefix: 'login_card_bottom', dir: AISTUDIO_ASSETS_DIR, label: 'Login Card Footer Visual' },
];

const errors = [];

function fail(message) {
  errors.push(message);
}

// 1. Verify dist directory and index.html
if (!fs.existsSync(DIST_DIR)) {
  fail('Missing build output directory: dist/');
}
if (!fs.existsSync(INDEX_HTML_PATH)) {
  fail('Missing production entry file: dist/index.html');
}

let indexHtml = '';
if (fs.existsSync(INDEX_HTML_PATH)) {
  const stat = fs.statSync(INDEX_HTML_PATH);
  if (stat.size === 0) {
    fail('dist/index.html is empty');
  } else {
    indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  }
}

// 2. Verify no Tailwind CDN or raw TSX entry in production HTML
if (indexHtml.includes('cdn.tailwindcss.com')) {
  fail('Production dist/index.html still references cdn.tailwindcss.com');
}
if (/src=["'][^"']*\.tsx["']/i.test(indexHtml)) {
  fail('Production dist/index.html references raw .tsx module script');
}

// 3. Verify compiled JS and CSS assets in dist/assets
let bundleContents = indexHtml;
if (!fs.existsSync(ASSETS_DIR)) {
  fail('Missing dist/assets directory');
} else {
  const topAssets = fs.readdirSync(ASSETS_DIR);
  const jsFiles = topAssets.filter((f) => f.endsWith('.js'));
  const cssFiles = topAssets.filter((f) => f.endsWith('.css'));

  if (jsFiles.length === 0) {
    fail('No compiled JavaScript bundle (.js) found in dist/assets');
  }
  if (cssFiles.length === 0) {
    fail('No compiled CSS bundle (.css) found in dist/assets');
  }

  for (const file of [...jsFiles, ...cssFiles]) {
    const fullPath = path.join(ASSETS_DIR, file);
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      fail(`Compiled bundle is empty: dist/assets/${file}`);
    }
    if (!indexHtml.includes(file)) {
      fail(`Compiled bundle is not referenced in dist/index.html: ${file}`);
    }
    if (file.endsWith('.js') || file.endsWith('.css')) {
      bundleContents += '\n' + fs.readFileSync(fullPath, 'utf8');
    }
  }
}

// 4. Verify required production image assets by prefix and valid extension (hash-independent)
for (const req of REQUIRED_IMAGE_PREFIXES) {
  if (!fs.existsSync(req.dir)) {
    fail(`Missing asset directory for "${req.prefix}": ${path.relative(process.cwd(), req.dir)}`);
    continue;
  }

  const files = fs.readdirSync(req.dir);
  const matching = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    return (
      ALLOWED_IMAGE_EXTENSIONS.has(ext) &&
      (base === req.prefix || base.startsWith(`${req.prefix}-`) || base.startsWith(`${req.prefix}_`))
    );
  });

  if (matching.length === 0) {
    fail(`Missing required production image asset with prefix "${req.prefix}" (${req.label})`);
    continue;
  }

  for (const matchedFile of matching) {
    const fullPath = path.join(req.dir, matchedFile);
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      fail(`Required production image asset is empty: ${path.relative(process.cwd(), fullPath)}`);
    }
  }

  const isReferenced = matching.some((matchedFile) => bundleContents.includes(matchedFile));
  if (!isReferenced) {
    fail(`Required production image asset with prefix "${req.prefix}" is not referenced in built production files`);
  }
}

if (errors.length > 0) {
  console.error('\nPOST-BUILD PRODUCTION VERIFICATION FAILED:\n');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error('');
  process.exit(1);
}

console.log('POST-BUILD VERIFICATION PASSED');
console.log(`Verified dist/index.html, JS/CSS bundles, and ${REQUIRED_IMAGE_PREFIXES.length} required SAHER image assets.`);
process.exit(0);
