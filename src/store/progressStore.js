import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useProgressStore = create((set, get) => ({
  profiles: [],
  progress: [], // All progress rows for all users
  loading: false,

  fetchProfiles: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      set({ profiles: data || [] });
    } catch (err) {
      console.error('Error fetching profiles:', err.message);
    }
  },

  fetchProgress: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*');
      if (error) throw error;
      set({ progress: data || [] });
    } catch (err) {
      console.error('Error fetching progress:', err.message);
    } finally {
      set({ loading: false });
    }
  },

  upsertProgress: async (userId, questionId, updates) => {
    const { progress } = get();
    
    // Find if progress row already exists locally for this user & question
    const existingIndex = progress.findIndex(
      p => p.user_id === userId && p.question_id === questionId
    );

    let oldRow = null;
    let newRow = {
      user_id: userId,
      question_id: questionId,
      status: 'not_started',
      revisit: false,
      revisit_count: 0,
      solve_method: null,
      brute_force: false,
      approach: false,
      optimized: false,
      notes: null,
      solution_link: null,
      updated_at: new Date().toISOString(),
      ...updates
    };

    const newProgress = [...progress];

    if (existingIndex > -1) {
      oldRow = progress[existingIndex];
      let revisit_count = oldRow.revisit_count || 0;
      if (updates.revisit_count !== undefined) {
        revisit_count = updates.revisit_count;
      } else if ((updates.revisit === true && !oldRow.revisit) || (updates.status === 'revisit' && oldRow.status !== 'revisit')) {
        revisit_count += 1;
      }
      newRow = { ...oldRow, ...updates, revisit_count, updated_at: new Date().toISOString() };
      newProgress[existingIndex] = newRow;
    } else {
      let revisit_count = updates.revisit_count !== undefined ? updates.revisit_count : (updates.revisit === true || updates.status === 'revisit' ? 1 : 0);
      newRow = { ...newRow, ...updates, revisit_count, updated_at: new Date().toISOString() };
      newProgress.push(newRow);
    }

    // Optimistic update
    set({ progress: newProgress });

    try {
      // Sync to database
      const payload = {
        user_id: userId,
        question_id: questionId,
        status:      newRow.status,
        revisit:     newRow.revisit,
        revisit_count: newRow.revisit_count,
        solve_method: newRow.solve_method,
        brute_force: newRow.brute_force,
        approach:    newRow.approach,
        optimized:   newRow.optimized,
        notes:       newRow.notes,
        solution_link: newRow.solution_link,
        updated_at:  newRow.updated_at,
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id,question_id' });

      if (error) {
        // If DB schema doesn't have solve_method column yet, retry without it
        if (error.message?.includes('solve_method') || error.code === 'PGRST204') {
          delete payload.solve_method;
          await supabase.from('user_progress').upsert(payload, { onConflict: 'user_id,question_id' });
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error('Failed to sync progress to database, reverting...', err.message);
      // Revert optimistic update
      set({ progress });
    }
  },

  // Setup real-time updates for user progress and profiles
  subscribeToRealtime: () => {
    const progressChannel = supabase
      .channel('realtime-progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          const currentProgress = get().progress;

          if (eventType === 'INSERT') {
            // Check if already in list to avoid duplicates
            if (!currentProgress.some(p => p.id === newRow.id)) {
              set({ progress: [...currentProgress, newRow] });
            }
          } else if (eventType === 'UPDATE') {
            const updated = currentProgress.map(p => 
              (p.user_id === newRow.user_id && p.question_id === newRow.question_id) ? newRow : p
            );
            set({ progress: updated });
          } else if (eventType === 'DELETE') {
            const filtered = currentProgress.filter(p => p.id !== oldRow.id);
            set({ progress: filtered });
          }
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('realtime-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          const { eventType, new: newRow } = payload;
          const currentProfiles = get().profiles;

          if (eventType === 'INSERT') {
            if (!currentProfiles.some(p => p.id === newRow.id)) {
              set({ profiles: [...currentProfiles, newRow] });
            }
          } else if (eventType === 'UPDATE') {
            const updated = currentProfiles.map(p => p.id === newRow.id ? newRow : p);
            set({ profiles: updated });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(profilesChannel);
    };
  }
}));
