import React from 'react';
import SoilVisionBase from './SoilVisionBase';

const SoilHealthRating = () => (
  <SoilVisionBase
    title="Soil Health Rating"
    subtitle="Assess visible structure, organic matter, compaction, and biological indicators to rate your soil's health."
    mode="health_rating"
    badge="AI health rating"
    accent="emerald"
    features={[
      'Structure analysis (granular, blocky, platy)',
      'Organic matter indicators',
      'Compaction & biological signs',
      'Excellent / Good / Fair / Poor rating',
    ]}
    howItWorks={[
      { step: '1', title: 'Upload soil photo', desc: 'Show the soil surface clearly' },
      { step: '2', title: 'AI assesses health', desc: 'Structure, organic matter & biology' },
      { step: '3', title: 'Get rating + advice', desc: 'Health rating & organic fixes' },
    ]}
  />
);

export default SoilHealthRating;

