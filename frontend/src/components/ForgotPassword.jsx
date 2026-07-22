import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import krishiLogo from "../assets/Krishi-logo.svg";

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

const inputClass = "w-full px-[18px] py-4 rounded-[14px] border-[1.5px] border-[#E4D9C4] bg-[#F7F2E7] focus:bg-white focus:border-[#1F5E3E] focus:ring-4 focus:ring-[#1F5E3E]/10 outline-none transition-all text-[15px] text-[#241C14] placeholder:text-[#A79A83]";

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2E7] p-6 lg:p-10 font-['Poppins']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @keyframes sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
      `}</style>

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-[#FFFDF9] rounded-[28px] shadow-[0_1px_2px_rgba(36,28,20,0.04),0_24px_60px_-24px_rgba(36,28,20,0.18)] border border-[#E4D9C4] overflow-hidden">

        <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-10">
            <img src={krishiLogo} alt="Krishi AI" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-semibold text-[19px] text-[#241C14]">Krishi AI</span>
          </div>

          <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#8B5E34] mb-3">Account recovery</p>
          <h1 className="font-semibold text-[32px] md:text-[36px] leading-[1.15] tracking-tight text-[#163F2A] mb-2">
            {sent ? "Check your inbox." : "Forgot your password?"}
          </h1>
          <p className="text-[#5B5142] text-[14.5px] leading-relaxed mb-9 max-w-md">
            {sent
              ? `We've sent a password reset link to ${email}. Check your inbox and follow the link.`
              : "Enter the email tied to your account and we'll send you a reset link instantly."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="px-4 py-3 rounded-[12px] text-[13.5px] font-medium border bg-[#FDEDEA] text-[#B3401F] border-[#F3CFC4]">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#8B5E34] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@farmname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-[14px] font-bold text-white text-[16px] bg-gradient-to-br from-[#3F8F5F] to-[#1F5E3E] shadow-[0_10px_24px_-10px_rgba(22,63,42,0.55)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2.5"
              >
                {isLoading && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                {isLoading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="px-4 py-4 rounded-[14px] bg-[#E9F5EC] text-[#1F5E3E] border border-[#BFE0CB] text-[14px] font-medium">
                ✅ Reset link sent! Check your spam folder if you don't see it.
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[13.5px] font-semibold text-[#8B5E34] hover:underline text-left"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-9 text-center">
            <Link to="/login" className="text-[13.5px] font-bold text-[#1F5E3E] hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </div>

        <div className="hidden md:block relative overflow-hidden bg-gradient-to-b from-[#FFE3B8] via-[#F3A57E] to-[#1F5E3E]">
          <FieldIllustration />
          <div className="absolute top-11 left-10 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[230px] text-[13px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#E3A83B] flex-shrink-0" />
            Your data stays encrypted
          </div>
          <div className="absolute top-[108px] right-8 bg-[#FFFDF9]/90 backdrop-blur-sm rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2.5 max-w-[190px] text-[12px] font-semibold text-[#163F2A]">
            <span className="w-2 h-2 rounded-full bg-[#3F8F5F] flex-shrink-0" />
            Link expires in 1 hour
          </div>
          <div className="absolute bottom-[108px] left-11 right-11 text-white">
            <h3 className="font-semibold text-[25px] leading-[1.28] mb-2 drop-shadow-sm">
              Secure your account,<br />season after season.
            </h3>
            <p className="text-[13.5px] opacity-85 max-w-[320px]">
              A quick reset and you're back to tracking soil health, weather, and mandi prices.
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

export default ForgotPasswordPage;
