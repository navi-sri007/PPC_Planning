import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useApi } from './useApi';

export const useAIAssistant = () => {
  const { aiMessages, setAiMessages, visualization, setVisualization } = useApp();
  const { askAI } = useApi();
  const [inputQuestion, setInputQuestion] = useState('');
  const { loadingStates } = useApp();
  const isLoading = loadingStates.ai;

  const sendMessage = useCallback(async (questionText) => {
    const trimmedQuestion = typeof questionText === 'string' ? questionText.trim() : '';
    if (!trimmedQuestion) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedQuestion,
      timestamp: new Date().toISOString()
    };
    setAiMessages(prev => [...prev, userMsg]);
    setInputQuestion('');

    try {
      const data = await askAI(trimmedQuestion);
      
      const aiMsg = {
        id: `grok-${Date.now()}`,
        sender: 'grok',
        text: data.answer,
        data: data.data,
        visualization: data.visualization,
        timestamp: new Date().toISOString()
      };
      
      setAiMessages(prev => [...prev, aiMsg]);
      
      if (data.visualization) {
        setVisualization(data.visualization);
      } else {
        setVisualization(null);
      }
    } catch (error) {
      const errorMsg = {
        id: `grok-err-${Date.now()}`,
        sender: 'grok',
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      setAiMessages(prev => [...prev, errorMsg]);
      setVisualization(null);
    }
  }, [askAI, setAiMessages, setVisualization]);

  const clearChat = useCallback(() => {
    setAiMessages([
      {
        id: 'welcome',
        sender: 'grok',
        text: "Hello! I am your AI Production Assistant. I can check available machines, list pending or near due jobs, or visualize our active schedules on a Gantt chart. How can I help you today?",
        timestamp: new Date().toISOString()
      }
    ]);
    setVisualization(null);
  }, [setAiMessages, setVisualization]);

  return {
    messages: aiMessages,
    visualization,
    inputQuestion,
    setInputQuestion,
    isLoading,
    sendMessage,
    clearChat
  };
};
