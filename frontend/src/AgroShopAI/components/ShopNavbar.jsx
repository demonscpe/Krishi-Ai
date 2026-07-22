import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LOGO from '/favicon2.png';
import SearchBar from './sub-components/SearchBar';

/* ---------------- Icons (inline, stroke-based for a lighter look) ---------------- */

const PinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="21" r="1.5" />
    <circle cx="19" cy="21" r="1.5" />
    <path d="M2.5 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 7H6" />
  </svg>
);

const PackageIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 8.5 12 13 3 8.5M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3ZM12 13v8" />
  </svg>
);

const UserIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
);

const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.8 3.5 4.5 6.8C19.5 15.9 12 20.5 12 20.5Z" />
  </svg>
);

const LogoutIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const ChevronIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MenuIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 18 18 6M6 6l12 12" />
  </svg>
);

/* --------------------------------- Navbar --------------------------------- */

function ShopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState('India');
  const [showAlert, setShowAlert] = useState(false);
  const [cartCount] = useState(5);
  const [, setManualLocation] = useState(false);

  // Ref wraps BOTH the toggle button and the menu, so clicking the button
  // no longer triggers the outside-click handler (fixes the flicker bug).
  const accountRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setShowAlert(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleConfirm = (userLocation) => {
    if (userLocation && userLocation.trim()) {
      setLocation(userLocation.trim());
      setManualLocation(true);
    }
    setShowAlert(false);
  };

  const dropdownItems = [
    { to: '/agroshop/profile', label: 'Your Profile', Icon: UserIcon },
    { to: '/agroshop/wishlist', label: 'Your Wishlist', Icon: HeartIcon },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-green-900/10">
      {/* Utility strip */}
      <div className="bg-green-800 text-green-100 text-xs">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-between">
          <span className="hidden sm:block tracking-wide">
            Free delivery on orders above ₹499
          </span>
          <button
            onClick={() => setShowAlert(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <PinIcon className="h-3.5 w-3.5" />
            <span>
              Delivering to{' '}
              <span className="font-semibold text-white underline decoration-lime-300/60 underline-offset-2 group-hover:decoration-lime-300">
                {location}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Main bar */}
      <nav className="bg-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link
              to="/agroshop"
              className="flex shrink-0 items-center gap-2 group"
            >
              <img
                src={LOGO}
                alt="AgroShop logo"
                className="h-9 w-9 transition-transform duration-300 group-hover:rotate-12"
              />
              <span className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-lime-200 transition-colors">
                AgroShop
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <SearchBar />
            </div>

            {/* Desktop actions */}
            <div className="ml-auto hidden md:flex items-center gap-1">
              <Link
                to="/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <PackageIcon className="h-5 w-5" />
                Orders
              </Link>

              <Link
                to="/agroshop/cart"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <span className="relative">
                  <CartIcon className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-green-900">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                Cart
              </Link>

              {/* Account dropdown */}
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isDropdownOpen ? 'bg-green-700' : 'hover:bg-green-700'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  Account
                  <ChevronIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/5 animate-in"
                  >
                    {dropdownItems.map(({ to, label, Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        {label}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-gray-100" />
                    <Link
                      to="/logout"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon className="h-4 w-4" />
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="ml-auto flex items-center gap-1 md:hidden">
              <Link
                to="/agroshop/cart"
                className="relative rounded-lg p-2.5 hover:bg-green-700 transition-colors"
                aria-label={`Cart, ${cartCount} items`}
              >
                <CartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-green-900">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
                className="rounded-lg p-2.5 hover:bg-green-700 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Search — mobile (always visible under the bar) */}
          <div className="pb-3 md:hidden">
            <SearchBar />
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-green-500/50 bg-green-600 md:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
              {[
                { to: '/orders', label: 'Orders', Icon: PackageIcon },
                { to: '/agroshop/profile', label: 'Your Profile', Icon: UserIcon },
                { to: '/agroshop/wishlist', label: 'Your Wishlist', Icon: HeartIcon },
                { to: '/logout', label: 'Logout', Icon: LogoutIcon },
              ].map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Icon className="h-5 w-5 text-green-200" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Location modal */}
      {showAlert && (
        <LocationDialog
          currentLocation={location}
          onConfirm={handleConfirm}
          onCancel={() => setShowAlert(false)}
        />
      )}
    </header>
  );
}

/* ----------------------------- Location dialog ---------------------------- */

const LocationDialog = ({ currentLocation, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onConfirm(inputValue);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <PinIcon className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="location-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Choose your location
              </h2>
              <p className="text-xs text-gray-500">
                Currently delivering to {currentLocation}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <label
          htmlFor="postal-code"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Postal code
        </label>
        <div className="flex gap-2">
          <input
            id="postal-code"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 518001"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
          <button
            onClick={() => onConfirm(inputValue)}
            disabled={!inputValue.trim()}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          We use your postal code to show accurate delivery times and stock.
        </p>
      </div>
    </div>
  );
};

export default ShopNavbar;