export type AdminRole = 'superadmin' | 'admin';

export interface IAdmin {
  _id?: string;
  Id?: string;
  Name: string;
  Email: string;
  Role: AdminRole;
  Phone?: string;
  ProfileImage?: string;
  IsActive: boolean;
  LastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ApiResponse<T = unknown> {
  Success?: boolean;
  success?: boolean;
  Message?: string;
  message?: string;
  Data?: T;
  data?: T;
  Pagination?: IPagination;
}

export interface IPagination {
  Total: number;
  Page: number;
  Limit: number;
  TotalPages: number;
}

// Request & Response Types

// 1. Signup
export interface SignupRequest {
  Name: string;
  Email: string;
  Password: string;
  Phone?: string;
  Role?: AdminRole;
  ProfileImage?: string; // base64 string or image URL
}

export interface SignupResponseData {
  Admin: IAdmin;
  Token: string;
}

// 2. Login
export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponseData {
  Token: string;
}


// 4. Update Profile
export interface UpdateProfileRequest {
  Name?: string;
  Phone?: string;
  ProfileImage?: string; // base64 string or image URL
}

// 5. Change Password
export interface ChangePasswordRequest {
  CurrentPassword: string;
  NewPassword: string;
}

// 6. Get All Admins (Superadmin only)
export interface GetAllAdminsParams {
  Page?: number;
  Limit?: number;
}

export interface GetAllAdminsResponse {
  Success: boolean;
  Data: IAdmin[];
  Pagination: IPagination;
}

// 7. Update Admin Status/Role (Superadmin only)
export interface UpdateAdminStatusRequest {
  id: string;
  IsActive?: boolean;
  Role?: AdminRole;
}

// Auth State in Redux
export interface AuthState {
  token: string | null;
  admin: IAdmin | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthRootState {
  auth?: AuthState;
}
