export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  skills?: string[];
  profilePicture?: string;
  isFreelancer?: boolean;
  isSeller?: boolean;
  isBuyer?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  wallet?: {
    balance: number;
    currency: string;
    pendingWithdrawals?: number;
  };
  notifications?: Notification[];
  verified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}
