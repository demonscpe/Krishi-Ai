import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Crop from './mains/crop/CropRecommendation';
import Cropidentification from "./mains/crop/CropIdentification";
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import Disease from './components/Disease';
import SoilQuality from './mains/soil/SoilQuality';
import SoilHub from './mains/soil/SoilHub';
import SoilImageAnalysis from './mains/soil/SoilImageAnalysis';
import SoilTestInput from './mains/soil/SoilTestInput';
import SoilHealthAnalyzer from './mains/soil/SoilHealthAnalyzer';
import SoilFertilizerRecommendation from './mains/soil/SoilFertilizerRecommendation';
import SoilDetection from './mains/soil/SoilDetection';
import SoilHealthAnalysis from './mains/soil/SoilHealthAnalysis';
import SoilHealthRating from './mains/soil/SoilHealthRating';
import SoilVisualAnalysis from './mains/soil/SoilVisualAnalysis';
import Footer from './components/Footer';
import GoTop from './components/GoTop';
import NotFound from './NotFound';
import Prices from './components/models/Prices';
import Reports from './components/models/Reports';
import AboutUs from "./components/AboutUs";
import Contributor from './pages/ContributorsPage';
import UseScrollToTop from './components/UseScrollToTop';
import Article from './pages/Article';
import TaskReminder from './mains/tools/TaskReminder';
import NPKCalculator from './mains/tools/NPKCalculator';
import GovtSchemes from './mains/tools/GovtSchemes';
import FarmerBenefits from './mains/tools/FarmerBenefits';
// RAG Chatbot is now handled by the floating AiChatbot widget (imported below)
import CropRotationRecommendation from './mains/crop/CropRotationRecommendation';
import Preloader from "./components/PreLoader";
import ProgressScrollDown from "./components/ProgressScrollDown";
import CropRotationPlan from "./mains/crop/CropRotationPlan";
import React, { useState, useEffect } from "react";
import Climate from './mains/tools/Climate';
import Products from "./pages/Products";
import Market from './pages/Market';
import AuthPage from './components/AuthPage';
import WhyAI from './pages/WhyAI';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { AuthProvider } from './context/AuthContext';
import TermsAndConditions from './components/TermsAndConditions';
import CookiePolicy from './components/CookiePolicy';
import PlantTaskReminder from './mains/tools/PlantTaskReminder';
import CodeOfConduct from './components/CodeOfConduct';
import MushroomEdibility from './mains/tools/Mushroom';
import PrivacyPolicy from './components/PrivacyPolicy';
import Licensing from './components/Licensing';
import Feedback from './components/Feedback';
import SoilTestingCentres from './components/SoilTestingCenters';
import NewsForum from './components/NewsForum';
import DiscussionPage from './components/Discussions';
//AgroRentAI
import HeroSectionRent from './AgroRentAI/HeroSectionRent';
import NavigateProducts from './AgroRentAI/NavigateProducts';
import RentUserDashboard from './AgroRentAI/RentUserDashboard';
import RentCheckoutPage from './AgroRentAI/RentCheckoutPage';
import RentCartPage from './AgroRentAI/Cart';
import RentProductDetails from './AgroRentAI/RentProductDetails';
import RentAdminDashboard from './AgroRentAI/RentAdminDashboard';
import BestPractices from './pages/BestPractices';
import Profile from './components/Profile';
import AgriProductListing from './AgroRentAI/components/AgriProductListing';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordPage from './components/ForgotPassword';
import AccountVerificationPage from './components/EmailVerification';
import OAuthSuccess from './components/OAuthSuccess';
import GeminiChat from './mains/tools/GeminiChat';
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
import { DiseaseProvider } from './context/DiseaseContext';

// Nursery Platform
import NurseryHub from './components/models/NurseryHub';
import NurserySearch from './components/models/NurserySearch';
import NurseryOrders from './components/models/NurseryOrders';
import NurseryInventory from './components/models/NurseryInventory';
import NurseryDashboard from './components/models/NurseryDashboard';
import CropHub from './components/models/CropDashboard';
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
  const normalizedPath = normalizePath(location.pathname);
  const hideNavbar = hideNavbarRoutes.includes(normalizedPath);
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
              <Navbar />
              <Routes>
                <Route path="/thank-you" element={<Feedback />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/licensing" element={<Licensing />} />
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contributor" element={<Contributor />} />
                <Route path="/about" element={<About />} />
                <Route path="/crop" element={<ProtectedRoute><Crop /></ProtectedRoute>} />
                <Route path="/water-management" element={<ProtectedRoute><WaterManagement /></ProtectedRoute>} />
                {/* Soil Hub */}
                <Route path="/soil" element={<ProtectedRoute><SoilHub /></ProtectedRoute>} />
                <Route path="/soil/image-analysis" element={<ProtectedRoute><SoilImageAnalysis /></ProtectedRoute>} />
                <Route path="/soil/test-input" element={<ProtectedRoute><SoilTestInput /></ProtectedRoute>} />
                <Route path="/soil/health-analyzer" element={<ProtectedRoute><SoilHealthAnalyzer /></ProtectedRoute>} />
                <Route path="/soil/fertilizer" element={<ProtectedRoute><SoilFertilizerRecommendation /></ProtectedRoute>} />
                <Route path="/soil/quality" element={<ProtectedRoute><SoilQuality /></ProtectedRoute>} />
                <Route path="/soil/detection" element={<ProtectedRoute><SoilDetection /></ProtectedRoute>} />
                <Route path="/soil/health-analysis" element={<ProtectedRoute><SoilHealthAnalysis /></ProtectedRoute>} />
                <Route path="/soil/health-rating" element={<ProtectedRoute><SoilHealthRating /></ProtectedRoute>} />
                <Route path="/soil/visual-analysis" element={<ProtectedRoute><SoilVisualAnalysis /></ProtectedRoute>} />
                {/* Disease Hub */}
                <Route path="/disease" element={<ProtectedRoute><DiseaseProvider><DiseaseHub /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/identify" element={<ProtectedRoute><DiseaseProvider><PlantIdentification /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/detect" element={<ProtectedRoute><DiseaseProvider><DiseaseDetection /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/severity" element={<ProtectedRoute><DiseaseProvider><DiseaseSeverity /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/treatment" element={<ProtectedRoute><DiseaseProvider><TreatmentRecommendation /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/prevention" element={<ProtectedRoute><DiseaseProvider><DiseasePrevention /></DiseaseProvider></ProtectedRoute>} />
                <Route path="/disease/chatbot" element={<ProtectedRoute><DiseaseProvider><DiseaseChatbot /></DiseaseProvider></ProtectedRoute>} />
                {/* Nursery Hub */}
                <Route path="/nursery" element={<ProtectedRoute><NurseryProvider><NurseryHub /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/search" element={<ProtectedRoute><NurseryProvider><NurserySearch /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/orders" element={<ProtectedRoute><NurseryProvider><NurseryOrders /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/inventory" element={<ProtectedRoute><NurseryProvider><NurseryInventory /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/dashboard" element={<ProtectedRoute><NurseryProvider><NurseryDashboard /></NurseryProvider></ProtectedRoute>} />
                <Route path="/nursery/profile" element={<ProtectedRoute><NurseryProvider><NurseryProfile /></NurseryProvider></ProtectedRoute>} />
                <Route path="/crop/dashboard" element={<ProtectedRoute><CropHub /></ProtectedRoute>} />
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
                <Route path="/PlantTaskReminder" element={<ProtectedRoute><PlantTaskReminder /></ProtectedRoute>} />
                <Route path="/npk-calculator" element={<ProtectedRoute><NPKCalculator /></ProtectedRoute>} />
                <Route path="/govt-schemes" element={<ProtectedRoute><GovtSchemes /></ProtectedRoute>} />
                <Route path="/farmer-benefits" element={<ProtectedRoute><FarmerBenefits /></ProtectedRoute>} />
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
                <Route path="/discussion" element={<DiscussionForum />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </AuthProvider>
        </div>
      )}
    </>
  );
};

export default MainContent;
