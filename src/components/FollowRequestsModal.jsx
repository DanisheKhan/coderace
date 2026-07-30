import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, Check, X } from 'lucide-react';
import { getPendingRequests, respondToFollowRequest } from '../lib/followService';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

export default function FollowRequestsModal({ isOpen, onClose, userId, onRequestHandled }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await getPendingRequests(userId);
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchRequests();
    }
  }, [isOpen, userId]);

  const handleAction = async (requestId, accept) => {
    setProcessingId(requestId);
    const { error } = await respondToFollowRequest(requestId, accept);
    if (!error) {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      if (onRequestHandled) onRequestHandled();
    }
    setProcessingId(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="show"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] cursor-default"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#09090b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Follow Requests
                </h3>
                {requests.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full font-mono">
                    {requests.length}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Requests List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar min-h-[220px]">
            {loading ? (
              <div className="py-12 text-center text-zinc-500 space-y-2 font-mono">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-1 font-mono">
                <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-zinc-300 text-xs">No pending requests</p>
                <p className="text-[10px] text-zinc-500">
                  When someone requests to follow your profile, their request will appear here.
                </p>
              </div>
            ) : (
              requests.map(req => {
                const follower = req.follower || {};
                const displayName = follower.display_name || follower.username || 'Racer';
                const username = follower.username ? `@${follower.username}` : '';
                const avatarColor = follower.avatar_color || '#6366f1';

                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden border border-zinc-700 shrink-0 shadow-sm"
                        style={{ backgroundColor: follower.avatar_url ? 'transparent' : avatarColor }}
                      >
                        {follower.avatar_url ? (
                          <img src={follower.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAction(req.id, true)}
                        disabled={processingId === req.id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(req.id, false)}
                        disabled={processingId === req.id}
                        className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 hover:text-white rounded-lg font-medium text-xs flex items-center gap-1 transition-all border border-zinc-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
