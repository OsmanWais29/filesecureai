
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

// Helper function to detect subdomain
const getSubdomain = (): string | null => {
  const hostParts = window.location.hostname.split('.');
  
  // For localhost testing
  if (hostParts.includes('localhost')) {
    const urlParams = new URLSearchParams(window.location.search);
    const subdomain = urlParams.get('subdomain');
    return subdomain;
  }
  
  // For actual domain with subdomains
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
  return null;
};

// Helper function to validate trustee email domains
const isTrusteeEmail = (email: string): boolean => {
  // List of allowed domains for trustees
  // This is a simplified example - in production, you might want to 
  // fetch this list from a database or configuration
  const allowedDomains = [
    'trustee.com',
    'securefilesai.com',
    'example.com',
    'gmail.com',     // For testing purposes
    'hotmail.com',   // For testing purposes
    'yahoo.com',     // For testing purposes
    'outlook.com',   // For testing purposes
    'test.com',      // Additional testing domain
    'ai',            // Additional testing domain
    'me.com'         // Additional testing domain
  ];
  
  // For development/testing purposes, allow all emails
  if (window.location.hostname === 'localhost') {
    console.log("Development environment detected, allowing all email domains");
    return true;
  }
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  console.log("Checking email domain:", emailDomain);
  
  return allowedDomains.includes(emailDomain);
};

export const authService = {
  async signUp({ email, password, fullName, userId, avatarUrl, userType, metadata = {} }: SignUpData) {
    // If userType isn't explicitly provided, infer it from the subdomain
    if (!userType) {
      const subdomain = getSubdomain();
      userType = subdomain === 'client' ? 'client' : 'trustee';
    }
    
    console.log(`Initiating signup for ${email} as ${userType}`);
    
    // Validate email domain for trustees
    if (userType === 'trustee' && !isTrusteeEmail(email)) {
      throw new Error("This email domain is not authorized for trustee accounts. Please use an approved email address.");
    }
    
    // Combine all metadata fields
    const userData = {
      full_name: fullName,
      user_id: userId,
      avatar_url: avatarUrl,
      user_type: userType,
      ...metadata
    };
    
    // First, sign up the user
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });
    
    if (signUpError) throw signUpError;

    // Only create profile if we have a user
    if (data?.user) {
      try {
        // Create profile for the user even though they haven't confirmed email yet
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            user_id: userId,
            avatar_url: avatarUrl,
            email: email,
            user_type: userType,
            // Add additional profile data if present in metadata
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
        // We don't throw here to ensure signup still completes
      }
    }

    return data;
  },

  async signIn(email: string, password: string, userType?: 'trustee' | 'client') {
    // If userType isn't explicitly provided, infer it from the subdomain
    if (!userType) {
      const subdomain = getSubdomain();
      userType = subdomain === 'client' ? 'client' : 'trustee';
    }
    
    console.log(`Attempting signin for ${email} as ${userType}`);
    
    // For localhost/testing, bypass email domain validation
    if (window.location.hostname !== 'localhost') {
      // For trustee logins, verify email domain is allowed
      if (userType === 'trustee' && !isTrusteeEmail(email)) {
        console.log(`Email domain not authorized for trustee: ${email}`);
        throw new Error("This email is not authorized to access the Trustee Portal. Please use an approved email address.");
      }
    }
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    console.log("Sign in successful, checking user type...");
    const userMetadataType = data.user?.user_metadata?.user_type;
    console.log("User type from metadata:", userMetadataType);
    
    // Verify user type matches to prevent clients accessing trustee portal and vice versa
    if (userMetadataType && userMetadataType !== userType) {
      console.log(`User type mismatch: expected ${userType}, got ${userMetadataType}`);
      await supabase.auth.signOut();
      throw new Error(`This account cannot access the ${userType === 'trustee' ? 'Trustee' : 'Client'} Portal. Please use the correct portal for your account type.`);
    }
    
    console.log(`User type verified as ${userType}`);
    return data;
  },

  async signOut() {
    console.log("Signing out user...");
    
    // Clean up local storage and session storage
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    } catch (e) {
      console.log('Error clearing storage:', e);
    }
    
    // Call Supabase signOut method
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log("Sign out successful");
    
    // Redirect based on subdomain
    const subdomain = getSubdomain();
    if (subdomain === 'client') {
      window.location.href = '/login';
    } else {
      window.location.href = '/login';
    }
    
    return true;
  }
};
