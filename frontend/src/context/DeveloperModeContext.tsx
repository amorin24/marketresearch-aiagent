import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DeveloperModeContextType {
  compactView: boolean;
  toggleCompactView: () => void;
  showRawJson: boolean;
  toggleRawJson: () => void;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (!context) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
  }
  return context;
};

interface DeveloperModeProviderProps {
  children: ReactNode;
}

export const DeveloperModeProvider: React.FC<DeveloperModeProviderProps> = ({ children }) => {
  const [compactView, setCompactView] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(true);

  const toggleCompactView = () => {
    setCompactView(prev => !prev);
  };

  const toggleRawJson = () => {
    setShowRawJson(prev => !prev);
  };

  const value = {
    compactView,
    toggleCompactView,
    showRawJson,
    toggleRawJson
  };

  return (
    <DeveloperModeContext.Provider value={value}>
      {children}
    </DeveloperModeContext.Provider>
  );
};
