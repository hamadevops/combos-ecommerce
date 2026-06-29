export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'editor';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
