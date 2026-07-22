import React, { createContext, useState, useContext } from 'react';

export const DiseaseContext = createContext();

export function DiseaseProvider({ children }) {
  const [plant, setPlant] = useState(null);
  const [disease, setDisease] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [prevention, setPrevention] = useState(null);

  const resetDisease = () => {
    setPlant(null);
    setDisease(null);
    setSeverity(null);
    setTreatment(null);
    setPrevention(null);
  };

  return (
    <DiseaseContext.Provider value={{
      plant, setPlant,
      disease, setDisease,
      severity, setSeverity,
      treatment, setTreatment,
      prevention, setPrevention,
      resetDisease,
    }}>
      {children}
    </DiseaseContext.Provider>
  );
}

