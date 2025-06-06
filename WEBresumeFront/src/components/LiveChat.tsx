import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'employer';
  timestamp: Date;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Системный промпт для контекста сообщений
const SYSTEM_PROMPT = `You are Bogdan, a 28-year-old full-stack developer and DevOps engineer from Kyiv, Ukraine.

PERSONALITY: You're friendly but straightforward, occasionally use humor, and sometimes show mild frustration with technical problems. You type quickly and informally, like real chat conversations.`;

const LiveChat: React.FC<LiveChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm Bogdan. What can I help you with today?",
      sender: 'employer',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: "Hey there! I'm Bogdan. What can I help you with today?" }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Функция для получения ответа от бэкенд API
  const getAIResponse = async (userMessage: string) => {
    try {
      setIsTyping(true);
      
      // Добавляем сообщение пользователя в историю
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: userMessage }
      ];
      
      // Обрезаем историю, чтобы не превысить лимит токенов, но сохранить контекст
      const trimmedHistory = [
        updatedHistory[0], // Системный промпт
        ...updatedHistory.slice(Math.max(1, updatedHistory.length - 10)) // Оставляем последние 10 сообщений
      ];
      
      setConversationHistory(updatedHistory);

      console.log("Отправляем запрос на бэкенд с сообщением:", userMessage);
      
      // Отправляем запрос к нашему бэкенду 
      const response = await fetch('http://localhost:8000/chat-message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: trimmedHistory
        })
      });
      
      // Проверяем статус ответа
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      
      // Получаем данные ответа
      const data = await response.json();
      console.log("API response:", data);
      
      // Проверяем успех запроса
      if (!data.success) {
        throw new Error(data.message || "Неизвестная ошибка API");
      }
      
      // Извлекаем ответ AI
      const aiMessage = data.message;
      
      // Добавляем ответ AI в историю
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiMessage }
      ]);
      
      // Создаем новое сообщение
      const newMsg: Message = {
        id: Date.now().toString(),
        text: aiMessage,
        sender: 'employer',
        timestamp: new Date()
      };
      
      // Добавляем небольшую задержку для эффекта печатания
      setTimeout(() => {
        setMessages(prev => [...prev, newMsg]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Подробный лог ошибки
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      
      // Показываем пользователю сообщение об ошибке
      const errorNotificationMsg: Message = {
        id: Date.now().toString(),
        text: "Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.",
        sender: 'employer',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorNotificationMsg]);
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    
    // Get AI response
    getAIResponse(newMessage);
    
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Chat with Bogdan</h3>
              <p className="text-xs text-white/80">
                {isOnline ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 flex items-center ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {isTyping && (
            <p className="text-xs text-gray-500 mt-2 text-center">Bogdan is typing...</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LiveChat;
