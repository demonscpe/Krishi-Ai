import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Crop from './components/models/CropRecommendation';
import Cropidentification from "./components/models/CropIdentification";
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import Disease from './components/Disease';
import Fertilizer from './components/models/Fertilizer';
import SoilQuality from './components/models/SoilQuality';
import SoilHub from './components/models/SoilHub';
import SoilImageAnalysis from './components/models/SoilImageAnalysis';
import SoilTestInput from './components/models/SoilTestInput';
import SoilHealthAnalyzer from './components/models/SoilHealthAnalyzer';
import SoilFertilizerRecommendation from './components/models/SoilFertilizerRecommendation';
import Footer from './components/Footer';
import GoTop from './components/GoTop';
import NotFound from './NotFound';
import Prices from './components/models/Prices';
import Reports from './components/models/Reports';
import AboutUs from "./components/AboutUs";
import Contributor from './pages/ContributorsPage';
import UseScrollToTop from './components/UseScrollToTop';
import Article from './pages/Article';
import TaskReminder from './components/tools/TaskReminder';
import ChatBot from './pages/ChatBot';
import CropRotationRecommendation from './components/models/CropRotationRecommendation';
import DiseaseRecognition from './pages/Disease/DiseaseRecognition';
import SugarcaneRecognition from './pages/Disease/SugarcaneRecognition';
import PaddyRecognition from './pages/Disease/PaddyRecognition';
import Preloader from "./components/PreLoader";
import ProgressScrollDown from "./components/ProgressScrollDown";
import CropRotationPlan from "./components/models/CropRotationPlan";
import React, { useState, useEffect } from "react";
import Climate from './components/help/Climate';
import Products from "./pages/Products";
import Market from './pages/Market';
import AuthPage from './components/AuthPage';
import WhyAI from './pages/WhyAI';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { AuthProvider } from './context/AuthContext';
import TermsAndConditions from './components/TermsAndConditions';
import CookiePolicy from './components/CookiePolicy';
import PlantTaskReminder from './components/tools/PlantTaskReminder';
import CodeOfConduct from './components/CodeOfConduct';
import MushroomEdibility from './components/models/Mushroom';
import PrivacyPolicy from './components/PrivacyPolicy';
import Licensing from './components/Licensing';
import Feedback from './components/Feedback';
import SoilTestingCentres from './components/SoilTestingCenters';
import NewsForum from './components/NewsForum';
import ElectricalElectronicsShops from './components/ElectricalElectronicsShops';
import DiscussionPage from './components/Discussions';
//AgroRentAI
import HeroSectionRent from './AgroRentAI/HeroSectionRent';
import NavigateProducts from './AgroRentAI/NavigateProducts';
import RentUserDashboard from './AgroRentAI/RentUserDashboard';
import RentCheckoutPage from './AgroRentAI/RentCheckoutPage';
import RentCartPage from './AgroRentAI/Cart';
import RentProductDetails from './AgroRentAI/RentProductDetails';
import RentAdminDashboard from './AgroRentAI/RentAdminDashboard';
//AgroShopAI
import HomeShop from './AgroShopAI/pages/HomeShop';
import ShopFooter from './AgroShopAI/components/ShopFooter';
import CategoryPage from './AgroShopAI/pages/CategoryPage';
import ProductPage from './AgroShopAI/pages/ProductPage';
import BestPractices from './pages/BestPractices';
import Profile from './components/Profile';
import AgriProductListing from './AgroRentAI/components/AgriProductListing';
import ProtectedRoute from './components/ProtectedRoute';
import CartPage from './AgroShopAI/pages/Cart';
import Wishlist from './AgroShopAI/pages/Wishlist';
import ShopNavbar from './AgroShopAI/components/ShopNavbar';
import ShopProfile from './AgroShopAI/pages/Profile';
import SearchResult from './AgroShopAI/pages/SearchResult'
import CancelAndReturnPolicy from './AgroShopAI/pages/FooterPages/CancelAndReturn';
import TermsOfUse from './AgroShopAI/pages/FooterPages/TermsOfUse';
import ShopPrivacyPolicy from './AgroShopAI/pages/FooterPages/Privacy';
import GrievanceRedressal from './AgroShopAI/pages/FooterPages/Grievance';
import ForgotPasswordPage from './components/ForgotPassword';
import AccountVerificationPage from './components/EmailVerification';
import OAuthSuccess from './components/OAuthSuccess';
import FAQ from './AgroShopAI/pages/Faq';
import GeminiChat from './components/tools/GeminiChat';
import ResendVerificationPage from './components/ResendVerification';
import DiscussionForum from './components/DiscussionForum';
import AiChatbot from './components/AiChatbot';
import WaterManagement from './components/models/WaterManagement';
import RentSupportPage from './AgroRentAI/components/RentSupportPage';

// Disease Intelligence Platform
import DiseaseHub from './components/models/DiseaseHub';
import PlantIdentification from './components/models/PlantIdentification';
import DiseaseDetection from './components/models/DiseaseDetection';
import DiseaseSeverity from './components/models/DiseaseSeverity';
import TreatmentRecommendation from './components/models/TreatmentRecommendation';
import DiseasePrevention from './components/models/DiseasePrevention';
import DiseaseChatbot from './components/models/DiseaseChatbot';
import DiseaseHistoryDashboard from './components/models/DiseaseHistoryDashboard';
import DiseaseReport from './components/models/DiseaseReport';
import { DiseaseProvider } from './context/DiseaseContext';

// Nursery Platform
import NurseryHub from './components/models/NurseryHub';
import NurserySearch from './components/models/NurserySearch';
import NurseryOrders from './components/models/NurseryOrders';
import NurseryInventory from './components/models/NurseryInventory';
import NurseryDashboard from './components/models/NurseryDashboard';
import NurseryProfile from './components/models/NurseryProfile';
import { NurseryProvider } from './context/NurseryContext';

const MainContent = () => {
  UseScrollToTop();
  const location = useLocation();
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloaderVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const normalizePath = (path) => path.toLowerCase().replace(/^\/+|\/+$/g, '');
  const hideNavbarRoutes = ['navigateproducts', '404'];
  const agroShopRoute = 'agroshop';
  const normalizedPath = normalizePath(location.pathname);
  const hideNavbar = hideNavbarRoutes.includes(normalizedPath) || normalizedPath.startsWith(agroShopRoute);
  const checkShop = normalizedPath.startsWith(agroShopRoute);
  return (
    <>
      {isPreloaderVisible ? (
        <Preloader />
      ) : (
        <div>
          <AuthProvider>
            <GoTop />
            <AiChatbot />
            <ProgressScrollDown />
            <div>
              {!hideNavbar ? <Navbar /> : <ShopNavbar />}
              <Routes>
                <Route path="/thank-you" element={<Feedback />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/licensing" element={<Licensing />} />
                <Route path="/" element={<Home />} />
                <Route path="/chatbot" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contributor" element={<Contributor />} />
                <Route path="/about" element={<About />} />
                <Route path="/crop" element={<ProtectedRoute><Crop /></ProtectedRoute>} />
                <Route path="/water-management" element={<ProtectedRoute><WaterManagement /></ProtectedRoute>} />
                <Route path="/fertilizer" element={<ProtectedRoute><Fertilizer /></ProtectedRoute>} />
                {/* Soil Hub */}
                <Route path="/soil" element={<ProtectedRoute><SoilHub /></ProtectedRoute>} />
                <Route path="/soil/image-analysis" element={<ProtectedRoute><SoilImageAnalysis /></ProtectedRoute>} />
                <Route path="/soil/test-input" element={<ProtectedRoute><SoilTestInput /></ProtectedRoute>} />
                <Route path="/soil/health-analyzer" element={<ProtectedRoute><SoilHealthAnalyzer /></ProtectedRoute>} />
                <Route path="/soil/fertilizer" element={<ProtectedRoute><SoilFertilizerRecommendation /></ProtectedRoute>} />
                <Route path="/soil/quality" element={<ProtectedRoute><SoilQuality /></ProtectedRoute>} />
                {/* Disease Hub */}
                <Route path="/disease" element={<ProtectedRoute><DiseaseProvider><DiseaseHub /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/identify" element={<ProtectedRoute><DiseaseProvider><PlantIdentification /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/detect" element={<ProtectedRoute><DiseaseProvider><DiseaseDetection /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/severity" element={<ProtectedRoute><DiseaseProvider><DiseaseSeverity /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/treatment" element={<ProtectedRoute><DiseaseProvider><TreatmentRecommendation /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/prevention" element={<ProtectedRoute><DiseaseProvider><DiseasePrevention /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/chatbot" element={<ProtectedRoute><DiseaseProvider><DiseaseChatbot /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/history" element={<ProtectedRoute><DiseaseProvider><DiseaseHistoryDashboard /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/report" element={<ProtectedRoute><DiseaseProvider><DiseaseReport /></DiseaseProvider></ProtectedRoute>} />
                {/* Nursery Hub */}
                <Route path="/nursery" element={<ProtectedRoute><NurseryProvider><NurseryHub /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/search" element={<ProtectedRoute><NurseryProvider><NurserySearch /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/orders" element={<ProtectedRoute><NurseryProvider><NurseryOrders /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/inventory" element={<ProtectedRoute><NurseryProvider><NurseryInventory /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/dashboard" element={<ProtectedRoute><NurseryProvider><NurseryDashboard /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/profile" element={<ProtectedRoute><NurseryProvider><NurseryProfile /></NurseryProvider></ProtectedRoute>} />
                <Route path="/crop_recommendation" element={<ProtectedRoute><CropRotationRecommendation /></ProtectedRoute>} />
                <Route path="/crop-identification" element={<ProtectedRoute><Cropidentification /></ProtectedRoute>} />
                <Route path="/crop_Rotation_AI" element={<ProtectedRoute><CropRotationPlan /></ProtectedRoute>} />
                <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                <Route path="/prices" element={<Prices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/article" element={<Article />} />
                <Route path="/soiltestingcentres" element={<SoilTestingCentres />} />
                <Route path="/TaskReminder" element={<ProtectedRoute><TaskReminder /></ProtectedRoute>} />
                <Route path="/GeminiChat" element={<ProtectedRoute><GeminiChat /></ProtectedRoute>} />
                <Route path="/SugarcaneRecognition" element={<ProtectedRoute><SugarcaneRecognition /></ProtectedRoute>} />
                <Route path="/PaddyRecognition" element={<ProtectedRoute><PaddyRecognition /></ProtectedRoute>} />
                <Route path="/DiseaseRecognition" element={<ProtectedRoute><DiseaseRecognition /></ProtectedRoute>} />
                <Route path="/PlantTaskReminder" element={<ProtectedRoute><PlantTaskReminder /></ProtectedRoute>} />
                <Route path="/Climate" element={<ProtectedRoute><Climate /></ProtectedRoute>} />
                <Route path="/MushroomEdibility" element={<MushroomEdibility />} />
                <Route path="/products" element={<Products />} />
                <Route path="/market" element={<Market />} />
                <Route path="/Auth-page" element={<AuthPage />} />
                <Route path="/whyai" element={<WhyAI />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/success" element={<OAuthSuccess />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/verify-email" element={<AccountVerificationPage />} />
                <Route path="/verification" element={<ResendVerificationPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/news" element={<NewsForum />} />
                <Route path="/ee-shops" element={<ElectricalElectronicsShops />} />
                <Route path="/BestPractices" element={<BestPractices />} />
                <Route path="/DiscussionPage" element={<DiscussionPage />} />
                {/* AgroRentAI Routes */}
                <Route path="/HeroSectionRent" element={<HeroSectionRent />} />
                <Route path="/NavigateProducts" element={<NavigateProducts />} />
                <Route path="/AgriProducts" element={<AgriProductListing />} />
                <Route path="/RentCheckoutPage" element={<ProtectedRoute><RentCheckoutPage /></ProtectedRoute>} />
                <Route path="/RentCart" element={<ProtectedRoute><RentCartPage /></ProtectedRoute>} />
                <Route path="/RentProductDetails/:productId" element={<RentProductDetails />} />
                <Route path="/RentAdminDashboard" element={<RentAdminDashboard />} />
                <Route path="/RentUserDashboard" element={<ProtectedRoute><RentUserDashboard /></ProtectedRoute>} />
                <Route path="/RentSupport" element={<RentSupportPage />} />
                {/* AgroShopAI Routes */}
                <Route path="/pesticides-shop" element={<HomeShop />} />
                <Route path="/AgroShop" element={<HomeShop />} />
                <Route path="/AgroShop/Category" element={<CategoryPage />} />
                <Route path="/AgroShop/Category/:name" element={<CategoryPage />} />
                <Route path="/AgroShop/Product/:id" element={<ProductPage />} />
                <Route path="/AgroShop/Cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/AgroShop/Wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/AgroShop/Profile" element={<ProtectedRoute><ShopProfile /></ProtectedRoute>} />
                <Route path="/AgroShop/search" element={<SearchResult />} />
                <Route path="/AgroShop/cancellation-return" element={<CancelAndReturnPolicy />} />
                <Route path="/AgroShop/terms-of-use" element={<TermsOfUse />} />
                <Route path="/AgroShop/privacy-policy" element={<ShopPrivacyPolicy />} />
                <Route path="/AgroShop/faq" element={<FAQ />} />
                <Route path="/AgroShop/grievance" element={<GrievanceRedressal />} />
                <Route path="/discussion" element={<DiscussionForum />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              {checkShop ? <ShopFooter /> : <Footer />}
            </div>
          </AuthProvider>
        </div>
      )}
    </>
  );
};

export default MainContent;
