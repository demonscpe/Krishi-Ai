import { useEffect } from "react";
const AiChatbot = () => {
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script1.async = true;
    const script2 = document.createElement("script");
    script2.src = "https://files.bpcontent.cloud/2026/04/15/09/20260415092113-YVSV7AMG.js";
    script2.defer = true;
    document.body.appendChild(script1);
    document.body.appendChild(script2);
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);
  return null;
};
export default AiChatbot;
