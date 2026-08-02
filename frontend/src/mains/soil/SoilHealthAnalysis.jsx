import React from 'react';
import SoilVisionBase from './SoilVisionBase';

const SoilHealthAnalysis = () => (
  <SoilVisionBase
    title="Soil Health Analysis"
    subtitle="Get a full soil profile — type, color, texture, health, and next steps for testing or improvement."
    mode="health_analysis"
    badge="AI soil health analysis"
    accent="blue"
    features={[
      'Soil type & color detection',
      'Texture characteristics',
      'Estimated soil health & structure',
      'Confidence level & crop suitability',
    ]}
    howItWorks={[
      { step: '1', title: 'Upload soil photo', desc: 'Capture a well-lit soil sample' },
      { step: '2', title: 'AI analyzes health', desc: 'Detects type, texture & structure' },
      { step: '3', title: 'Get next steps', desc: 'Testing or improvement guidance' },
    ]}
  />
);

export default SoilHealthAnalysis;

