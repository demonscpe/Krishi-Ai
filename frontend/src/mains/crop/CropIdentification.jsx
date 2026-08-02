import React, { useRef, useState } from "react";
import {
  Leaf, UploadCloud, Camera, Sparkles, RotateCcw,
  CheckCircle2, AlertTriangle, X, ImageOff, Send, Trash2,
  MessageCircle, Info, Crop,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_CROP_API_URL || "http://localhost:8000";

const CropIdentification = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null); // { status: 'success' | 'error', text: string }
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatboxRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setResult({ status: "error", text: "Please upload a valid image file (JPG, PNG, etc.)." });
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const formatPrediction = (data) => {
    if (!data) return "No results found. Try a clearer image.";
    if (typeof data === "string") return data;
    if (data.crop_name) {
      let text = `🌾 **Crop:** ${data.crop_name}\n`;
      if (data.confidence != null) text += `📊 **Confidence:** ${data.confidence}%\n`;
      if (data.description) text += `📝 **Description:** ${data.description}\n`;
      if (data.alternatives && data.alternatives.length > 0) {
        text += `\n🔄 **Alternatives:**\n`;
        data.alternatives.slice(0, 3).forEach((alt) => {
          text += `  • ${alt.crop} (${alt.confidence}%)\n`;
        });
      }
      return text;
    }
    return JSON.stringify(data, null, 2);
  };

  const identifyCrop = async () => {
    if (!image) {
      setResult({ status: "error", text: "Upload an image first." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(`${API_BASE}/api/cropidentification/identify`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult({ status: "success", text: formatPrediction(data) });
    } catch (err) {
      console.error("Crop identification error:", err);
      setResult({
        status: "error",
        text: `Error: ${err.message}. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Chat functions
  const sendMessage = async () => {
    const msg = chatMessage.trim();
    if (!msg || chatLoading) return;

    const userMsg = { role: "user", content: msg };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/cropidentification/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          crop_context: result?.text || "No crop identified yet.",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const botMsg = { role: "bot", content: data.reply };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", content: `Error: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        if (chatboxRef.current) {
          chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setChatMessage("");
  };

  const formatBotResponse = (text) => {
    let formatted = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "<")
      .replace(/>/g, ">");

    // Bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Line breaks
    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 sm:px-6 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700 mb-4">
            <Crop size={14} /> AI Crop Analyzer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Crop Identification <span className="text-green-700">&amp; Farming Assistant</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload a photo to identify crops, then ask our AI farming assistant for advice on diseases, soil, pests & more.
          </p>
        </div>

        {/* Main Grid - Dual Panel */}
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
          {/* Left Panel - Crop Analyzer */}
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Leaf size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Crop Analyzer</h2>
                <p className="text-xs text-slate-400">Upload and identify crops instantly</p>
              </div>
            </div>

            {/* Upload / Preview area */}
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current.click()}
                className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-green-700 bg-green-50 scale-[1.01]"
                    : "border-green-300 bg-green-50/40 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-green-100 transition-transform ${isDragging ? "-translate-y-1" : ""}`}>
                  <UploadCloud size={26} className="text-green-700" />
                </div>
                <p className="text-sm font-bold text-slate-700">Drop your crop image here</p>
                <p className="mt-1 text-xs text-slate-400 inline-flex items-center gap-1 justify-center">
                  <Camera size={12} /> or click to select from your device
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-green-200">
                <img src={preview} alt="Uploaded crop preview" className="w-full max-h-80 object-cover block" />
                <button
                  type="button"
                  onClick={reset}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={identifyCrop}
                disabled={loading || !image}
                className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Analyze Crop
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 px-4 py-3.5 text-sm font-bold text-green-800 transition hover:bg-green-50 disabled:opacity-50"
              >
                <RotateCcw size={16} /> Clear
              </button>
            </div>

            {/* Results */}
            {result && (
              <div
                className={`mt-6 rounded-2xl border-l-4 p-5 ${
                  result.status === "success"
                    ? "border-green-500 bg-green-50/70"
                    : "border-amber-500 bg-amber-50/70"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {result.status === "success" ? (
                    <CheckCircle2 size={18} className="text-green-700" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-700" />
                  )}
                  <h3 className={`text-sm font-extrabold uppercase tracking-wide ${
                    result.status === "success" ? "text-green-800" : "text-amber-800"
                  }`}>
                    {result.status === "success" ? "Analysis Result" : "Couldn't Complete Analysis"}
                  </h3>
                </div>
                <div className="whitespace-pre-wrap rounded-xl bg-white/80 p-4 text-sm leading-relaxed text-slate-700">
                  {result.text}
                </div>
              </div>
            )}

            {!preview && !result && (
              <div className="mt-5 flex items-center gap-2 justify-center text-xs text-slate-400">
                <ImageOff size={14} /> No image selected yet
              </div>
            )}
          </div>

          {/* Right Panel - Farming Assistant Chat */}
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Farming Assistant</h2>
                <p className="text-xs text-slate-400">Ask about diseases, soil, pests & more</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatboxRef}
              className="flex-1 min-h-[400px] max-h-[500px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-4 mb-4 space-y-3"
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-sm font-medium">Start a conversation with your farming expert</p>
                  <p className="text-xs mt-1">Ask about crop care, pest management, soil health & more</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-green-700 text-white rounded-br-md"
                          : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <div dangerouslySetInnerHTML={{ __html: formatBotResponse(msg.content) }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your crops..."
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                disabled={chatLoading}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !chatMessage.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-700 text-white shadow-lg transition hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send size={16} />
              </button>
              <button
                onClick={clearChat}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:bg-slate-100"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropIdentification;
