export interface AuthUserSession {
  username: string;
  displayNameAr: string;
  displayNameEn: string;
  roleAr: string;
  roleEn: string;
  sessionToken: string;
  loginAt: string;
  expiresAt: string;
  rememberMe: boolean;
}

const SESSION_STORAGE_KEY = 'SAHER_ACTIVE_AUTH_SESSION_V1';
const REMEMBERED_USER_KEY = 'SAHER_REMEMBERED_USERNAME_V1';
const CUSTOM_DIGESTS_KEY = 'SAHER_CUSTOM_AUTH_DIGESTS_V1';
const LOGIN_LANG_KEY = 'SAHER_LOGIN_LANGUAGE_V1';
const AUTH_SALT = 'SAAED_SAHER_ENTERPRISE_SALT_2026::';

// Authorized user directory (no plain-text passwords stored)
interface AuthorizedAccount {
  usernames: string[];
  displayNameAr: string;
  displayNameEn: string;
  roleAr: string;
  roleEn: string;
  allowedPasswordDigests: string[];
}

const DEFAULT_ACCOUNTS: AuthorizedAccount[] = [
  {
    usernames: [
      'user',
      'admin',
      'saaed',
      'khalid',
      'خالد الهاشمي',
      'admin_saaed',
      'saaed_user',
      'admin@saaed.ae',
      'logistic@saher.ae',
      'mr.aljefre@gmail.com',
    ],
    displayNameAr: 'خالد الهاشمي',
    displayNameEn: 'Khalid Al Hashimi',
    roleAr: 'مدير النظام',
    roleEn: 'System Administrator',
    // Salted SHA-256 digests only (never plain-text passwords)
    // Primary digest bb4131ea... corresponds to password: "user"
    allowedPasswordDigests: [
      'bb4131ea385b8734d083a6fdaa2a6c70685e757d89a12dd7a4c0fa0c53c9aee0',
      '711c43fc6e05f51bbe6dce6ef843a066c9b4fa2f6a991a860e137bf97dff3e17',
      'edda3528b87b1d334dee0787ae8ad25771aad5f259ba24b7a4a10918ec84c7a6',
      '0f9e119d4e4bd8e42b34b40559f4dc19665cf3dccfe4b3f350a2f273704cbf86',
      '24b3ae917e542e9055e3ae2f07106f1180b74043e7f7b4172532370dca897b6b',
      'caf2a3c079f076439ae8d73483c473d4efa6c9037b70573b7e127ae851580242',
      '21943dc6795bbfd23307c71ec2bda09007c6c5068b87b4e13a527b989c6d0304',
      '31c67f31cdc13a1852a8341b1df3b29c5e52d31fd16c0402e3abc6166608b531',
      '0159e1e073ac900417238263f97cd0f1ab13e28240ecc446a4aaef6158b24247',
      '35b914f785869d92ff88409a598d3171184c605bf72fb0e0bf18c965921117a0',
    ],
  },
];

// Pure TypeScript SHA-256 implementation for environments where crypto.subtle is unavailable
function sha256Fallback(ascii: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words: number[] = [];
  const encoder = new TextEncoder();
  const bytes = encoder.encode(ascii);
  const bitLength = bytes.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / maxWord), false);

  for (let i = 0; i < paddedLength; i += 4) {
    words.push(view.getUint32(i, false));
  }

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
      void i2;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export async function computeSaltedDigest(password: string): Promise<string> {
  const payload = AUTH_SALT + password;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return sha256Fallback(payload);
    }
  }
  return sha256Fallback(payload);
}

function getCustomDigests(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_DIGESTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function updateAccountPasswordDigest(
  username: string,
  newPassword: string
): Promise<boolean> {
  const normalizedUser = username.trim().toLowerCase();
  if (!normalizedUser || newPassword.length < 4) return false;
  const digest = await computeSaltedDigest(newPassword);
  try {
    const current = getCustomDigests();
    current[normalizedUser] = digest;
    localStorage.setItem(CUSTOM_DIGESTS_KEY, JSON.stringify(current));
    return true;
  } catch {
    return false;
  }
}

export async function verifyUserCredentials(
  usernameInput: string,
  passwordInput: string,
  rememberMe: boolean
): Promise<{ success: boolean; session?: AuthUserSession; errorCode?: 'INVALID_CREDENTIALS' }> {
  const normalizedUsername = usernameInput.trim().toLowerCase();
  const digest = await computeSaltedDigest(passwordInput);

  // Check custom password digest if updated by administrator
  const customDigests = getCustomDigests();
  const customDigestForUser = customDigests[normalizedUsername];

  const matchedAccount = DEFAULT_ACCOUNTS.find((acc) =>
    acc.usernames.some((u) => u.toLowerCase() === normalizedUsername)
  );

  let isAuthenticated = false;
  let displayNameAr = 'خالد الهاشمي';
  let displayNameEn = 'Khalid Al Hashimi';
  let roleAr = 'مدير النظام';
  let roleEn = 'System Administrator';

  if (customDigestForUser && customDigestForUser === digest) {
    isAuthenticated = true;
    if (!matchedAccount) {
      displayNameAr = usernameInput.trim();
      displayNameEn = usernameInput.trim();
    }
  } else if (matchedAccount && matchedAccount.allowedPasswordDigests.includes(digest)) {
    isAuthenticated = true;
    displayNameAr = matchedAccount.displayNameAr;
    displayNameEn = matchedAccount.displayNameEn;
    roleAr = matchedAccount.roleAr;
    roleEn = matchedAccount.roleEn;
  }

  if (!isAuthenticated) {
    return { success: false, errorCode: 'INVALID_CREDENTIALS' };
  }

  const now = new Date();
  const expiryMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + expiryMs).toISOString();
  const tokenSeed = `${normalizedUsername}::${now.toISOString()}::${Math.random()}`;
  const sessionToken = await computeSaltedDigest(tokenSeed);

  const session: AuthUserSession = {
    username: usernameInput.trim(),
    displayNameAr,
    displayNameEn,
    roleAr,
    roleEn,
    sessionToken,
    loginAt: now.toISOString(),
    expiresAt,
    rememberMe,
  };

  try {
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_USER_KEY, usernameInput.trim());
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.removeItem(REMEMBERED_USER_KEY);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to persist session', e);
  }

  return { success: true, session };
}

export function getActiveSession(): AuthUserSession | null {
  try {
    const rawSession =
      sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return null;

    const session: AuthUserSession = JSON.parse(rawSession);
    if (!session.sessionToken || !session.expiresAt) return null;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearActiveSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearActiveSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}

export function getRememberedUsername(): string {
  try {
    return localStorage.getItem(REMEMBERED_USER_KEY) || '';
  } catch {
    return '';
  }
}

export function getSavedLoginLanguage(): 'ar' | 'en' {
  try {
    const saved = localStorage.getItem(LOGIN_LANG_KEY);
    return saved === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function saveLoginLanguage(lang: 'ar' | 'en'): void {
  try {
    localStorage.setItem(LOGIN_LANG_KEY, lang);
  } catch {
    // ignore storage errors
  }
}
