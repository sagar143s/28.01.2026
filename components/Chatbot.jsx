'use client'
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! 👋 I'm your Qui shopping assistant. I can help you find products, learn about offers, answer questions about shipping, returns, and more! How can I help you today?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim()) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // Build conversation history (last 10 messages for context)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const { data } = await axios.post('/api/chatbot', {
                message: inputMessage,
                conversationHistory
            });

            const assistantMessage = {
                role: 'assistant',
                content: data.message,
                timestamp: data.timestamp
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage = {
                role: 'assistant',
                content: "I apologize, but I'm having trouble responding right now. Please try again or contact our support team for assistance.",
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error('Failed to get response. Please try again.');
        } finally {
            setIsTyping(false);
        }
    };

    const quickQuestions = [
        "What products do you have?",
        "Any offers or discounts?",
        "How does shipping work?",
        "What's your return policy?"
    ];

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-110 group"
                    aria-label="Open chat"
                >
                    <div className="relative">
                        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                    </div>
                    <div className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Chat with Qui AI
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Bot size={24} />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600"></span>
                            </div>
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    Qui AI
                                    <Sparkles size={16} className="text-yellow-300" />
                                </h3>
                                <p className="text-xs text-purple-100">Powered by Qui AI</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-2 rounded-full transition-colors"
                            aria-label="Close chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot size={18} className="text-white" />
                                        </div>
                                    )}
                                    
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                                : msg.isError
                                                ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.content}
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                            msg.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={18} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex gap-2 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                        <Bot size={18} className="text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions - Show only initially */}
                        {messages.length <= 1 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs text-gray-500 font-medium px-2">Quick questions:</p>
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickQuestion(question)}
                                        className="w-full text-left text-sm px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-gray-700"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isTyping}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2.5 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                aria-label="Send message"
                            >
                                {isTyping ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            AI responses may not always be accurate. Verify important details.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
