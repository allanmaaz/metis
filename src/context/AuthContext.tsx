import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParticipantAuthData, Profile } from '../types';
import {
  getStoredParticipantSession,
  clearParticipantSession,
  getStoredAdminSession,
  clearAdminSession,
} from '../services/auth';

interface AuthContextType {
  participant: ParticipantAuthData | null;
  admin: Profile | null;
  isParticipantAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  setParticipantSession: (data: ParticipantAuthData | null) => void;
  setAdminSession: (data: Profile | null) => void;
  logoutParticipant: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participant, setParticipant] = useState<ParticipantAuthData | null>(getStoredParticipantSession);
  const [admin, setAdmin] = useState<Profile | null>(getStoredAdminSession);

  useEffect(() => {
    const handleAuthChange = () => {
      setParticipant(getStoredParticipantSession());
    };
    const handleAdminChange = () => {
      setAdmin(getStoredAdminSession());
    };

    window.addEventListener('metis_auth_change', handleAuthChange);
    window.addEventListener('metis_admin_auth_change', handleAdminChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('metis_auth_change', handleAuthChange);
      window.removeEventListener('metis_admin_auth_change', handleAdminChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const logoutParticipant = () => {
    clearParticipantSession();
    setParticipant(null);
  };

  const logoutAdmin = () => {
    clearAdminSession();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        participant,
        admin,
        isParticipantAuthenticated: Boolean(participant),
        isAdminAuthenticated: Boolean(admin),
        setParticipantSession: setParticipant,
        setAdminSession: setAdmin,
        logoutParticipant,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
