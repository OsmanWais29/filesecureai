
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
        emailRedirectTo: window.location.origin,
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
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Verify user type matches to prevent clients accessing trustee portal and vice versa
    if (data.user?.user_metadata?.user_type && data.user.user_metadata.user_type !== userType) {
      await supabase.auth.signOut();
      throw new Error(`Invalid account type. Please use the ${userType === 'trustee' ? 'Trustee' : 'Client'} Portal.`);
    }
    
    return data;
  },

  async signOut() {
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
    
    // Force a full page reload to ensure all auth state is completely cleared
    window.location.href = '/';
    
    return true;
  }
};
