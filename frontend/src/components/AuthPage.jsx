import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import krishiLogo from "../assets/Krishi-logo.svg";
const EyeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
// Dawn-over-farmland illustration: layered crop rows + sun + swaying wheat.
const FieldIllustration = () => (
  <svg viewBox="0 0 600 660" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
    <circle cx="300" cy="150" r="90" fill="#FFF3D6" opacity="0.5" className="animate-pulse" />
    <circle cx="300" cy="150" r="52" fill="#FFEFC4" />

    <path d="M0 420 C120 380 220 400 330 380 C420 365 520 390 600 370 L600 660 L0 660 Z" fill="#2A6E45" />
    <path d="M0 470 C130 440 250 460 340 440 C440 420 520 450 600 430 L600 660 L0 660 Z" fill="#1F5E3E" />
    <path d="M0 530 C140 505 260 525 350 505 C450 485 530 510 600 495 L600 660 L0 660 Z" fill="#184C33" />
    <path d="M0 590 C150 570 280 585 360 570 C460 555 540 575 600 565 L600 660 L0 660 Z" fill="#123D28" />

    <g stroke="#F7F2E7" strokeOpacity="0.55" strokeWidth="1.4">
      <path d="M20 545 C120 525 240 542 340 522" />
      <path d="M-10 585 C110 565 260 582 380 562" />
    </g>

    {[90, 160, 235, 360, 440, 510].map((x, i) => (
      <g
        key={x}
        style={{
          transformOrigin: `${x}px 640px`,
          animation: "sway 3.6s ease-in-out infinite",
          animationDelay: `${i * 0.4}s`,
        }}
      >
        <line x1={x} y1="643" x2={x} y2="578" stroke="#8B5E34" strokeWidth="3" />
        <ellipse cx={x} cy="576" rx="10" ry="18" fill={i % 2 === 0 ? "#E3A83B" : "#EDBB55"} />
      </g>
    ))}
  </svg>
);

const inputClass =
  "w-full px-[18px] py-3.5 rounded-[14px] border-[1.5px] border-[#E4D9C4] bg-[#F7F2E7] focus:bg-white focus:border-[#1F5E3E] focus:ring-4 focus:ring-[#1F5E3E]/10 outline-none transition-all text-[15px] text-[#241C14] placeholder:text-[#A79A83]";

const labelClass = "block text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#8B5E34] mb-1.5";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithToken } = useAuth();

  const [isLowerUpper, setIsLowerUpper] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isSpecialChar, setIsSpecialChar] = useState(false);
  const [isMinLength, setIsMinLength] = useState(false);

  const validatePassword = (input) => {
    setPassword(input);

    const lowerUpper = /^(?=.*[a-z])(?=.*[A-Z])/;
    setIsLowerUpper(lowerUpper.test(input));

    const numberCheck = /^(?=.*[0-9])/;
    setIsNumber(numberCheck.test(input));

    const specialCharCheck = /^(?=.*[!@#$%^&*])/;
    setIsSpecialChar(specialCharCheck.test(input));

    setIsMinLength(input.length >= 8);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8080/api/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        confirmPassword: password,
      });
      setMessage(response.data.message);
      setMessageType("success");
      setIsSignUp(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8080/api/auth/signin", {
        email,
        password,
      });
      loginWithToken(response.data.accessToken);
      setMessage(response.data.message);
      setMessageType("success");
      setIsLoggedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  const switchTab = (toSignUp) => {
    setIsSignUp(toSignUp);
    setMessage("");
  };

  const requirements = [
    { met: isLowerUpper, label: "Lowercase & uppercase" },
    { met: isNumber, label: "A number (0-9)" },
    { met: isSpecialChar, label: "A special character (@!#$%^&*)" },
    { met: isMinLength, label: "At least 8 characters" },
  ];
  const allMet = isLowerUpper && isNumber && isSpecialChar && isMinLength;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2E7] p-6 lg:p-10 font-['Poppins']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @keyframes sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
      `}</style>

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-[#FFFDF9] rounded-[28px] shadow-[0_1px_2px_rgba(36,28,20,0.04),0_24px_60px_-24px_rgba(36,28,20,0.18)] border border-[#E4D9C4] overflow-hidden">

        {/* FORM SIDE */}
        <div className="p-8 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-8">
            <img src={krishiLogo} alt="Krishi AI" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-['Poppins'] font-semibold text-[19px] text-[#241C14]">Krishi AI</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[#F7F2E7] border border-[#E4D9C4] rounded-full p-1 mb-8">
            <button
              type="button"
              onClick={() => switchTab(false)}
              className={`w-1/2 py-2.5 rounded-full text-[13.5px] font-bold tracking-wide transition-all ${
                !isSignUp ? "bg-[#1F5E3E] text-white shadow-sm" : "text-[#5B5142] hover:text-[#241C14]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchTab(true)}
              className={`w-1/2 py-2.5 rounded-full text-[13.5px] font-bold tracking-wide transition-all ${
                isSignUp ? "bg-[#1F5E3E] text-white shadow-sm" : "text-[#5B5142] hover:text-[#241C14]"
              }`}
            >
              Sign up
            </button>
          </div>

          <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#8B5E34] mb-3">
            {isSignUp ? "Create account" : "Sign in"}
          </p>
          <h1 className="font-['Poppins'] font-semibold text-[32px] md:text-[36px] leading-[1.15] tracking-tight text-[#163F2A] mb-2">
            {isSignUp ? "Start your season right." : "Welcome back to the field."}
          </h1>
          <p className="text-[#5B5142] text-[14.5px] leading-relaxed mb-7 max-w-md">
            {isSignUp
              ? "Set up your account to track soil health, weather, and mandi prices in one place."
              : "Pick up right where you left off — your fields have been busy."}
          </p>

          {message && (
            <div
              className={`mb-5 px-4 py-3 rounded-[12px] text-[13.5px] font-medium border ${
                messageType === "success"
                  ? "bg-[#E9F5EC] text-[#1F5E3E] border-[#BFE0CB]"
                  : "bg-[#FDEDEA] text-[#B3401F] border-[#F3CFC4]"
              }`}
            >
              {message}
            </div>
          )}

          {/* ---------------- SIGN IN ---------------- */}
          {!isSignUp && (
            <form className="flex flex-col gap-3.5" onSubmit={handleSignIn}>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="you@farmname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <label className={labelClass}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-[#241C14] opacity-45 hover:opacity-90 transition-opacity"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-1 rounded-[14px] font-bold text-white text-[15.5px] bg-gradient-to-br from-[#3F8F5F] to-[#1F5E3E] shadow-[0_10px_24px_-10px_rgba(22,63,42,0.55)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2.5"
              >
                {isLoading && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                {isLoading ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-center text-[#5B5142] text-[13.5px] mt-2">
                Don't have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchTab(true); }} className="font-bold text-[#1F5E3E] hover:underline">
                  Sign up
                </a>
              </p>
            </form>
          )}

          {/* ---------------- SIGN UP ---------------- */}
          {isSignUp && (
            <form className="flex flex-col gap-3.5" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="you@farmname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <label className={labelClass}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-[#241C14] opacity-45 hover:opacity-90 transition-opacity"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2 text-[12.5px]">
                    <span
                      className={`w-[16px] h-[16px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-colors ${
                        req.met ? "bg-[#1F5E3E] text-white" : "bg-[#F7F2E7] border border-[#E4D9C4] text-transparent"
                      }`}
                    >
                      <CheckIcon />
                    </span>
                    <span className={req.met ? "text-[#1F5E3E] font-medium" : "text-[#8A7C64]"}>{req.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={!allMet || isLoading}
                className="w-full py-3.5 mt-1 rounded-[14px] font-bold text-white text-[15.5px] bg-gradient-to-br from-[#3F8F5F] to-[#1F5E3E] shadow-[0_10px_24px_-10px_rgba(22,63,42,0.55)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2.5"
              >
                {isLoading && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                {isLoading ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-[#5B5142] text-[13.5px] mt-2">
                Already have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchTab(false); }} className="font-bold text-[#1F5E3E] hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          )}
        </div>

        {/* ILLUSTRATION SIDE */}
        <div className="hidden md:block relative overflow-hidden bg-gradient-to-b from-[#FFE3B8] via-[#F3A57E] to-[#1F5E3E]">
          <FieldIllustration />

          <div className="absolute top-11 left-10 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[230px] text-[13px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#E3A83B] flex-shrink-0" />
            Soil moisture: optimal
          </div>
          <div className="absolute top-[108px] right-8 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[190px] text-[12px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#3F8F5F] flex-shrink-0" />
            Rain expected in 2 days
          </div>

          <div className="absolute bottom-[108px] left-11 right-11 text-white">
            <h3 className="font-['Poppins'] font-semibold text-[25px] leading-[1.28] mb-2 drop-shadow-sm">
              {isSignUp ? "Every farm has a first season." : "Every field tells a story."}
            </h3>
            <p className="text-[13.5px] opacity-85 max-w-[320px]">
              {isSignUp
                ? "Join the growers already using Krishi AI to plan smarter, season after season."
                : "Weather, soil, and market signals — brought together for the decisions that matter this season."}
            </p>
          </div>

          <div className="absolute bottom-8 left-11 right-11 flex items-center gap-2">
            <div className="flex-1 text-center py-2 rounded-[10px] text-[11px] font-bold tracking-[0.04em] bg-[#E3A83B] text-[#163F2A]">KHARIF</div>
            <div className="flex-1 text-center py-2 rounded-[10px] text-[11px] font-bold tracking-[0.04em] bg-white/10 text-white/55">RABI</div>
            <div className="flex-1 text-center py-2 rounded-[10px] text-[11px] font-bold tracking-[0.04em] bg-white/10 text-white/55">ZAID</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
