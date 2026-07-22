import React, { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPromptModal from '../components/LoginPromptModal';

const cardData = [
  {
    image: 'https://storage.googleapis.com/kaggle-datasets-images/2891746/4985987/b2d60ecb83da08b41502185097895593/dataset-cover.jpeg?t=2023-02-13-07-14-27',
    title: 'Crop Recommendation',
    description: 'Find the best crops based on soil and environmental data.',
    link: '/crop',
    details: ['Nitrogen, Phosphorus, Potassium (NPK) levels', 'Soil pH and moisture levels', 'Temperature and rainfall data', 'Crop adaptability to local conditions'],
  },
  {
    image: 'https://cloudinary.propane.com/images/w_637,h_247,c_fill/f_auto,q_auto/v1651243734/website-media/PERC_Renewable-Propane_Plant-Based-Header-Image_4-29-22/PERC_Renewable-Propane_Plant-Based-Header-Image_4-29-22.jpeg',
    title: 'Crop Rotation Recommendation',
    description: 'Optimal crop rotation strategies to improve soil quality.',
    link: '/crop_recommendation',
    details: ['Balance nutrient depletion and replenishment', 'Reduce soil-borne diseases and pests', 'Maintain soil structure and organic matter', 'Climate-adapted rotation plans'],
  },
  {
    image: 'https://th.bing.com/th/id/OIP.QkxKnS7kskNm9wNwypEncwHaF7?rs=1&pid=ImgDetMain',
    title: 'Crop Price Prediction',
    description: 'Predict future prices for crops based on market trends.',
    link: '/prices',
    details: ['Historical price fluctuations', 'Supply-demand ratios by region', 'Weather impact on crop yields', 'Government policies and global trade'],
  },
  {
    image: 'https://img.freepik.com/premium-photo/digital-design-fertilization-role-nutrients-plant-soil_117255-1850.jpg',
    title: 'Fertilizer Prediction',
    description: 'Get recommendations for the best fertilizers for your crops.',
    link: '/fertilizer',
    details: ['Soil nutrient analysis-based recommendations', 'Balanced nutrient profiles per crop', 'Organic vs. synthetic guidance', 'Long-term soil health improvements'],
  },
  {
    image: 'https://th.bing.com/th/id/OIP.MjCO836ZA5dCr0AmblPAnwHaEP?rs=1&pid=ImgDetMain',
    title: 'Soil Quality Prediction',
    description: 'Analyze the quality of your soil for better yields.',
    link: '/soil',
    details: ['Organic matter content and soil texture', 'Nutrient availability and pH balance', 'Contaminant detection', 'Soil amendment recommendations'],
  },
  {
    image: 'https://th.bing.com/th/id/OIP.m5-x6mfyS59kwL_pH2L-ugHaEK?w=1000&h=562&rs=1&pid=ImgDetMain',
    title: 'Water Management',
    description: 'Determine the most effective irrigation for your farm.',
    link: '/water-management',
    details: ['Drip vs. sprinkler irrigation suitability', 'Water availability analysis', 'Soil moisture retention rates', 'Water conservation efficiency'],
  },
];

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/login');
  const [loginPromptMessage, setLoginPromptMessage] = useState('You need to login before using this feature.');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-4 font-poppins">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Our Tools</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">Explore Our Products</h1>
              <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
              <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                AI-powered tools designed to help you make data-driven farming decisions.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardData.map((card, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCard(card)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="overflow-hidden h-44">
                    <img
                      src={card.image} alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image'; }}
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-base font-bold text-slate-800 mb-1.5">{card.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                    <span className="inline-block mt-4 text-xs font-bold text-green-700 uppercase tracking-wide">
                      Learn More →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal */}
          {selectedCard && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setSelectedCard(null)}
            >
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={selectedCard.image} alt={selectedCard.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedCard.title}</h2>
                  <p className="text-sm text-slate-500 mb-4">{selectedCard.description}</p>
                  <ul className="space-y-2 mb-6">
                    {selectedCard.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">✔</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (isLoggedIn) {
                          navigate(selectedCard.link);
                        } else {
                          setLoginRedirectPath(selectedCard.link);
                          setLoginPromptMessage(`Please login to continue to ${selectedCard.title}.`);
                          setShowLoginPrompt(true);
                        }
                      }}
                      className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-all"
                    >
                      Try Now
                    </button>
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <LoginPromptModal
            open={showLoginPrompt}
            message={loginPromptMessage}
            onContinue={() => {
              setShowLoginPrompt(false);
              navigate('/login', { state: { from: loginRedirectPath } });
            }}
            onBack={() => setShowLoginPrompt(false)}
          />
        </div>
      )}
    </>
  );
};

export default Products;
