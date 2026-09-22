import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, Upload, Sparkles, ArrowLeft, RefreshCw, AlertTriangle,
  CheckCircle2, Info, Send, BookOpen, History, ShieldAlert,
  Leaf, FlaskConical, Droplets, Sun, Layers, HelpCircle, ChevronRight,
  Maximize2, Volume2, X, Download
} from "lucide-react";
import bgHero from "../../assets/bgHero.png";

const FertilizerAdvisor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Camera state
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [stream, setStream] = useState(null);

  // Catalog modal state
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogFilter, setCatalogFilter] = useState("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  // Scan History
  const [scanHistory, setScanHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_FERTILIZER_API_URL || import.meta.env.VITE_CROP_API_URL || "http://localhost:8000";

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fertilizer_scan_history");
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start live camera
  const startCamera = async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check camera permissions or use image upload.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Capture image snapshot from live video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `fertilizer_snapshot_${Date.now()}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
        setActiveTab("upload");
      }
    }, "image/jpeg", 0.92);
  };

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, WEBP).");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Analyze image via AI API
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select or capture a fertilizer packaging image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(`${API_BASE}/api/identify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.message || `Server error (${response.status})`);
      }

      const resData = await response.json();
      const analysisData = resData.data || resData;
      setResult(analysisData);

      // Save to history
      saveToHistory({ ...analysisData, previewUrl: imagePreview });

      // Init chat messages with context
      setChatMessages([
        {
          sender: "ai",
          text: `I have analyzed **${analysisData.fertilizer_name || "your fertilizer sample"}** (${analysisData.primary_type || "Fertilizer"}). How can I assist you with application, dosage, or crop compatibility?`,
        },
      ]);
    } catch (err) {
      console.error("Analysis Error:", err);
      // Fallback try alternate endpoint if backend port varies
      try {
        const altResponse = await fetch(`http://localhost:7866/api/identify`, {
          method: "POST",
          body: formData,
        });
        if (altResponse.ok) {
          const altResData = await altResponse.json();
          const analysisData = altResData.data || altResData;
          setResult(analysisData);
          saveToHistory({ ...analysisData, previewUrl: imagePreview });
          setChatMessages([
            {
              sender: "ai",
              text: `I have analyzed **${analysisData.fertilizer_name}** (${analysisData.primary_type}). Ask me any questions about dosage or application!`,
            },
          ]);
          setLoading(false);
          return;
        }
      } catch (altErr) {
        // ignore alt err
      }

      setError(err.message || "Failed to analyze fertilizer image. Please ensure API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (item) => {
    try {
      const newHistory = [item, ...scanHistory.slice(0, 14)];
      setScanHistory(newHistory);
      localStorage.setItem("fertilizer_scan_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  // Fetch catalog
  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const res = await fetch(`${API_BASE}/api/fertilizers`);
      if (res.ok) {
        const data = await res.json();
        setCatalogItems(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const openCatalogModal = () => {
    setShowCatalog(true);
    fetchCatalog();
  };

  // Chat message send
  const handleSendMessage = async (customMsg = null) => {
    const messageText = customMsg || chatInput.trim();
    if (!messageText || chatLoading) return;

    const newMessages = [...chatMessages, { sender: "user", text: messageText }];
    setChatMessages(newMessages);
    if (!customMsg) setChatInput("");
    setChatLoading(true);

    const fertContext = result
      ? `Fertilizer: ${result.fertilizer_name}, Type: ${result.primary_type} (${result.sub_type}), NPK: ${result.npk_ratio}, Composition: ${result.composition}`
      : "General Fertilizer Query";

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, fertilizer_context: fertContext }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages([...newMessages, { sender: "ai", text: data.reply || "No reply available." }]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      setChatMessages([
        ...newMessages,
        { sender: "ai", text: "I'm having trouble connecting to the advisory server. Please check your network connection." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredCatalog = catalogItems.filter((item) => {
    const matchesCategory =
      catalogFilter === "all"
        ? true
        : item.primary_type.toLowerCase().includes(catalogFilter.toLowerCase());
    const matchesSearch =
      !catalogSearch ||
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.crop_compatibility && item.crop_compatibility.some((c) => c.toLowerCase().includes(catalogSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-16 sm:pt-20 font-sans pb-20">
      {/* Hero Header */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-900 px-4 py-12 sm:px-6 sm:py-16 text-white">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${bgHero})` }}
        />
        <div className="absolute top-0 right-10 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 -z-10 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate("/soil")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft size={16} /> Back to Soil Hub
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={openCatalogModal}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:bg-emerald-600 transition"
              >
                <BookOpen size={15} /> Fertilizer Catalog
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-100 hover:bg-white/20 transition"
              >
                <History size={15} /> History ({scanHistory.length})
              </button>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-lime-300">
              <Sparkles size={14} /> AI Multimodal Vision & Advisory
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Fertilizer Advisor & Identification
            </h1>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-emerald-100/90">
              Upload or snap a photo of any fertilizer bag, prills, granules, or liquid bottle. Get instant AI identification, NPK breakdown, biofertilizer microbial counts, crop compatibility, and dosage guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-10 space-y-8">
        {/* History Drawer */}
        {showHistory && (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="text-emerald-600" size={20} /> Recent Fertilizer Scans
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            {scanHistory.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No scan history stored yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setResult(item);
                      setShowHistory(false);
                    }}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition shadow-sm"
                  >
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{item.primary_type}</p>
                    <p className="text-base font-extrabold text-slate-800 truncate">{item.fertilizer_name}</p>
                    <p className="text-xs text-slate-500 mt-1">NPK: {item.npk_ratio || "N/A"}</p>
                    <span className="mt-2 inline-block text-[11px] font-semibold text-emerald-600">Click to view full analysis →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input & Camera Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setActiveTab("upload");
                stopCamera();
              }}
              className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition ${
                activeTab === "upload"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Upload size={18} /> File Upload / Gallery
            </button>
            <button
              onClick={() => {
                setActiveTab("camera");
                startCamera();
              }}
              className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 transition ${
                activeTab === "camera"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Camera size={18} /> Live Camera Viewfinder
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div
                onClick={() => document.getElementById("file-upload-input").click()}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50/80"
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition">
                  <Upload size={32} />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-800">
                  Click or drag image of fertilizer bag, bottle, or granules
                </h3>
                <p className="mt-1 text-xs text-slate-500">Supports JPG, PNG, WEBP up to 12 MB</p>
              </div>

              {imagePreview && (
                <div className="relative rounded-2xl border border-slate-200 p-4 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Selected Fertilizer"
                    className="h-44 w-44 object-cover rounded-xl shadow-md border"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-sm font-bold text-slate-800">Image Ready for AI Vision</p>
                    <p className="text-xs text-slate-500">
                      File: {selectedFile?.name || "snapshot.jpg"} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-start pt-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="animate-spin" size={18} /> Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} /> Identify Fertilizer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "camera" && (
            <div className="space-y-4 text-center">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center border-2 border-emerald-500">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Target Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-dashed border-lime-400/80 rounded-2xl flex items-center justify-center">
                    <span className="text-[11px] font-bold text-lime-300 bg-black/60 px-2 py-1 rounded">
                      Align Packaging / Label Here
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={captureSnapshot}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg hover:bg-emerald-700 transition"
                >
                  <Camera size={18} /> Capture Snapshot
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <RefreshCw size={16} /> Switch Camera ({cameraFacingMode})
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="shrink-0 text-red-500" size={18} /> {error}
            </div>
          )}
        </div>

        {/* Loading Overlay State */}
        {loading && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-900/5 p-12 text-center space-y-4">
            <RefreshCw size={48} className="animate-spin text-emerald-600 mx-auto" />
            <h3 className="text-xl font-black text-slate-800">Analyzing Fertilizer packaging & NPK composition...</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Running deep multimodal vision models to identify Chemical vs Biofertilizers, active ingredients, and crop advisory guidelines.
            </p>
          </div>
        )}

        {/* Result Card Section */}
        {result && !loading && (
          <div className="space-y-8 animate-fadeIn">
            {/* Classification Banner */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 left-0 h-3 ${
                  result.primary_type?.toLowerCase().includes("bio") ? "bg-emerald-500" : "bg-sky-500"
                }`}
              />

              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        result.primary_type?.toLowerCase().includes("bio")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      <Leaf size={14} /> {result.primary_type || "Fertilizer"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {result.sub_type || "Formulation"}
                    </span>
                    {result.category && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                        {result.category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900">{result.fertilizer_name}</h2>
                  {result.commercial_trade_name && (
                    <p className="text-sm font-semibold text-slate-500 mt-1">Brand / Trade Name: {result.commercial_trade_name}</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center min-w-[140px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Confidence</p>
                  <p className="text-3xl font-black text-emerald-600">{result.confidence || 95}%</p>
                </div>
              </div>

              {/* NPK & Microbial Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white">
                {/* Nitrogen Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-300">
                    <span>Nitrogen (N)</span>
                    <span>{result.nitrogen_percent ?? (result.npk_ratio?.split("-")[0] || 0)}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (result.nitrogen_percent || 0) * 2)}%` }}
                    />
                  </div>
                </div>

                {/* Phosphorus Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-300">
                    <span>Phosphorus (P₂O₅)</span>
                    <span>{result.phosphorus_percent ?? (result.npk_ratio?.split("-")[1] || 0)}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (result.phosphorus_percent || 0) * 2)}%` }}
                    />
                  </div>
                </div>

                {/* Potassium Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-300">
                    <span>Potassium (K₂O)</span>
                    <span>{result.potassium_percent ?? (result.npk_ratio?.split("-")[2] || 0)}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (result.potassium_percent || 0) * 2)}%` }}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 pt-4 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap justify-between gap-2">
                  <span><strong>NPK Ratio:</strong> {result.npk_ratio || "N/A"}</span>
                  <span><strong>Micronutrients:</strong> {result.micronutrients || "None"}</span>
                  <span><strong>Form:</strong> {result.physical_form || "N/A"}</span>
                </div>
              </div>

              {/* Detailed Technical Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="text-emerald-600" size={18} /> Active Ingredients & Composition
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {result.composition || "Standard agricultural nutrient formulation."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-emerald-600" size={18} /> Why Used (Agronomic Function)
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {result.why_used || "Promotes vegetative canopy, root vigor, and crop yield strength."}
                  </p>
                </div>
              </div>

              {/* Compatible Crops */}
              {result.crop_compatibility && result.crop_compatibility.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Suitable Compatible Crops</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.crop_compatibility.map((crop, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200"
                      >
                        <CheckCircle2 size={13} className="text-emerald-600" /> {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Guidance & Dosage */}
              {result.application_guidance && (
                <div className="mt-6 rounded-2xl bg-amber-50/60 border border-amber-200 p-6 space-y-4">
                  <h4 className="text-base font-extrabold text-amber-900 flex items-center gap-2">
                    <Droplets className="text-amber-600" size={18} /> Application Guidance & Dosage
                  </h4>
                  <p className="text-sm font-bold text-amber-800">
                    Recommended Dose: {result.application_guidance.dosage || "1-2 doses per acre depending on crop stage."}
                  </p>
                  {result.application_guidance.methods && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {result.application_guidance.methods.map((m, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-3 border border-amber-200 text-xs">
                          <p className="font-extrabold text-slate-800">{m.method}</p>
                          <p className="text-slate-600 mt-0.5">{m.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Safety Precautions & Storage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {result.precautions && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-3">
                    <h4 className="text-base font-extrabold text-red-900 flex items-center gap-2">
                      <ShieldAlert className="text-red-600" size={18} /> Safety & Mixing Precautions
                    </h4>
                    <ul className="space-y-1.5 text-xs text-red-800 list-disc list-inside">
                      {Array.isArray(result.precautions) ? (
                        result.precautions.map((p, idx) => <li key={idx}>{p}</li>)
                      ) : (
                        <li>{result.precautions}</li>
                      )}
                    </ul>
                  </div>
                )}

                {result.storage_info && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                    <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Sun className="text-amber-500" size={18} /> Storage & Shelf-Life Protocol
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{result.storage_info}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Agricultural AI Chat Assistant */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="text-emerald-600" size={20} /> Ask Agri-Expert AI Assistant
                </h3>
                <span className="text-xs font-bold text-slate-400">Context: {result.fertilizer_name}</span>
              </div>

              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "What is the exact per-acre dosage?",
                  "Can I tank-mix this with fungicides?",
                  "When should I apply this during crop stage?",
                  "Is this suitable for organic farming?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Stream */}
              <div className="max-h-72 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-2.5 text-xs text-slate-400 border animate-pulse">
                      Agri-Expert AI is typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask any question about dosage, timing, or soil compatibility..."
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={chatLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-white font-bold text-sm hover:bg-emerald-700 transition"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fertilizer Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <BookOpen className="text-emerald-400" size={22} /> Standard Fertilizer & Bio-Inoculant Catalog
                </h3>
                <p className="text-xs text-slate-400 mt-1">Reference database of chemical and biofertilizers</p>
              </div>
              <button onClick={() => setShowCatalog(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCatalogFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    catalogFilter === "all" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border"
                  }`}
                >
                  All ({catalogItems.length})
                </button>
                <button
                  onClick={() => setCatalogFilter("chemical")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    catalogFilter === "chemical" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border"
                  }`}
                >
                  Chemical
                </button>
                <button
                  onClick={() => setCatalogFilter("bio")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    catalogFilter === "bio" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border"
                  }`}
                >
                  Biofertilizers
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by name, crop, or NPK..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs w-64 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Catalog Grid */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingCatalog ? (
                <div className="col-span-2 py-12 text-center text-slate-400">Loading catalog...</div>
              ) : filteredCatalog.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400">No fertilizers found.</div>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-500 transition shadow-sm space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {item.primary_type}
                        </span>
                        <span className="text-xs font-bold text-slate-500">NPK: {item.npk}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.benefits}</p>
                    </div>

                    <div className="pt-2 border-t text-[11px] text-slate-500 flex justify-between items-center">
                      <span>Sub-type: {item.sub_type}</span>
                      <button
                        onClick={() => setSelectedCatalogItem(item)}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Item View Modal */}
      {selectedCatalogItem && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-700">{selectedCatalogItem.primary_type}</span>
                <h3 className="text-2xl font-black text-slate-900">{selectedCatalogItem.name}</h3>
                <p className="text-xs text-slate-500">Category: {selectedCatalogItem.category}</p>
              </div>
              <button onClick={() => setSelectedCatalogItem(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-1">
              <p><strong>NPK Ratio:</strong> {selectedCatalogItem.npk}</p>
              <p><strong>Composition:</strong> {selectedCatalogItem.composition}</p>
              <p><strong>Color / Form:</strong> {selectedCatalogItem.color}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">Benefits & Function:</p>
              <p className="text-slate-600">{selectedCatalogItem.benefits}</p>

              <p className="font-bold text-slate-800 mt-2">Application Method:</p>
              <p className="text-slate-600">{selectedCatalogItem.application}</p>

              <p className="font-bold text-slate-800 mt-2">Precautions:</p>
              <p className="text-red-700 font-medium">{selectedCatalogItem.precautions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerAdvisor;
