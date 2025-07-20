import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, ToastMessage } from '../types';

interface UseAuthProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

export function useAuth({ addToast }: UseAuthProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found'
      addToast(`Error fetching profile: ${error.message}`, 'error');
    } else if (data) {
      setProfile(data);
    } else {
      // First-time user, profile doesn't exist yet. Prompt them to create one.
      setShowProfileModal(true);
    }
  }, [addToast]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    addToast("You have been logged out.", 'info');
  };
  
  const updateProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return {
    session,
    user,
    profile,
    isLoading,
    showProfileModal,
    setShowProfileModal,
    handleLogout,
    updateProfile
  };
}
