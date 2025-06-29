
interface AuthValidationData {
  email: string;
  password: string;
  isSignUp: boolean;
  fullName?: string;
  userId?: string;
}

interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const validateAuthForm = (data: AuthValidationData): ValidationResult => {
  const { email, password, isSignUp, fullName, userId } = data;

  // Email validation
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Password validation
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Sign-up specific validation
  if (isSignUp) {
    if (!fullName || fullName.trim().length < 2) {
      return { isValid: false, error: 'Full name must be at least 2 characters long' };
    }
    
    if (!userId || userId.trim().length < 3) {
      return { isValid: false, error: 'User ID must be at least 3 characters long' };
    }
    
    // Basic user ID format validation
    const userIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!userIdRegex.test(userId)) {
      return { isValid: false, error: 'User ID can only contain letters, numbers, underscores, and hyphens' };
    }
  }

  return { isValid: true, error: '' };
};
