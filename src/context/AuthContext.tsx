// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userData: UserData | null;
  logout: () => Promise<void>;
  updateUserData: (data: UserData) => void;
}

interface UserData {
  name?: string;
  email?: string;
  photoURL?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  userData: null,
  logout: async () => {},
  updateUserData: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, try to load user data from storage
        const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
          } catch (error) {
            console.error('Failed to parse user data', error);
          }
        } else {
          // Create basic user data if none exists
          const newUserData: UserData = {
            name: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
          };
          
          // Save to storage
          localStorage.setItem('userData', JSON.stringify(newUserData));
          setUserData(newUserData);
        }
        
        // Store auth token for future sessions
        localStorage.setItem('userToken', user.uid);
      } else {
        // User is signed out
        setUserData(null);
      }
      
      setIsLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Update user data
  const updateUserData = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };
  
  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };
  
  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    userData,
    logout,
    updateUserData,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};