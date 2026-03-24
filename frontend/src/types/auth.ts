export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  abn?: string;
  userType: 'retail' | 'trade';
  role: string;
  isActive?: boolean;
  isVerified?: boolean;
  isApproved?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  abn?: string;
  userType: 'retail' | 'trade';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
