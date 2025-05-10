
interface AuthFormValues {
  email: string;
  password: string;
  isSignUp: boolean;
  fullName?: string;
  userId?: string;
  estateNumber?: string;
}

interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const validateAuthForm = (values: AuthFormValues): ValidationResult => {
  const { email, password, isSignUp, fullName, estateNumber } = values;

  // Email validation
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Password validation
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters'
    };
  }

  // Additional signup validations
  if (isSignUp) {
    if (!fullName || fullName.trim().length < 2) {
      return {
        isValid: false,
        error: 'Full name is required'
      };
    }
    
    // Validate estate number for signup
    if (!estateNumber || estateNumber.trim().length === 0) {
      return {
        isValid: false,
        error: 'Estate number is required'
      };
    }
  }

  return {
    isValid: true,
    error: ''
  };
};
