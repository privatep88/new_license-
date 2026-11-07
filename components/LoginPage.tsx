import React, { useState } from 'react';
import { OFFICIAL_LOGO_PATH } from './OfficialLogo';
import {
  AuthUserSession,
  verifyUserCredentials,
  getRememberedUsername,
  updateAccountPasswordDigest,
} from '../auth';
import { ADMIN_EMAIL } from '../constants';

interface LoginPageProps {
  onLoginSuccess: (session: AuthUserSession) => void;
}

const UserOutlineIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockOutlineIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LoginEnterIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>(() => getRememberedUsername());
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(getRememberedUsername()));

  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [recoveryUser, setRecoveryUser] = useState<string>('user');
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [recoveryNewPass, setRecoveryNewPass] = useState<string>('');
  const [recoveryFeedback, setRecoveryFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');

    let hasValidationError = false;
    if (!username.trim()) {
      setUsernameError('يرجى إدخال اسم المستخدم | Please enter your username');
      hasValidationError = true;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('يرجى إدخال كلمة المرور | Please enter your password');
      hasValidationError = true;
    } else {
      setPasswordError('');
    }

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyUserCredentials(username, password, rememberMe);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setAuthError(
          'بيانات الدخول غير صحيحة. يرجى التحقق والمحاولة مرة أخرى | Invalid username or password'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = [
      ADMIN_EMAIL.toLowerCase(),
      'logistic@saher.ae',
      'admin@saaed.ae',
      'mr.aljefre@gmail.com',
    ];
    if (
      !recoveryUser.trim() ||
      !validEmails.includes(recoveryEmail.trim().toLowerCase()) ||
      recoveryNewPass.length < 4
    ) {
      setRecoveryFeedback({
        type: 'error',
        message:
          'يرجى التأكد من إدخال البريد الإلكتروني المعتمد وكلمة مرور لا تقل عن 4 أحرف | Please enter a valid administrator email and password.',
      });
      return;
    }

    const updated = await updateAccountPasswordDigest(recoveryUser, recoveryNewPass);
    if (updated) {
      setRecoveryFeedback({
        type: 'success',
        message:
          'تم تحديث كلمة المرور بنجاح وتشفيرها. يمكنك الآن تسجيل الدخول | Password updated successfully.',
      });
      setUsername(recoveryUser.trim());
      setPassword('');
    } else {
      setRecoveryFeedback({
        type: 'error',
        message: 'تعذر تحديث كلمة المرور | Could not update password.',
      });
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#061838] text-white flex flex-col justify-between relative overflow-x-hidden select-none"
    >
      {/* Full Desktop Visual Backdrop (Matching Master Reference Image 1:1) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="./assets/aistudio/login_full_backdrop.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-left-bottom"
        />
      </div>

      {/* Main Content Area: Split Layout Matching Reference Proportions */}
      <div className="relative z-10 flex-grow w-full max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-4 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 lg:gap-8">
        
        {/* Login Card Panel — Positioned on Right in RTL */}
        <div className="w-full max-w-[540px] lg:w-[41%] xl:w-[565px] flex-shrink-0 flex flex-col justify-center order-1">
          <div className="bg-white text-slate-900 rounded-[28px] shadow-[0_24px_65px_rgba(2,12,32,0.65)] border border-white/90 overflow-hidden flex flex-col justify-between min-h-[620px] sm:min-h-[680px] lg:min-h-[760px]">
            
            {/* Upper & Middle Card Body */}
            <div className="px-6 sm:px-10 md:px-12 pt-7 sm:pt-9 pb-2 flex flex-col">
              
              {/* Official SAAED Logo (Original File, Untouched Proportions & Colors) */}
              <div className="flex justify-center my-2 sm:my-3">
                <img
                  src={OFFICIAL_LOGO_PATH}
                  alt="شعار ساعد الرسمي - SAAED Official Logo"
                  className="h-16 sm:h-20 md:h-[86px] w-auto object-contain block select-none"
                  draggable={false}
                />
              </div>

              {/* Welcome Heading & System Subtitle (Bilingual Arabic + English Side-by-Side) */}
              <div className="text-center mt-2 mb-6 sm:mb-7 select-text space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2241] tracking-tight leading-snug flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                  <span>مرحبًا بك في منصة ساعد</span>
                  <span className="text-[#eab308] font-normal">|</span>
                  <span dir="ltr" className="text-base sm:text-xl font-bold text-[#153668]">
                    Welcome to SAAED Platform
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                  <span>نظام تسجيل الرخص التجارية والأنشطة والعقود</span>
                  <span className="text-slate-300">|</span>
                  <span dir="ltr" className="text-[11px] sm:text-xs font-medium text-slate-500">
                    Commercial Licenses, Activities &amp; Contracts System
                  </span>
                </p>
              </div>

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="saher-login-username"
                    className="flex items-center justify-start gap-2 text-xs sm:text-sm font-bold text-[#0b2241] mb-2 text-right"
                  >
                    <span>اسم المستخدم</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span dir="ltr" className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Username
                    </span>
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="saher-login-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (usernameError) setUsernameError('');
                        if (authError) setAuthError('');
                      }}
                      placeholder="أدخل اسم المستخدم | Enter username"
                      className={`w-full rounded-xl border ${
                        usernameError
                          ? 'border-red-500 bg-red-50/30 focus:ring-red-500/20 focus:border-red-600'
                          : 'border-slate-300 bg-[#f8fafc]/80 focus:bg-white focus:ring-[#073ea3]/20 focus:border-[#073ea3]'
                      } py-3 sm:py-3.5 pr-11 pl-4 text-right text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserOutlineIcon className="w-5 h-5" />
                    </div>
                  </div>
                  {usernameError && (
                    <p role="alert" className="text-xs font-bold text-red-600 mt-1.5 text-right">
                      {usernameError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="saher-login-password"
                    className="flex items-center justify-start gap-2 text-xs sm:text-sm font-bold text-[#0b2241] mb-2 text-right"
                  >
                    <span>كلمة المرور</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span dir="ltr" className="text-xs sm:text-[13px] font-semibold text-slate-600">
                      Password
                    </span>
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="saher-login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                        if (authError) setAuthError('');
                      }}
                      placeholder="أدخل كلمة المرور | Enter password"
                      className={`w-full rounded-xl border ${
                        passwordError
                          ? 'border-red-500 bg-red-50/30 focus:ring-red-500/20 focus:border-red-600'
                          : 'border-slate-300 bg-[#f8fafc]/80 focus:bg-white focus:ring-[#073ea3]/20 focus:border-[#073ea3]'
                      } py-3 sm:py-3.5 pr-11 pl-11 text-right text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                    {/* Lock Icon on Start Edge */}
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                      <LockOutlineIcon className="w-5 h-5" />
                    </div>

                    {/* Show / Hide Password Button on End Edge */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'إخفاء كلمة المرور | Hide password' : 'إظهار كلمة المرور | Show password'}
                      title={showPassword ? 'إخفاء كلمة المرور | Hide password' : 'إظهار كلمة المرور | Show password'}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-[#073ea3] transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p role="alert" className="text-xs font-bold text-red-600 mt-1.5 text-right">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Options Row: Remember Me & Forgot Password (Bilingual) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-slate-400 text-[#073ea3] focus:ring-[#073ea3] cursor-pointer"
                    />
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                      <span>تذكرني</span>
                      <span className="text-slate-300 font-normal">|</span>
                      <span dir="ltr" className="text-[11px] sm:text-xs font-semibold text-slate-600">
                        Remember Me
                      </span>
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryFeedback(null);
                      setShowRecoveryModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0b53cf] hover:text-[#052d7a] transition-colors cursor-pointer"
                  >
                    <span className="underline underline-offset-4">نسيت كلمة المرور؟</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span dir="ltr" className="text-[11px] sm:text-xs font-semibold underline underline-offset-4">
                      Forgot Password?
                    </span>
                  </button>
                </div>

                {/* Authentication Error Banner */}
                {authError && (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{authError}</span>
                  </div>
                )}

                {/* Primary Login Submit Button (Bilingual Arabic + English Side-by-Side) */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-b from-[#0b4ec7] via-[#073a9b] to-[#042870] hover:from-[#0e58dc] hover:to-[#063289] active:scale-[0.99] text-white font-extrabold text-base sm:text-lg shadow-[0_8px_22px_rgba(7,58,155,0.4)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span>جاري التحقق...</span>
                        <span className="text-white/50 font-light">|</span>
                        <span dir="ltr" className="text-sm sm:text-base font-bold">
                          Verifying...
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2.5">
                        <span>تسجيل الدخول</span>
                        <span className="text-white/50 font-light">|</span>
                        <span dir="ltr" className="text-sm sm:text-base font-bold">
                          Sign In
                        </span>
                      </span>
                    )}
                    <LoginEnterIcon className="w-5 h-5 rotate-180 flex-shrink-0" />
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Decorative Skyline & Blue/Gold Wave inside Card (From Reference) */}
            <div className="w-full mt-3 pointer-events-none select-none overflow-hidden">
              <img
                src="./assets/aistudio/login_card_bottom.png"
                alt=""
                aria-hidden="true"
                className="w-full h-24 sm:h-28 object-cover object-bottom block"
              />
            </div>
          </div>
        </div>

        {/* Hero Visual Section & Real HTML Titles (Left Side in RTL) */}
        <div className="w-full lg:w-[57%] flex-grow flex flex-col justify-between order-2">
          
          {/* Real Selectable HTML Titles Positioned Above the Visual Scene */}
          <div className="w-full pt-2 sm:pt-6 lg:pt-8 lg:pr-4 xl:pr-10 flex flex-col items-center lg:items-center text-center select-text">
            <div className="max-w-2xl w-full">
              <h2
                dir="rtl"
                className="text-xl sm:text-2xl md:text-3xl xl:text-[36px] font-extrabold text-white leading-[1.35] tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]"
              >
                <span className="block">منصة متكاملة لتسجيل ومتابعة</span>
                <span className="block mt-0.5">التراخيص التجارية والأنشطة والعقود</span>
              </h2>

              {/* Gold Horizontal Gradient Divider Line */}
              <div className="w-full max-w-[540px] mx-auto h-[2px] bg-gradient-to-r from-transparent via-[#eab308] to-transparent my-3 sm:my-4 opacity-95" />

              <p
                dir="ltr"
                className="text-xs sm:text-sm md:text-base xl:text-[18px] font-medium text-slate-100 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
              >
                <span className="block">Integrated Platform for Commercial Licenses,</span>
                <span className="block">Activities &amp; Contracts Registration and Monitoring</span>
              </p>
            </div>
          </div>

          {/* Mobile / Tablet Compact Visual Scene Preview (< lg screens) */}
          <div className="lg:hidden w-full mt-4 rounded-2xl overflow-hidden border border-[#eab308]/40 shadow-xl">
            <img
              src="./assets/aistudio/login_hero_scene.png"
              alt="منصة متكاملة لتسجيل ومتابعة التراخيص التجارية والأنشطة والعقود"
              className="w-full h-auto max-h-[340px] object-cover object-bottom block"
            />
          </div>

          {/* Spacer on Desktop so Titles sit in the exact upper-sky zone above the Desk Scene */}
          <div className="hidden lg:block flex-grow" />
        </div>

      </div>

      {/* Bottom Corporate Footer Matching Reference Image (Bilingual Arabic + English) */}
      <footer className="relative z-10 w-full py-3 px-4 text-center bg-gradient-to-r from-[#041026]/90 via-[#071c42]/90 to-[#041026]/90 border-t border-[#eab308]/25 select-text">
        <p className="text-xs sm:text-sm font-semibold text-white tracking-wide flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span dir="ltr">© 2026 SAAED</span>
          <span>—</span>
          <span>جميع الحقوق محفوظة</span>
          <span className="text-[#eab308]/80">|</span>
          <span dir="ltr">All Rights Reserved</span>
        </p>
      </footer>

      {/* Secure Account Recovery / Password Reset Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            dir="rtl"
            className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm sm:text-base font-extrabold text-[#0b2241]">
                استعادة الحساب | Account Recovery
              </h3>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              لإعادة تعيين كلمة المرور بشكل آمن، أدخل اسم المستخدم والبريد الإلكتروني المعتمد للإدارة لتعيين كلمة مرور جديدة مشفرة.
              <span dir="ltr" className="block text-[11px] text-slate-500 mt-1">
                Verify the authorized administrator email to set a new encrypted password.
              </span>
            </p>

            <form onSubmit={handleRecoverySubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المستخدم المعتمد | Authorized Username
                </label>
                <input
                  type="text"
                  value={recoveryUser}
                  onChange={(e) => setRecoveryUser(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#073ea3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني للإدارة | Administrator Email
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="Logistic@saher.ae"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#073ea3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة | New Password
                </label>
                <input
                  type="password"
                  value={recoveryNewPass}
                  onChange={(e) => setRecoveryNewPass(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#073ea3]"
                />
              </div>

              {recoveryFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    recoveryFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {recoveryFeedback.message}
                </div>
              )}

              <p className="text-[11px] text-slate-500 pt-1">
                أو تواصل مع مدير النظام | Contact Admin: Logistic@saher.ae
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  إغلاق | Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#073ea3] hover:bg-[#052d7a] text-xs font-bold text-white shadow cursor-pointer"
                >
                  تحديث كلمة المرور | Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
