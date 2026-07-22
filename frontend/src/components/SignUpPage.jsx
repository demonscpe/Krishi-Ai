import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.4 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.4 6.1 29 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z" />
  </svg>
);

const FieldIllustration = () => (
  <svg viewBox="0 0 600 660" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
    <circle cx="300" cy="150" r="90" fill="#FFF3D6" opacity="0.5" className="animate-pulse" />
    <circle cx="300" cy="150" r="52" fill="#FFEFC4" />
    <path d="M0 420 C120 380 220 400 330 380 C420 365 520 390 600 370 L600 660 L0 660 Z" fill="#2A6E45" />
    <path d="M0 470 C130 440 250 460 340 440 C440 420 520 450 600 430 L600 660 L0 660 Z" fill="#1F5E3E" />
    <path d="M0 530 C140 505 260 525 350 505 C450 485 530 510 600 495 L600 660 L0 660 Z" fill="#184C33" />
    <path d="M0 590 C150 570 280 585 360 570 C460 555 540 575 600 565 L600 660 L0 660 Z" fill="#123D28" />
    {[90, 160, 235, 360, 440, 510].map((x, i) => (
      <g key={x} style={{ transformOrigin: `${x}px 640px`, animation: "sway 3.6s ease-in-out infinite", animationDelay: `${i * 0.4}s` }}>
        <line x1={x} y1="643" x2={x} y2="578" stroke="#8B5E34" strokeWidth="3" />
        <ellipse cx={x} cy="576" rx="10" ry="18" fill={i % 2 === 0 ? "#E3A83B" : "#EDBB55"} />
      </g>
    ))}
  </svg>
);

const inputClass = "w-full px-[18px] py-3.5 rounded-[14px] border-[1.5px] border-[#E4D9C4] bg-[#F7F2E7] focus:bg-white focus:border-[#1F5E3E] focus:ring-4 focus:ring-[#1F5E3E]/10 outline-none transition-all text-[15px] text-[#241C14] placeholder:text-[#A79A83]";
const labelClass = "block text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#8B5E34] mb-1.5";

const ValidationItem = ({ label, met }) => (
  <div className="flex items-center gap-2 text-[12.5px]">
    <span className={`w-[16px] h-[16px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-colors ${met ? "bg-[#1F5E3E] text-white" : "bg-[#F7F2E7] border border-[#E4D9C4] text-transparent"}`}>
      <CheckIcon />
    </span>
    <span className={met ? "text-[#1F5E3E] font-medium" : "text-[#8A7C64]"}>{label}</span>
  </div>
);

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Invalid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [passValid, setPassValid] = useState({ lowerUpper: false, number: false, special: false, length: false });

  const handlePasswordChange = (val) => {
    setFormData({ ...formData, password: val });
    setPassValid({
      lowerUpper: /^(?=.*[a-z])(?=.*[A-Z])/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*]/.test(val),
      length: val.length >= 8,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName);
      setMessage("Account created! Redirecting…");
      setMessageType("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(FIREBASE_ERRORS[err.code] || "Signup failed. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setMessage("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setMessage(FIREBASE_ERRORS[err.code] || "Google sign-in failed.");
      setMessageType("error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2E7] p-6 lg:p-10 font-['Poppins']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @keyframes sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
      `}</style>

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-[#FFFDF9] rounded-[28px] shadow-[0_1px_2px_rgba(36,28,20,0.04),0_24px_60px_-24px_rgba(36,28,20,0.18)] border border-[#E4D9C4] overflow-hidden">

        <div className="p-8 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-8">
            <img src={krishiLogo} alt="Krishi AI" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-semibold text-[19px] text-[#241C14]">Krishi AI</span>
          </div>

          <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#8B5E34] mb-3">Create account</p>
          <h1 className="font-semibold text-[32px] md:text-[36px] leading-[1.15] tracking-tight text-[#163F2A] mb-2">
            Start your season right.
          </h1>
          <p className="text-[#5B5142] text-[14.5px] leading-relaxed mb-7 max-w-md">
            Join the growers already using <span className="font-semibold text-[#1F5E3E]">Krishi AI</span> to plan smarter, season after season.
          </p>

          {message && (
            <div className={`mb-5 px-4 py-3 rounded-[12px] text-[13.5px] font-medium border ${messageType === "success" ? "bg-[#E9F5EC] text-[#1F5E3E] border-[#BFE0CB]" : "bg-[#FDEDEA] text-[#B3401F] border-[#F3CFC4]"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First name</label>
                <input placeholder="John" className={inputClass} required onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input placeholder="Doe" className={inputClass} required onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" placeholder="you@farmname.com" className={inputClass} required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="relative">
              <label className={labelClass}>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={inputClass}
                required
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-[38px] text-[#241C14] opacity-45 hover:opacity-90 transition-opacity">
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-1">
              <ValidationItem label="Lowercase & uppercase" met={passValid.lowerUpper} />
              <ValidationItem label="A number (0-9)" met={passValid.number} />
              <ValidationItem label="Special character" met={passValid.special} />
              <ValidationItem label="At least 8 characters" met={passValid.length} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-1 rounded-[14px] font-bold text-white text-[16px] bg-gradient-to-br from-[#3F8F5F] to-[#1F5E3E] shadow-[0_10px_24px_-10px_rgba(22,63,42,0.55)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2.5"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              {isSubmitting ? "Creating account…" : "Create account securely"}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E4D9C4]"></span></div>
            <span className="relative px-4 bg-[#FFFDF9] text-[#5B5142] text-[12.5px]">or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3.5 border-[1.5px] border-[#E4D9C4] rounded-[14px] flex items-center justify-center gap-2.5 font-semibold text-[14.5px] text-[#241C14] hover:bg-[#F7F2E7] hover:border-[#8B5E34] transition-all disabled:opacity-70"
          >
            {googleLoading ? <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <p className="text-center text-[#5B5142] text-[14px] mt-8">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#1F5E3E] hover:underline">Log in</Link>
          </p>
        </div>

        <div className="hidden md:block relative overflow-hidden bg-gradient-to-b from-[#FFE3B8] via-[#F3A57E] to-[#1F5E3E]">
          <FieldIllustration />
          <div className="absolute top-11 left-10 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[230px] text-[13px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#E3A83B] flex-shrink-0" />
            Free for your first season
          </div>
          <div className="absolute top-[108px] right-8 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[190px] text-[12px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#3F8F5F] flex-shrink-0" />
            Set up takes under 2 minutes
          </div>
          <div className="absolute bottom-[108px] left-11 right-11 text-white">
            <h3 className="font-semibold text-[25px] leading-[1.28] mb-2 drop-shadow-sm">Every farm has a first season.</h3>
            <p className="text-[13.5px] opacity-85 max-w-[320px]">Connecting technology with the roots of agriculture — one field at a time.</p>
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

export default SignUpPage;
