import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import { useBeastMode } from '../context/BeastModeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const welcomeMessage: Message = {
  id: 'welcome-msg',
  role: 'assistant',
  content: "Hey champion! 💪 I'm your AI fitness coach. Ask me about workout programming, nutrition strategies, recovery protocols, or anything fitness-related. I analyze your training data in real-time to give you personalized advice.",
  timestamp: new Date()
};

const getAIResponse = (input: string, beastMode: boolean): string => {
  const lowerInput = input.toLowerCase();

  if (beastMode) {
    if (lowerInput.includes('workout') || lowerInput.includes('train')) {
      return "No more excuses. Your chest and triceps are FRESH. Get under the bar and push until your arms shake. I want 4 sets of heavy bench, 3 sets incline, finish with burnout pushups. GO.";
    }
    if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('nutrition')) {
      return "You need 2,800 kcal minimum for your bulk. Stop eating like a bird. 6 eggs morning, 200g chicken lunch, paneer + dal + rice dinner. Whey before bed. No negotiation.";
    }
    if (lowerInput.includes('recovery') || lowerInput.includes('sleep') || lowerInput.includes('rest')) {
      return "Your body is screaming for rest but your mind is weak. Sleep 8 hours or don't bother showing up tomorrow. Ice bath, foam roll, 3g omega-3. NOW.";
    }
    return "Champions don't ask questions, they find answers. Your readiness is at 82%. You're READY. Stop scrolling and start lifting. 🔥";
  }

  if (lowerInput.includes('workout') || lowerInput.includes('train')) {
    return "Based on your recent training data, your chest and triceps have the lowest fatigue scores right now. I'd recommend a push-focused session today. Want me to generate an optimized workout plan?";
  }
  if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('nutrition')) {
    return "Your current caloric intake should be around 2,400 kcal for your bulking phase. I recommend a 40/35/25 protein/carb/fat split. For Indian meals, try: Paneer Bhurji (32g protein), Dal Tadka with Brown Rice, and a Whey shake post-workout.";
  }
  if (lowerInput.includes('recovery') || lowerInput.includes('sleep') || lowerInput.includes('rest')) {
    return "Recovery is where gains are made! 🧠 Your HRV data suggests moderate fatigue. I recommend 7.5+ hours of sleep tonight, and consider a light mobility session instead of heavy lifting tomorrow.";
  }
  if (lowerInput.includes('plateau')) {
    return "I've detected a potential plateau in your bench press over the last 3 weeks. Your RPE has been consistently at 9+ with no volume increase. Here's my recommendation: Drop to 85% of your working weight for one week (deload), then resume with a modified rep scheme of 4x6 instead of 3x8.";
  }
  return "Great question! Based on your training profile and biometric data, I'd suggest focusing on progressive overload this week. Your readiness score is at 82% — you're primed for a strong session. 🔥";
};

export const AICoach = ({ beastMode: propBeastMode }: { beastMode?: boolean } = {}) => {
  const { beastMode: contextBeastMode } = useBeastMode();
  const beastMode = propBeastMode ?? contextBeastMode;
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleAutoSubmit(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakMessage = (messageId: string, content: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleAutoSubmit = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(userMessage.content, beastMode),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAutoSubmit(inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] text-white overflow-hidden pb-[65px]">
      {/* Header */}
      <header className="flex-none p-4 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7000FF] to-[#00F0FF] p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#00F0FF]" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-green-400 animate-ping absolute opacity-75"></div>
            </div>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold flex items-center gap-2">
              FitAura AI Coach
              <Sparkles className="w-4 h-4 text-[#7000FF]" />
            </h1>
            <p className="text-xs text-white/50 font-mono">JARVIS Online • Analyzing data</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' ? (
                <div className="flex items-end gap-2 max-w-[85%] relative">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#7000FF] to-[#00F0FF] p-[1px]">
                    <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl rounded-bl-sm text-sm text-white/90 shadow-[0_0_15px_rgba(112,0,255,0.1)] leading-relaxed group relative pr-6">
                      {message.content}
                      <button
                        onClick={() => speakMessage(message.id, message.content)}
                        className={`absolute -right-3 -top-3 w-8 h-8 rounded-full bg-[#0A0A0F] border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${speakingMessageId === message.id ? 'opacity-100 shadow-[0_0_10px_#00F0FF] border-[#00F0FF]/50' : 'hover:bg-white/10'}`}
                        title="Read aloud"
                      >
                        <Volume2 className={`w-4 h-4 ${speakingMessageId === message.id ? 'text-[#00F0FF]' : 'text-white/70'}`} />
                      </button>
                    </div>
                    <span className="text-[10px] text-white/40 ml-1 font-mono">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 items-end max-w-[85%]">
                  <div className="bg-gradient-to-r from-[#7000FF] to-[#5000CC] p-3.5 rounded-2xl rounded-br-sm text-sm text-white shadow-[0_0_20px_rgba(112,0,255,0.3)] leading-relaxed">
                    {message.content}
                  </div>
                  <span className="text-[10px] text-white/40 mr-1 font-mono">{formatTime(message.timestamp)}</span>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex justify-start w-full"
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#7000FF] to-[#00F0FF] p-[1px]">
                  <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl rounded-bl-sm flex items-center gap-1.5 h-[46px]">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-[#0A0A0F]/90 backdrop-blur-2xl border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          {hasSpeechSupport && (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex-none w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          )}
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7000FF] to-[#00F0FF] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your AI coach anything..."
              className="relative w-full bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#7000FF]/50 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="flex-none w-12 h-[50px] bg-gradient-to-r from-[#7000FF] to-[#5000CC] text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(112,0,255,0.5)] transition-all active:scale-95"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
