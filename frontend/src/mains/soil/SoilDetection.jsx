import React from 'react';
import SoilVisionBase from './SoilVisionBase';

const SoilDetection = () => (
  <SoilVisionBase
    title="Soil Detection & Classification"
    subtitle="Identify soil types (sandy, loam, clay, silt, chalky, peaty) and discover which crops thrive in your soil."
    mode="detection"
    badge="AI soil classification"
    accent="amber"
    features={[
      'Soil type classification',
      'Texture & mineral properties',
      'Drainage & compaction risk',
      'Crop suitability list',
    ]}
    howItWorks={[
      { step: '1', title: 'Upload soil photo', desc: 'Take a clear photo of your soil' },
      { step: '2', title: 'AI classifies the soil', desc: 'Detects type, texture & drainage' },
      { step: '3', title: 'Get crop list', desc: 'See which crops thrive in your soil' },
    ]}
  />
);

export default SoilDetection;

