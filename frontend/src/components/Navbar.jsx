import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import GoogleTranslate from "./GoogleTranslate";
import { FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import LoginPromptModal from "./LoginPromptModal";
import icon from "../assets/Krishi-logo.svg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { isLoggedIn, logout } = useAuth();
  const navbarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/login');
  const [loginPromptMessage, setLoginPromptMessage] = useState('You need to login before using this feature.');
  const navigate = useNavigate();

  const protectedPaths = new Set([
    '/chatbot',
    '/crop',
    '/crop_recommendation',
    '/crop_Rotation_AI',
    '/crop-identification',
    '/water-management',
    '/fertilizer',
    '/soil',
    '/disease',
    '/TaskReminder',
    '/GeminiChat',
    '/SugarcaneRecognition',
    '/PaddyRecognition',
    '/DiseaseRecognition',
    '/PlantTaskReminder',
    '/Climate',
    '/KrishiTradeAI',
    '/nursery',
    '/nursery/search',
    '/nursery/orders',
    '/nursery/inventory',
    '/nursery/dashboard',
    '/nursery/profile',
  ]);

  const closeAll = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const openLoginModal = (path, label) => {
    setLoginRedirectPath(path);
    setLoginPromptMessage(`Please login to continue to ${label}.`);
    setShowLoginPrompt(true);
  };

  const handleProtectedNavigation = (event, path, label) => {
    if (isLoggedIn) return;

    if (protectedPaths.has(path)) {
      event.preventDefault();
      openLoginModal(path, label);
    }
  };

  const handleContinue = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { from: loginRedirectPath } });
  };

  const handleBack = () => {
    setShowLoginPrompt(false);
  };

  const isParentActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const baseLink =
    "relative py-2 px-1 text-[13px] font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1 whitespace-nowrap";

  const activeLinkStyle =
    "text-green-700 after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[3px] after:bg-green-700 after:rounded-full";

  const inactiveLinkStyle = "text-gray-600 hover:text-green-700";

  const navLinkClass = ({ isActive }) =>
    `${baseLink} ${isActive ? activeLinkStyle : inactiveLinkStyle}`;

  const dropdownItemClass = ({ isActive }) =>
    `block py-2.5 px-5 text-[13px] font-medium transition-all duration-150 hover:bg-green-50 hover:pl-7 ${
      isActive
        ? "text-green-700 bg-green-50 font-semibold border-l-4 border-green-700"
        : "text-gray-700"
    }`;

  const dropdowns = [
    {
      key: "crop",
      label: "Crops",
      paths: ["/crop", "/prices", "/crop-identification", "/crop_recommendation"],
      items: [
        { to: "/crop", label: "Crop Recommendation" },
        { to: "/crop_recommendation", label: "Rotation Recommendation" },
        { to: "/crop_Rotation_AI", label: "Crop Rotation" },
        { to: "/prices", label: "Price Prediction" },
        { to: "/crop-identification", label: "Crop Identification" },

      ],
    },
    {
      key: "soil",
      label: "Soil",
      paths: ["/fertilizer", "/soil", "/soil/image-analysis", "/soil/test-input", "/soil/health-analyzer", "/soil/fertilizer", "/soil/quality"],
      items: [
        { to: "/soil", label: "Soil Hub Dashboard" },
        { to: "/soil/image-analysis", label: "Soil Image Analysis" },
        { to: "/soil/test-input", label: "Soil Test Input" },
        { to: "/soil/health-analyzer", label: "Soil Health Analyzer" },
        { to: "/soil/fertilizer", label: "Fertilizer Recommendation" },
        { to: "/soil/quality", label: "Soil Quality Prediction" },
        { to: "/fertilizer", label: "Fertilizer Prediction (Legacy)" },
      ],
    },
    {
      key: "tools",
      label: "Tools",
      paths: ["/PlantTask", "/TaskReminder", "/GeminiChat", "/water-management"],
      items: [
        { to: "/PlantTaskReminder", label: "Task Reminder" },
        { to: "/TaskReminder", label: "Task Reminder Advanced" },
        { to: "/GeminiChat", label: "Gemini Chat" },
        { to: "/water-management", label: "Water Management" },
      ],
    },
    {
      key: "help",
      label: "Help",
      paths: ["/Climate", "/news", "/soiltesting", "/ee-shops", "/BestPractices"],
      items: [
        { to: "/Climate", label: "Climate" },
        { to: "/news", label: "News" },
        { to: "/soiltestingcentres", label: "Soil Testing Centers" },
        { to: "/ee-shops", label: "EE Shops" },
        { to: "/BestPractices", label: "Best Practices" },
      ],
    },
  ];

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full z-[9999] bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="h-16 max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.location.reload();
            }
            closeAll();
          }}
          className="flex-shrink-0 flex items-center outline-none"
        >
          <img
            src={icon}
            alt="Krishi Logo"
            className="h-9 w-auto object-contain"
          />
        </Link>
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <NavLink to="/" end className={navLinkClass} onClick={closeAll}>
            Home
          </NavLink>
         

          {dropdowns.map(({ key, label, paths, items }) => (
            <div key={key} className="relative">
              <button
                onClick={() => handleDropdownToggle(key)}
                className={`${baseLink} ${
                  openDropdown === key || isParentActive(paths)
                    ? `text-green-700 ${activeLinkStyle}`
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                {label}
                <FaChevronDown
                  className={`text-[10px] transition-transform duration-200 ${
                    openDropdown === key ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === key && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 py-2 rounded-xl z-50">
                  <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
                  {items.map(({ to, label: itemLabel }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={dropdownItemClass}
                      onClick={(e) => {
                        handleProtectedNavigation(e, to, itemLabel);
                        closeAll();
                      }}
                    >
                      {itemLabel}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Disease Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('disease')}
              className={`${baseLink} ${
                openDropdown === 'disease' || location.pathname.startsWith('/disease')
                  ? `text-green-700 ${activeLinkStyle}`
                  : "text-gray-600 hover:text-green-700"
              }`}
            >
              Disease
              <FaChevronDown
                className={`text-[10px] transition-transform duration-200 ${
                  openDropdown === 'disease' ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === 'disease' && (
              <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 py-2 rounded-xl z-50">
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
                <NavLink to="/disease" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease', 'Disease Hub'); closeAll(); }}>Disease Hub</NavLink>
                <NavLink to="/disease/identify" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/identify', 'Plant ID'); closeAll(); }}>Plant Identification</NavLink>
                <NavLink to="/disease/detect" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/detect', 'Disease Detection'); closeAll(); }}>Disease Detection</NavLink>
                <NavLink to="/disease/severity" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/severity', 'Severity'); closeAll(); }}>Severity Assessment</NavLink>
                <NavLink to="/disease/treatment" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/treatment', 'Treatment'); closeAll(); }}>Treatment</NavLink>
                <NavLink to="/disease/prevention" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/prevention', 'Prevention'); closeAll(); }}>Prevention Guide</NavLink>
                <NavLink to="/disease/chatbot" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/chatbot', 'AI Plant Doctor'); closeAll(); }}>AI Plant Doctor</NavLink>
                <NavLink to="/disease/history" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/disease/history', 'History'); closeAll(); }}>History</NavLink>
                <div className="border-t border-gray-100 my-1"></div>
                <NavLink to="/SugarcaneRecognition" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/SugarcaneRecognition', 'Sugarcane'); closeAll(); }}>Sugarcane Engine</NavLink>
                <NavLink to="/PaddyRecognition" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/PaddyRecognition', 'Paddy'); closeAll(); }}>Paddy Engine</NavLink>
                <NavLink to="/DiseaseRecognition" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/DiseaseRecognition', 'Combined'); closeAll(); }}>Combined Engine</NavLink>
              </div>
            )}
          </div>

          {/* Nursery Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdownToggle('nursery')}
              className={`${baseLink} ${
                openDropdown === 'nursery' || location.pathname.startsWith('/nursery')
                  ? `text-green-700 ${activeLinkStyle}`
                  : "text-gray-600 hover:text-green-700"
              }`}
            >
              Nursery
              <FaChevronDown
                className={`text-[10px] transition-transform duration-200 ${
                  openDropdown === 'nursery' ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === 'nursery' && (
              <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 py-2 rounded-xl z-50">
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
                <NavLink to="/nursery" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery', 'Nursery Hub'); closeAll(); }}>Nursery Hub</NavLink>
                <NavLink to="/nursery/search" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery/search', 'Browse Nurseries'); closeAll(); }}>Browse Nurseries</NavLink>
                <NavLink to="/nursery/orders" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery/orders', 'My Orders'); closeAll(); }}>My Orders</NavLink>
                <NavLink to="/nursery/inventory" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery/inventory', 'Inventory'); closeAll(); }}>Inventory</NavLink>
                <NavLink to="/nursery/dashboard" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery/dashboard', 'Dashboard'); closeAll(); }}>Dashboard</NavLink>
                <NavLink to="/nursery/profile" className={dropdownItemClass} onClick={(e) => { handleProtectedNavigation(e, '/nursery/profile', 'Profile'); closeAll(); }}>Profile</NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/KrishiTradeAI"
            className={navLinkClass}
            onClick={(e) => {
              handleProtectedNavigation(e, '/KrishiTradeAI', 'Krishi Trade AI');
              closeAll();
            }}
          >
            Krishi Trade AI
          </NavLink>

          <NavLink
            to="/pesticides-shop"
            className={navLinkClass}
            onClick={closeAll}
          >
            Pesticides Shop
          </NavLink>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="scale-90 origin-right">
            <GoogleTranslate />
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-[13px] font-semibold text-gray-600 hover:text-green-700 transition-colors"
                onClick={closeAll}
              >
                Profile
              </Link>
              <button
                onClick={() => { logout(); closeAll(); }}
                className="text-[12px] font-semibold px-4 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeAll}
              className="text-[13px] font-bold px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-all shadow-sm"
            >
              Login
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          type="button"
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/"
              end
              onClick={closeAll}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/market"
              onClick={(e) => { handleProtectedNavigation(e, '/market', 'Market'); closeAll(); }}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Market
            </NavLink>

            {dropdowns.map(({ key, label, paths, items }) => (
              <div key={key}>
                <button
                  onClick={() => handleDropdownToggle(key)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                    isParentActive(paths)
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                  <FaChevronDown
                    className={`text-[10px] transition-transform duration-200 ${
                      openDropdown === key ? "rotate-180 text-green-700" : "text-gray-400"
                    }`}
                  />
                </button>

                {openDropdown === key && (
                  <div className="mt-1 ml-4 border-l-2 border-green-100 pl-3 space-y-1">
                    {items.map(({ to, label: itemLabel }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={(e) => {
                          handleProtectedNavigation(e, to, itemLabel);
                          closeAll();
                        }}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-[13px] font-medium ${
                            isActive
                              ? "text-green-700 bg-green-50"
                              : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                          }`
                        }
                      >
                        {itemLabel}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <NavLink
              to="/disease"
              onClick={(e) => {
                handleProtectedNavigation(e, '/disease', 'Disease');
                closeAll();
              }}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Disease
            </NavLink>

            <NavLink
              to="/nursery"
              onClick={(e) => {
                handleProtectedNavigation(e, '/nursery', 'Nursery');
                closeAll();
              }}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Nursery
            </NavLink>

            <NavLink
              to="/KrishiTradeAI"
              onClick={(e) => {
                handleProtectedNavigation(e, '/KrishiTradeAI', 'Krishi Trade AI');
                closeAll();
              }}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Krishi Trade AI
            </NavLink>

            <NavLink
              to="/pesticides-shop"
              onClick={closeAll}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-[14px] font-semibold ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Pesticides Shop
            </NavLink>
            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              <div className="px-3">
                <GoogleTranslate />
              </div>

              {isLoggedIn ? (
                <div className="flex gap-2 px-3">
                  <Link
                    to="/profile"
                    onClick={closeAll}
                    className="flex-1 text-center py-2.5 text-[13px] font-semibold rounded-lg border border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); closeAll(); }}
                    className="flex-1 text-center py-2.5 text-[13px] font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-3 pb-2">
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="block text-center py-2.5 text-[14px] font-bold rounded-lg bg-green-700 text-white hover:bg-green-800"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <LoginPromptModal
        open={showLoginPrompt}
        message={loginPromptMessage}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    </nav>
  );
};

export default Navbar;