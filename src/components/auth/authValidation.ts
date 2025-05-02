
interface ValidationParams {
  email: string;
  password: string;
  isSignUp: boolean;
  fullName?: string;
  userId?: string;
}

export const validateAuthForm = ({ email, password, isSignUp, fullName, userId }: ValidationParams): { isValid: boolean; error: string | null } => {
  if (!email || !password) {
    return { isValid: false, error: 'Email and password are required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  if (isSignUp && !fullName) {
    return { isValid: false, error: 'Full Name is required' };
  }
  return { isValid: true, error: null };
};
