import React, { useRef, useState } from "react";
import { Client } from "@gradio/client";
import {
  Leaf, UploadCloud, Camera, Sparkles, RotateCcw,
  CheckCircle2, AlertTriangle, X, ImageOff,
} from "lucide-react";

const CropIdentification = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null); // { status: 'success' | 'error', text: string }
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
    if (data == null) return "No results found. Try a clearer image.";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
      return data
        .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
        .join("\n");
    }
    if (typeof data === "object") {
      // Common Gradio label shape: { label, confidences: [{ label, confidence }] }
      if (data.label) {
        const lines = [`Prediction: ${data.label}`];
        if (Array.isArray(data.confidences)) {
          data.confidences.slice(0, 5).forEach((c) => {
            lines.push(`  ${c.label}: ${(c.confidence * 100).toFixed(1)}%`);
          });
        }
        return lines.join("\n");
      }
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const identifyCrop = async () => {
    if (!image) {
      setResult({ status: "error", text: "Upload an image first." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Connect through the same-origin dev proxy (see vite.config.js) instead of
      // the Space name directly — calling the Space's own hf.space domain from the
      // browser triggers a CORS/credentials block that @gradio/client can't avoid
      // on its own. Same-origin requests skip CORS entirely.
      const gradioBase =
        import.meta.env.VITE_GRADIO_PROXY_BASE || `${window.location.origin}/gradio-api`;
      const client = await Client.connect(gradioBase);
      const res = await client.predict("/identify_crop", { image_file: image });

      if (res?.data) {
        setResult({ status: "success", text: formatPrediction(res.data) });
      } else {
        setResult({ status: "error", text: "No results found. Try a clearer image." });
      }
    } catch (err) {
      console.error("Gradio Error:", err);
      setResult({
        status: "error",
        text: "Error detecting crop. The server may be restarting. Please try again.",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 sm:px-6 font-poppins">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700 mb-4">
            <Leaf size={14} /> AI Crop Analyzer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Identify a crop <span className="text-green-700">from a photo</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Upload a clear photo of a plant, leaf, or field and let the model tell you what it is.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8">
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
          <div className="mt-6 flex gap-3">
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
            <div className="mt-6 flex items-center gap-2 justify-center text-xs text-slate-400">
              <ImageOff size={14} /> No image selected yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropIdentification;