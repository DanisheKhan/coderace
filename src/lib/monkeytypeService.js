import { supabase } from './supabase';

/**
 * Fetches typing stats directly from Monkeytype API using user's ApeKey.
 * @param {string} apeKey 
 */
export async function fetchMonkeytypeData(apeKey) {
  if (!apeKey || !apeKey.trim()) {
    throw new Error('Monkeytype ApeKey is required.');
  }

  const cleanKey = apeKey.trim();
  const headers = {
    'Authorization': `ApeKey ${cleanKey}`,
    'Accept': 'application/json',
  };

  try {
    // Fetch personal bests for time mode
    const pbRes = await fetch('https://api.monkeytype.com/users/personalBests?mode=time', { headers });
    if (!pbRes.ok) {
      if (pbRes.status === 401) {
        throw new Error('Invalid ApeKey or unauthorized access.');
      }
      throw new Error(`Monkeytype API error: ${pbRes.status} ${pbRes.statusText}`);
    }
    const pbJson = await pbRes.json();

    // Fetch general user stats
    const statsRes = await fetch('https://api.monkeytype.com/users/stats', { headers });
    let statsData = {};
    if (statsRes.ok) {
      const statsJson = await statsRes.json();
      statsData = statsJson.data || {};
    }

    const pbData = pbJson.data || {};

    // Parse PBs for 15, 30, 60, 120 modes
    const getPB = (duration) => {
      const list = pbData[duration];
      if (!list || !list.length) return { wpm: null, acc: null, consistency: null };
      
      // Find the best wpm test in the array
      let best = list[0];
      for (const item of list) {
        if (item.wpm > best.wpm) {
          best = item;
        }
      }
      return { 
        wpm: Math.round(best.wpm * 10) / 10, 
        acc: Math.round(best.acc * 10) / 10,
        consistency: best.consistency ? Math.round(best.consistency * 10) / 10 : null
      };
    };

    const pb15 = getPB('15');
    const pb30 = getPB('30');
    const pb60 = getPB('60');
    const pb120 = getPB('120');

    return {
      wpm_15: pb15.wpm,
      acc_15: pb15.acc,
      consistency_15: pb15.consistency,
      wpm_30: pb30.wpm,
      acc_30: pb30.acc,
      consistency_30: pb30.consistency,
      wpm_60: pb60.wpm,
      acc_60: pb60.acc,
      consistency_60: pb60.consistency,
      wpm_120: pb120.wpm,
      acc_120: pb120.acc,
      consistency_120: pb120.consistency,
      tests_started: statsData.startedTests || 0,
      tests_completed: statsData.completedTests || 0,
      time_typing: Math.round(statsData.timeTyping || 0),
    };
  } catch (err) {
    console.error('Error fetching Monkeytype data:', err);
    throw err;
  }
}

/**
 * Saves or updates user's cached stats in Supabase typing_profiles table
 */
export async function syncTypingProfileToSupabase(userId, parsedStats) {
  if (!userId) return;

  const payload = {
    user_id: userId,
    wpm_15: parsedStats.wpm_15,
    acc_15: parsedStats.acc_15,
    consistency_15: parsedStats.consistency_15,
    wpm_30: parsedStats.wpm_30,
    acc_30: parsedStats.acc_30,
    consistency_30: parsedStats.consistency_30,
    wpm_60: parsedStats.wpm_60,
    acc_60: parsedStats.acc_60,
    consistency_60: parsedStats.consistency_60,
    wpm_120: parsedStats.wpm_120,
    acc_120: parsedStats.acc_120,
    consistency_120: parsedStats.consistency_120,
    tests_started: parsedStats.tests_started,
    tests_completed: parsedStats.tests_completed,
    time_typing: parsedStats.time_typing,
    last_synced: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('typing_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting typing_profile to Supabase:', error.message);
    throw error;
  }

  return data;
}

/**
 * Fetches cached typing profile from Supabase for a single user
 */
export async function getTypingProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('typing_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching typing profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetches all cached typing profiles from Supabase for leaderboard
 */
export async function getAllTypingProfiles() {
  const { data, error } = await supabase
    .from('typing_profiles')
    .select('*');

  if (error) {
    console.error('Error fetching all typing profiles:', error.message);
    return [];
  }
  return data || [];
}
