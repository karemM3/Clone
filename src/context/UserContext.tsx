import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/User';

export type UserRole = 'buyer' | 'seller' | 'both';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: Partial<User> & { password: string, role: UserRole }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateProfilePicture: (imageFile: File) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  setupTwoFactorAuth: () => Promise<{secret: string, qrCodeUrl: string}>;
  verifyTwoFactorAuth: (token: string) => Promise<boolean>;
  enableTwoFactorAuth: () => Promise<void>;
  disableTwoFactorAuth: (token: string) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('workit_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('workit_user');
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to authenticate
      // Simulating successful login for now
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email,
        createdAt: new Date().toISOString(),
        isBuyer: true,
        isSeller: false,
        wallet: {
          balance: 0,
          currency: 'TND',
          pendingWithdrawals: 0
        },
        notifications: [],
        verified: true,
        rating: 0,
        reviewCount: 0
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('workit_user', JSON.stringify(mockUser));
      } else {
        // Use sessionStorage instead for non-persistent sessions
        sessionStorage.setItem('workit_user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string, role: UserRole }) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to register
      // Simulating successful registration for now
      const { password, role, ...userDataWithoutPassword } = userData;

      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name: userData.name || '',
        email: userData.email || '',
        createdAt: new Date().toISOString(),
        isBuyer: role === 'buyer' || role === 'both',
        isSeller: role === 'seller' || role === 'both',
        wallet: {
          balance: 0,
          currency: 'TND',
          pendingWithdrawals: 0
        },
        notifications: [],
        verified: false, // New users start unverified
        ...userDataWithoutPassword,
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('workit_user', JSON.stringify(mockUser));

      // In a real app, we would trigger a verification email here
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('workit_user');
    sessionStorage.removeItem('workit_user');
  };

  const updateUser = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update in local storage or session storage
      if (localStorage.getItem('workit_user')) {
        localStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('workit_user')) {
        sessionStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (imageFile: File) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // In a real app, this would upload the image to a server
      // Simulating a successful upload by creating a data URL
      const reader = new FileReader();

      return new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          try {
            const updatedUser = {
              ...user,
              profilePicture: reader.result as string
            };

            setUser(updatedUser);

            // Update in local storage or session storage
            if (localStorage.getItem('workit_user')) {
              localStorage.setItem('workit_user', JSON.stringify(updatedUser));
            }
            if (sessionStorage.getItem('workit_user')) {
              sessionStorage.setItem('workit_user', JSON.stringify(updatedUser));
            }

            setIsLoading(false);
            resolve();
          } catch (err) {
            setIsLoading(false);
            reject(err);
          }
        };

        reader.onerror = () => {
          setIsLoading(false);
          reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Update profile picture error:', error);
      throw new Error('Failed to update profile picture.');
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // In a real app, this would verify the token with the server
      // For now, just mark the user as verified
      if (token === 'mock-verification-token') {
        const updatedUser = { ...user, verified: true };
        setUser(updatedUser);

        // Update in local storage or session storage
        if (localStorage.getItem('workit_user')) {
          localStorage.setItem('workit_user', JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem('workit_user')) {
          sessionStorage.setItem('workit_user', JSON.stringify(updatedUser));
        }
      } else {
        throw new Error('Invalid verification token');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would send a password reset email
      // For now, just log a message
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmResetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would verify the token and update the password
      // For now, just log a message
      if (token !== 'mock-reset-token') {
        throw new Error('Invalid reset token');
      }
      console.log(`Password reset successful for token ${token}`);
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setupTwoFactorAuth = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // In a real app, this would generate a secret and QR code URL
      // For now, return mock data
      return {
        secret: 'MOCK2FASECRET',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/WorkiT:' + user.email + '?secret=MOCK2FASECRET&issuer=WorkiT'
      };
    } catch (error) {
      console.error('2FA setup error:', error);
      throw new Error('Failed to setup two-factor authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactorAuth = async (token: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would verify the token against the user's secret
      // For now, just check if it's a specific value
      return token === '123456';
    } catch (error) {
      console.error('2FA verification error:', error);
      throw new Error('Failed to verify two-factor authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactorAuth = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);

      // Update in local storage or session storage
      if (localStorage.getItem('workit_user')) {
        localStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('workit_user')) {
        sessionStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw new Error('Failed to enable two-factor authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactorAuth = async (token: string) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // Verify the token first
      const isValid = await verifyTwoFactorAuth(token);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);

      // Update in local storage or session storage
      if (localStorage.getItem('workit_user')) {
        localStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('workit_user')) {
        sessionStorage.setItem('workit_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateProfilePicture,
        verifyEmail,
        resetPassword,
        confirmResetPassword,
        setupTwoFactorAuth,
        verifyTwoFactorAuth,
        enableTwoFactorAuth,
        disableTwoFactorAuth,
        isLoading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
