import { useEffect, useState } from "react";
import "../styles/Translate.css";

const GoogleTranslate = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    window.googleTranslateInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        setTimeout(window.googleTranslateInit, 100);
      } else {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,pa,sa,mr,ur,bn,es,ja,ko,zh-CN,te,ta,gu,kn,ml,or,as,ne,fr,de,it,ru',
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          defaultLanguage: 'en',
        }, 'google_element');
      }
    };

    const loadGoogleTranslateScript = () => {
      if (!document.getElementById("google_translate_script")) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
        script.id = "google_translate_script";
        document.body.appendChild(script);
      }
    };

    const cleanUI = () => {
      const gadgetElement = document.querySelector('.goog-te-gadget');
      if (gadgetElement) {
        gadgetElement.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
        });
        const img = gadgetElement.querySelector('img');
        if (img) img.style.display = 'none';
      }
    };

    loadGoogleTranslateScript();

    if (window.google && window.google.translate) {
      window.googleTranslateInit();
    }

    const handleScroll = () => setIsVisible(window.scrollY < 100);
    window.addEventListener('scroll', handleScroll);
    const observer = new MutationObserver(cleanUI);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        /* 1. Set the dropdown text to Black/Dark Gray */
        #google_element select {
          background-color: #ffffff !important;
          color: #111111 !important; /* Pure Black for visibility */
          border: 1px solid #d1d5db !important; 
          border-radius: 4px !important;
          padding: 4px 8px !important;
          font-family: 'Roboto', sans-serif !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          outline: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        /* 2. Highlight Green when active or hovered */
        #google_element select:hover, 
        #google_element select:focus {
          border-color: #15803d !important; /* Green border */
          color: #15803d !important; /* Green text when focused */
        }

        /* 3. Ensure the dropdown menu items (options) are black */
        #google_element select option {
          color: #000000 !important;
          background: #ffffff !important;
        }

        /* 4. Hide Google Branding */
        .goog-logo-link, .goog-te-gadget span, .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-gadget { font-size: 0 !important; }
        body { top: 0 !important; }
      `}</style>

      <div 
        id="google_element" 
        className={`google-translate-container ${isVisible ? '' : ''}`}
        style={{ display: 'flex', alignItems: 'center' }}
      ></div>
    </>
  );
};

export default GoogleTranslate;