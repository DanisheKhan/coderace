import { supabase } from './supabase';

/**
 * Send a follow request to a target user
 */
export async function sendFollowRequest(followerId, targetUserId) {
  if (!followerId || !targetUserId || followerId === targetUserId) {
    return { error: new Error('Invalid user parameters') };
  }

  const { data, error } = await supabase
    .from('follows')
    .insert([
      {
        follower_id: followerId,
        following_id: targetUserId,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error sending follow request:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Unfollow a user or cancel a pending follow request
 */
export async function cancelFollowRequest(followerId, targetUserId) {
  if (!followerId || !targetUserId) {
    return { error: new Error('Invalid user parameters') };
  }

  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', targetUserId);

  if (error) {
    console.error('Error canceling follow request/unfollowing:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Accept or decline an incoming follow request.
 * Accepting creates a mutual follow connection so both users follow each other.
 */
export async function respondToFollowRequest(requestId, accept) {
  if (!requestId) return { error: new Error('Request ID is required') };

  if (accept) {
    // 1. Fetch request details to get follower_id & following_id
    const { data: reqData, error: fetchErr } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .eq('id', requestId)
      .single();

    if (fetchErr || !reqData) {
      console.error('Error fetching request details:', fetchErr);
      return { data: null, error: fetchErr || new Error('Request not found') };
    }

    // 2. Mark incoming request as accepted
    const { data, error } = await supabase
      .from('follows')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error accepting follow request:', error);
      return { data: null, error };
    }

    // 3. Upsert reciprocal follow row so both users follow each other (mutual connection)
    await supabase
      .from('follows')
      .upsert([
        {
          follower_id: reqData.following_id,
          following_id: reqData.follower_id,
          status: 'accepted',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'follower_id,following_id' });

    return { data, error: null };
  } else {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error declining follow request:', error);
      return { data: null, error };
    }
    return { data, error: null };
  }
}

/**
 * Get list of user IDs who have mutual follow connections with the specified user
 * Always includes self ID.
 */
export async function getConnectedUserIds(userId) {
  if (!userId) return [];

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId)
    .eq('status', 'accepted');

  const followingIds = (following || []).map(f => f.following_id);
  const followerIds = (followers || []).map(f => f.follower_id);

  // Mutual connection: user IDs that exist in both following AND followers
  const mutualIds = followingIds.filter(id => followerIds.includes(id));

  return Array.from(new Set([userId, ...mutualIds]));
}

/**
 * Check if two users are mutual followers
 */
export async function checkMutualConnection(userA, userB) {
  if (!userA || !userB) return false;
  if (userA === userB) return true;

  const connectedIds = await getConnectedUserIds(userA);
  return connectedIds.includes(userB);
}

/**
 * Get current follow status between current user and target user
 * Returns 'self' | 'none' | 'pending' | 'accepted'
 */
export async function getFollowStatus(followerId, targetUserId) {
  if (!followerId || !targetUserId) return 'none';
  if (followerId === targetUserId) return 'self';

  const { data, error } = await supabase
    .from('follows')
    .select('status')
    .eq('follower_id', followerId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (error || !data) return 'none';
  return data.status; // 'pending' | 'accepted'
}

/**
 * Get all pending incoming follow requests for a user
 */
export async function getPendingRequests(userId) {
  if (!userId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      follower:profiles!follows_follower_id_fkey(
        id,
        display_name,
        username,
        avatar_color,
        avatar_url,
        email
      )
    `)
    .eq('following_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending follow requests:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get counts of followers and following for a user
 */
export async function getFollowCounts(userId) {
  if (!userId) return { followersCount: 0, followingCount: 0 };

  const [followersRes, followingRes] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId)
      .eq('status', 'accepted'),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId)
      .eq('status', 'accepted'),
  ]);

  return {
    followersCount: followersRes.count || 0,
    followingCount: followingRes.count || 0,
  };
}

/**
 * Get list of accepted followers for a user
 */
export async function getFollowersList(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      follower:profiles!follows_follower_id_fkey(
        id,
        display_name,
        username,
        avatar_color,
        avatar_url
      )
    `)
    .eq('following_id', userId)
    .eq('status', 'accepted');

  if (error) {
    console.error('Error fetching followers list:', error);
    return [];
  }

  return data.map(item => item.follower);
}

/**
 * Get list of accepted following users for a user
 */
export async function getFollowingList(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      following:profiles!follows_following_id_fkey(
        id,
        display_name,
        username,
        avatar_color,
        avatar_url
      )
    `)
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  if (error) {
    console.error('Error fetching following list:', error);
    return [];
  }

  return data.map(item => item.following);
}
