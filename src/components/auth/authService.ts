
import { supabase } from '@/lib/supabase';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  userId: string;
  avatarUrl: string | null;
  userType?: 'trustee' | 'client';
  metadata?: Record<string, any>;
}

// Simplified subdomain detection
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // For localhost testing
  if (hostname === 'localhost') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // For actual domain with subdomains
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
  return null;
};

// Simplified email validation for trustees
const isTrusteeEmail = (email: string): boolean => {
  // For development, allow all emails
  if (window.location.hostname === 'localhost') {
    return true;
  }
  
  // In production, you can add specific domain validation here
  const allowedDomains = [
    'trustee.com',
    'securefilesai.com',
    'gmail.com', // For testing
    'outlook.com',
    'hotmail.com'
  ];
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(emailDomain);
};

export const authService = {
  async signUp({ email, password, fullName, userId, avatarUrl, userType, metadata = {} }: SignUpData) {
    // Auto-detect user type from subdomain if not provided
    if (!userType) {
      const subdomain = getSubdomain();
      userType = subdomain === 'client' ? 'client' : 'trustee';
    }
    
    console.log(`Signing up ${email} as ${userType}`);
    
    // Validate email domain for trustees (simplified)
    if (userType === 'trustee' && !isTrusteeEmail(email)) {
      throw new Error("This email domain is not authorized for trustee accounts.");
    }
    
    // Prepare user metadata
    const userData = {
      full_name: fullName,
      user_id: userId,
      avatar_url: avatarUrl,
      user_type: userType,
      ...metadata
    };
    
    // Sign up the user
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      }
    });
    
    if (signUpError) throw signUpError;

    // Create profile if user was created
    if (data?.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            user_id: userId,
            avatar_url: avatarUrl,
            email: email,
            user_type: userType,
            phone: metadata?.phone,
            address: metadata?.address,
            occupation: metadata?.occupation,
            income: metadata?.income,
            preferred_contact: metadata?.preferred_contact
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      } catch (profileError) {
        console.error("Failed to create profile:", profileError);
      }
    }

    return data;
  },

  async signIn(email: string, password: string, userType?: 'trustee' | 'client') {
    // Auto-detect user type from subdomain if not provided
    if (!userType) {
      const subdomain = getSubdomain();
      userType = subdomain === 'client' ? 'client' : 'trustee';
    }
    
    console.log(`Signing in ${email} as ${userType}`);
    
    // Sign in
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // Check user type after successful login
    const userMetadataType = data.user?.user_metadata?.user_type;
    
    if (!userMetadataType) {
      // If no user type in metadata, update it
      console.log("No user type found, setting to:", userType);
      try {
        await supabase.auth.updateUser({
          data: { user_type: userType }
        });
        
        // Update the returned data
        if (data.user) {
          data.user.user_metadata = {
            ...data.user.user_metadata,
            user_type: userType
          };
        }
      } catch (updateError) {
        console.error("Failed to update user metadata:", updateError);
      }
    } else if (userMetadataType !== userType) {
      // User type mismatch
      console.log(`User type mismatch: expected ${userType}, got ${userMetadataType}`);
      await supabase.auth.signOut();
      throw new Error(`This account cannot access the ${userType === 'trustee' ? 'Trustee' : 'Client'} Portal.`);
    }
    
    return data;
  },

  async signOut() {
    console.log("Signing out user...");
    
    // Clear storage
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    } catch (e) {
      console.log('Error clearing storage:', e);
    }
    
    // Sign out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log("Sign out successful");
    return true;
  }
};
