import React from 'react';
import { motion } from 'framer-motion';

// Replace these with your actual asset imports
import croppingImg from '../assets/cropinspection.png';
import fertilizingImg from '../assets/irrigation.jpg'; 
import pestControlImg from '../assets/tp.png'; 
import waterManagementImg from '../assets/img11.jpg'; 
// Assuming these exist or use placeholders
// import soilImg from '../assets/soil.jpg'; 
// import livestockImg from '../assets/livestock.jpg';
// import postHarvestImg from '../assets/harvest.jpg';
// import agroforestryImg from '../assets/trees.jpg';

const bestPractices = [
    {
      title: 'Best Practices for Cropping',
      description: 'Proper cropping techniques ensure sustainable and productive farming. Implement diverse strategies like crop rotation to maximize yield.',
      img: croppingImg,
      subtopics: [
        { subtitle: '1. Crop Rotation', details: 'Rotate crops to break pest cycles and replenish nitrogen naturally.' },
        { subtitle: '2. Intercropping', details: 'Grow multiple crops together to optimize space and reduce weeds.' },
        { subtitle: '3. Cover Cropping', details: 'Plant off-season crops to prevent erosion and suppress weeds.' },
        { subtitle: '4. Selecting Crop Varieties', details: 'Choose disease-resistant varieties appropriate for your local climate.' },
      ],
    },
    {
      title: 'Water Management',
      description: 'Implement smart irrigation and rainwater harvesting to ensure adequate hydration without resource waste.',
      img: waterManagementImg,
      subtopics: [
        { subtitle: '1. Smart Irrigation', details: 'Use drip systems with moisture sensors for precise water delivery.' },
        { subtitle: '2. Rainwater Harvesting', details: 'Capture and store rainwater to reduce dependence on groundwater.' },
        { subtitle: '3. Moisture Monitoring', details: 'Use sensors to prevent over-watering and minimize nutrient runoff.' },
        { subtitle: '4. Water Conservation', details: 'Apply mulching to retain soil moisture and reduce evaporation.' },
      ],
    },
    {
      title: 'Fertilizing Techniques',
      description: 'Understand soil needs through testing and use balanced nutrients to provide optimal growth.',
      img: fertilizingImg,
      subtopics: [
        { subtitle: '1. Soil Testing', details: 'Determine nutrient deficiencies to ensure crops receive the right N-P-K levels.' },
        { subtitle: '2. Organic vs. Inorganic', details: 'Use compost for soil structure and inorganic for rapid nutrient delivery.' },
        { subtitle: '3. Micro Nutrients', details: 'Address deficiencies in zinc and manganese for total plant health.' },
        { subtitle: '4. Timing of Application', details: 'Apply fertilizers during peak growth stages to maximize absorption.' },
      ],
    },
    {
      title: 'Pest Control Strategies',
      description: 'Maintain healthy crops using integrated management and natural predators.',
      img: pestControlImg,
      subtopics: [
        { subtitle: '1. IPM Systems', details: 'Combine biological and physical tools to manage pests sustainably.' },
        { subtitle: '2. Biological Control', details: 'Encourage natural predators like ladybugs to control harmful pests.' },
        { subtitle: '3. Cultural Practices', details: 'Alter planting times to naturally avoid peak pest population seasons.' },
        { subtitle: '4. Selective Pesticide Use', details: 'Apply targeted pesticides only when necessary to protect beneficial insects.' },
      ],
    },
    {
      title: 'Soil Health & Conservation',
      description: 'The foundation of farming lies in the soil. Protect its structure and microbial life for long-term fertility.',
      img: waterManagementImg, // Replace with soilImg
      subtopics: [
        { subtitle: '1. No-Till Farming', details: 'Avoid heavy plowing to keep soil structure intact and store carbon.' },
        { subtitle: '2. Mulching', details: 'Cover soil with organic matter to regulate temperature and retain moisture.' },
        { subtitle: '3. Green Manure', details: 'Grow specific plants to plow back into the soil to boost organic content.' },
        { subtitle: '4. pH Management', details: 'Regularly adjust soil acidity/alkalinity to ensure nutrient availability.' },
      ],
    },
    {
      title: 'Livestock Integration',
      description: 'Combine animal husbandry with crop production to create a closed-loop nutrient cycle.',
      img: croppingImg, // Replace with livestockImg
      subtopics: [
        { subtitle: '1. Rotational Grazing', details: 'Move livestock between pastures to prevent overgrazing and fertilize land.' },
        { subtitle: '2. Manure Management', details: 'Convert animal waste into high-quality organic fertilizer for fields.' },
        { subtitle: '3. Silvopasture', details: 'Combine trees with forage and livestock for better animal welfare.' },
        { subtitle: '4. Animal Health', details: 'Focus on preventative care and natural feed to reduce antibiotic use.' },
      ],
    },
    {
      title: 'Post-Harvest Handling',
      description: 'Reduce waste after the harvest by improving storage, transport, and processing techniques.',
      img: fertilizingImg, // Replace with postHarvestImg
      subtopics: [
        { subtitle: '1. Proper Drying', details: 'Ensure grains and crops are dried to specific levels to prevent mold.' },
        { subtitle: '2. Cold Storage', details: 'Use temperature-controlled environments to extend the shelf life of produce.' },
        { subtitle: '3. Sorting and Grading', details: 'Categorize produce to minimize contamination and maximize market value.' },
        { subtitle: '4. Efficient Packaging', details: 'Use breathable, eco-friendly materials to protect food during transport.' },
      ],
    },
    {
      title: 'Agroforestry Practices',
      description: 'Incorporate trees into your landscape to improve microclimates and provide secondary income.',
      img: pestControlImg, // Replace with agroforestryImg
      subtopics: [
        { subtitle: '1. Alley Cropping', details: 'Plant crops between rows of trees to reduce wind erosion and create shade.' },
        { subtitle: '2. Windbreaks', details: 'Plant rows of trees to protect sensitive crops from high wind damage.' },
        { subtitle: '3. Riparian Buffers', details: 'Use trees along water bodies to filter runoff and protect water quality.' },
        { subtitle: '4. Multi-Story Cropping', details: 'Utilize vertical space by growing shade-tolerant crops under fruit trees.' },
      ],
    },
];

const BestPractices = () => {
  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-14 pt-20 pb-16 mx-auto bg-gradient-to-b from-green-50 to-white font-poppins antialiased">
      
      {/* Header Section - Exactly 36px */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">Farming Guide</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">
          Best Practices in Sustainable Farming
        </h2>
        <div className="h-1 w-16 bg-green-600 mx-auto rounded-full mb-5" />
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          A comprehensive guide to modern agriculture — mastering these 8 pillars ensures long-term productivity, environmental health, and economic stability.
        </p>
      </motion.div>

      {/* Responsive Grid for 8 items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {bestPractices.map((practice, index) => (
          <motion.div 
            key={index} 
            className="bg-white shadow-lg rounded-[2rem] p-8 border border-green-100 hover:border-green-300 transition-all flex flex-col justify-between"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div>
              {/* Image Section */}
              <div className="relative h-60 w-full rounded-2xl overflow-hidden mb-6 shadow-md">
                <img 
                  src={practice.img} 
                  alt={practice.title} 
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-green-700 mb-3">{practice.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">{practice.description}</p>
              
              {/* Subtopics Grid */}
              <div className="grid grid-cols-1 gap-6">
                {practice.subtopics.map((subtopic, subIndex) => (
                  <div key={subIndex} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      {subIndex + 1}
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-green-800 mb-1 group-hover:text-green-600 transition-colors">
                        {subtopic.subtitle.replace(/^\d\.\s/, '')}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{subtopic.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BestPractices;