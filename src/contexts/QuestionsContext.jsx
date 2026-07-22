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
      if (!user) {
        setQuestions([]);
        return;
      }
      
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
  }, [user]);

  return (
    <QuestionsContext.Provider value={{ questions, loading }}>
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  return useContext(QuestionsContext);
};
