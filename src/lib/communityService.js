import { supabase } from './supabase';

/**
 * Fetch all communities along with member counts, pending counts, and current user's status.
 */
export async function fetchCommunities(currentUserId) {
  try {
    // 1. Fetch communities
    const { data: communities, error: commError } = await supabase
      .from('communities')
      .select('*')
      .order('is_official', { ascending: false })
      .order('created_at', { ascending: true });

    if (commError) throw commError;
    if (!communities || communities.length === 0) return [];

    // 2. Fetch all community members
    const { data: members, error: memError } = await supabase
      .from('community_members')
      .select('*');

    if (memError) throw memError;

    // 3. Process each community
    return communities.map(comm => {
      const commMembers = (members || []).filter(m => m.community_id === comm.id);
      const approvedMembers = commMembers.filter(m => m.status === 'approved');
      const pendingMembers = commMembers.filter(m => m.status === 'pending');
      const invitedMembers = commMembers.filter(m => m.status === 'invited');

      const userMembership = currentUserId
        ? commMembers.find(m => m.user_id === currentUserId)
        : null;

      return {
        ...comm,
        member_count: approvedMembers.length,
        pending_count: pendingMembers.length,
        invited_count: invitedMembers.length,
        members: commMembers,
        userStatus: userMembership ? userMembership.status : 'none',
        userRole: userMembership ? userMembership.role : 'none',
        isUserAdmin: userMembership?.role === 'admin' || comm.created_by === currentUserId,
      };
    });
  } catch (err) {
    console.error('Error in fetchCommunities:', err);
    return [];
  }
}

/**
 * Create a new community and assign creator as Admin.
 */
export async function createCommunity({ name, communityId, description, avatarColor, isPrivate = true }, creatorId) {
  try {
    const cleanId = (communityId || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    // 1. Insert community
    const { data: community, error: commError } = await supabase
      .from('communities')
      .insert([
        {
          community_id: cleanId,
          name: name.trim(),
          description: (description || '').trim(),
          avatar_color: avatarColor || '#8b5cf6',
          created_by: creatorId,
          is_official: false,
          is_private: isPrivate,
        }
      ])
      .select()
      .single();

    if (commError) throw commError;

    // 2. Add creator as approved admin
    const { error: memError } = await supabase
      .from('community_members')
      .insert([
        {
          community_id: community.id,
          user_id: creatorId,
          role: 'admin',
          status: 'approved',
        }
      ]);

    if (memError) throw memError;

    return community;
  } catch (err) {
    console.error('Error in createCommunity:', err);
    throw err;
  }
}

/**
 * Request to join a community.
 */
export async function requestToJoinCommunity(communityId, userId, autoApprove = false) {
  try {
    const status = autoApprove ? 'approved' : 'pending';
    const { data, error } = await supabase
      .from('community_members')
      .upsert([
        {
          community_id: communityId,
          user_id: userId,
          role: 'member',
          status: status,
        }
      ], { onConflict: 'community_id,user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in requestToJoinCommunity:', err);
    throw err;
  }
}

/**
 * Community Admin invites a user by User ID.
 */
export async function sendCommunityInvite(communityId, targetUserId) {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .upsert([
        {
          community_id: communityId,
          user_id: targetUserId,
          role: 'member',
          status: 'invited',
        }
      ], { onConflict: 'community_id,user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in sendCommunityInvite:', err);
    throw err;
  }
}

/**
 * User accepts a community invite.
 */
export async function acceptCommunityInvite(communityId, userId) {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .update({ status: 'approved' })
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in acceptCommunityInvite:', err);
    throw err;
  }
}

/**
 * User declines a community invite or leaves community.
 */
export async function declineOrLeaveCommunity(communityId, userId) {
  try {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error in declineOrLeaveCommunity:', err);
    throw err;
  }
}

/**
 * Community Admin approves a pending join request.
 */
export async function approveMemberRequest(communityId, targetUserId) {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .update({ status: 'approved' })
      .eq('community_id', communityId)
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error in approveMemberRequest:', err);
    throw err;
  }
}

/**
 * Community Admin rejects a pending join request.
 */
export async function rejectMemberRequest(communityId, targetUserId) {
  try {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', targetUserId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error in rejectMemberRequest:', err);
    throw err;
  }
}

/**
 * Fetch leaderboard & member list for a community.
 * Enforces privacy: returns leaderboard ONLY if user is approved member or community is public.
 */
export async function fetchCommunityLeaderboard(community, currentUserId, profiles = [], progress = [], questions = []) {
  try {
    if (!community) return { allowed: false, members: [] };

    // Check privacy
    const isApprovedMember = (community.members || []).some(
      m => m.user_id === currentUserId && m.status === 'approved'
    );
    const isPublic = !community.is_private || community.is_official;

    if (!isPublic && !isApprovedMember && community.created_by !== currentUserId) {
      return { allowed: false, members: [] };
    }

    // Get all approved members
    const { data: memberRows, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', community.id)
      .eq('status', 'approved');

    if (error) throw error;
    if (!memberRows) return { allowed: true, members: [] };

    const totalQuestionsCount = questions.length || 1;

    const rankedMembers = memberRows.map(mem => {
      const profile = profiles.find(p => p.id === mem.user_id) || {
        id: mem.user_id,
        display_name: 'Unknown Racer',
        avatar_color: '#8b5cf6',
      };

      const userDone = progress.filter(p => p.user_id === mem.user_id && p.status === 'done');
      const solvedCount = userDone.length;
      const pct = Math.round((solvedCount / totalQuestionsCount) * 100);

      return {
        ...profile,
        role: mem.role,
        joined_at: mem.joined_at,
        solved: solvedCount,
        pct: pct,
      };
    }).sort((a, b) => b.solved - a.solved);

    return { allowed: true, members: rankedMembers };
  } catch (err) {
    console.error('Error in fetchCommunityLeaderboard:', err);
    return { allowed: false, members: [] };
  }
}
