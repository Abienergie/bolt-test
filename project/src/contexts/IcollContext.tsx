import React, { createContext, useContext, useState } from 'react';
import { IcollCredentials } from '../types/icoll';

interface IcollContextType {
  credentials: IcollCredentials | null;
  setCredentials: (creds: IcollCredentials | null) => void;
  isAuthenticated: boolean;
}

const IcollContext = createContext<IcollContextType | undefined>(undefined);

export function IcollProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<IcollCredentials | null>(() => {
    const saved = localStorage.getItem('icoll_credentials');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetCredentials = (creds: IcollCredentials | null) => {
    setCredentials(creds);
    if (creds) {
      localStorage.setItem('icoll_credentials', JSON.stringify(creds));
    } else {
      localStorage.removeItem('icoll_credentials');
    }
  };

  return (
    <IcollContext.Provider value={{
      credentials,
      setCredentials: handleSetCredentials,
      isAuthenticated: !!credentials
    }}>
      {children}
    </IcollContext.Provider>
  );
}

export function useIcoll() {
  const context = useContext(IcollContext);
  if (context === undefined) {
    throw new Error('useIcoll must be used within an IcollProvider');
  }
  return context;
}