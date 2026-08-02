import React from 'react';
import SoilVisionBase from './SoilVisionBase';

const SoilVisualAnalysis = () => (
  <SoilVisionBase
    title="Soil Visual Analysis"
    subtitle="Analyze color, texture, moisture, erosion risk, and tillage recommendations from a soil image."
    mode="visual_analysis"
    badge="AI visual soil analysis"
    accent="rose"
    features={[
      'Color (Munsell estimation)',
      'Texture & aggregate structure',
      'Moisture estimation',
      'Erosion risk & tillage advice',
    ]}
    howItWorks={[
      { step: '1', title: 'Upload soil photo', desc: 'Capture the soil surface' },
      { step: '2', title: 'AI visual analysis', desc: 'Color, texture & moisture' },
      { step: '3', title: 'Get management tips', desc: 'Erosion risk & tillage advice' },
    ]}
  />
);

export default SoilVisualAnalysis;

