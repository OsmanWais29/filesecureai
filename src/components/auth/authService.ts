
import { supabase } from '@/lib/supabase';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  userId: string;
  avatarUrl: string | null;
  userType?: 'trustee' | 'client';
}

export const authService = {
  async signUp({ email, password, fullName, userId, avatarUrl, userType = 'trustee' }: SignUpData) {
    console.log(`Initiating signup for ${email} as ${userType}`);
    
    // First, sign up the user
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_id: userId,
          avatar_url: avatarUrl,
          user_type: userType,
        },
        emailRedirectTo: `${window.location.origin}${userType === 'trustee' ? '/login' : '/client-login'}`,
      }
    });
    
    if (signUpError) throw signUpError;

    // Only create profile if we have a user
    if (data?.user) {
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
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string, userType: 'trustee' | 'client' = 'trustee') {
    console.log(`Attempting signin for ${email} as ${userType}`);
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    console.log("Sign in successful, checking user type...");
    console.log("User type from metadata:", data.user?.user_metadata?.user_type);
    
    // Verify user type matches to prevent clients accessing trustee portal and vice versa
    if (data.user?.user_metadata?.user_type && data.user.user_metadata.user_type !== userType) {
      console.log(`User type mismatch: expected ${userType}, got ${data.user.user_metadata.user_type}`);
      await supabase.auth.signOut();
      throw new Error(`Invalid account type. Please use the ${userType === 'trustee' ? 'Trustee' : 'Client'} Portal.`);
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
    return true;
  }
};
