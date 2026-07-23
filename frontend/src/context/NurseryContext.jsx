import React, { createContext, useState, useContext } from 'react';

export const NurseryContext = createContext();

export function NurseryProvider({ children }) {
  const [nursery, setNursery] = useState(null);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const resetNursery = () => {
    setNursery(null);
    setPlants([]);
    setOrders([]);
    setSelectedPlant(null);
  };

  return (
    <NurseryContext.Provider value={{
      nursery, setNursery,
      plants, setPlants,
      orders, setOrders,
      selectedPlant, setSelectedPlant,
      resetNursery,
    }}>
      {children}
    </NurseryContext.Provider>
  );
}

