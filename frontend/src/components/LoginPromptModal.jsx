import React from 'react';

const LoginPromptModal = ({ open, message, onContinue, onBack }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Login to Continue</h2>
        <p className="text-sm text-slate-600 mb-6">
          {message || 'You need to login before using this feature. Choose Continue to sign in, or Back to stay on this page.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onContinue}
            className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 transition"
          >
            Continue
          </button>
          <button
            onClick={onBack}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
