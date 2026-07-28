import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const QuestionsContext = createContext({});

export const QuestionsProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('id', { ascending: true }); // Fetch in insert/id order to preserve the seeded sequence

        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error('Error fetching questions:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    const channel = supabase
      .channel('realtime-questions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuestions(prev => {
              if (prev.some(q => q.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q));
          } else if (payload.eventType === 'DELETE') {
            setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addQuestion = async (questionData) => {
    try {
      const maxSrNo = questions.length > 0 ? Math.max(...questions.map(q => q.sr_no || 0)) : 0;
      const creatorName = questionData.created_by_name || profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'User';
      const payload = {
        sr_no: maxSrNo + 1,
        phase: questionData.phase || 'Phase 1',
        topic: questionData.topic || 'Added Questions',
        subtopic: questionData.subtopic || 'General',
        problem_name: questionData.problem_name,
        link: questionData.link || null,
        difficulty: parseInt(questionData.difficulty, 10) || 1,
        is_custom: questionData.is_custom !== undefined ? questionData.is_custom : true,
        created_by: user?.id || profile?.id || null,
        created_by_name: creatorName,
      };

      const { data, error } = await supabase
        .from('questions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setQuestions(prev => {
          if (prev.some(q => q.id === data.id)) return prev;
          return [...prev, data];
        });
      }
      return { data, error: null };
    } catch (err) {
      console.error('Error adding question:', err.message);
      return { data: null, error: err };
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      return { error: null };
    } catch (err) {
      console.error('Error deleting question:', err.message);
      return { error: err };
    }
  };

  return (
    <QuestionsContext.Provider value={{ questions, loading, addQuestion, deleteQuestion }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  return useContext(QuestionsContext);
};

