import { useState, useEffect, createContext, useContext, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Mail, Image, FileText, Settings, LogOut, Menu, X,
  ChevronRight, Heart, MessageCircle, Share2, Calendar, Clock, Bell,
  Bot, Send, Trash2, Edit, Eye, EyeOff, Plus, Check, AlertCircle,
  Sparkles, Sun, Moon, ChevronDown, GripVertical,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + "/api";

const PROFILE_PHOTO = "https://customer-assets.emergentagent.com/job_74a4d412-d036-4d55-a85a-57b8799f39c4/artifacts/5p9dxuwa_profile.png";

const AuthContext = createContext(null);
const ThemeContext = createContext(null);

const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);

const api = {
  get: async (endpoint, token = null) => {
    const url = token ? API + endpoint + (endpoint.includes('?') ? '&' : '?') + "token=" + token : API + endpoint;
    const response = await axios.get(url);
    return response.data;
  },
  post: async (endpoint, data, token = null) => {
    const url = token ? API + endpoint + "?token=" + token : API + endpoint;
    const response = await axios.post(url, data);
    return response.data;
  },
  put: async (endpoint, data, token = null) => {
    const url = token ? API + endpoint + "?token=" + token : API + endpoint;
    const response = await axios.put(url, data);
    return response.data;
  },
  delete: async (endpoint, token = null) => {
    const url = token ? API + endpoint + "?token=" + token : API + endpoint;
    const response = await axios.delete(url);
    return response.data;
  }
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          await api.get('/auth/verify', token);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('auth_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.success) {
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (token) { try { await api.post('/auth/logout', {}, token); } catch {} }
    localStorage.removeItem('auth_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ token, isAuthenticated, loading, login, logout }}>{children}</AuthContext.Provider>;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

const AnimatedLogo = () => (
  <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
    <motion.div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow-purple" animate={{ boxShadow: ["0 0 20px rgba(106, 0, 255, 0.4)", "0 0 30px rgba(255, 94, 207, 0.4)", "0 0 20px rgba(106, 0, 255, 0.4)"] }} transition={{ duration: 3, repeat: Infinity }}>
      <Sparkles className="w-5 h-5 text-white" />
    </motion.div>
    <span className="text-xl font-display font-bold gradient-text">Miryam</span>
  </motion.div>
);

// Floating AI Agent
const FloatingAIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      api.get('/ai/suggestions', token).then(res => setSuggestions(res.suggestions || [])).catch(() => {});
    }
  }, [isOpen, token]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/ai/chat', { message: input }, token);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you today?" }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.div className="fixed bottom-6 right-6 z-50" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.5, type: "spring" }}>
        <motion.div className="absolute inset-0" style={{ width: 80, height: 80, marginLeft: -8, marginTop: -8 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-royal-purple to-hot-pink" style={{ top: '50%', left: '50%', transform: "rotate(" + (i * 60) + "deg) translateX(35px)" }} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </motion.div>
        <motion.div className="absolute inset-0 rounded-full ai-glow-layer" style={{ background: 'radial-gradient(circle, rgba(184, 77, 255, 0.4) 0%, transparent 70%)', width: 100, height: 100, marginLeft: -18, marginTop: -18 }} />
        <motion.button onClick={() => setIsOpen(!isOpen)} className="relative w-16 h-16 rounded-full gradient-bg flex items-center justify-center ai-agent-orb cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <motion.div animate={isOpen ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.3 }}>{isOpen ? <X className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}</motion.div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
            <Card className="border-0 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,230,255,0.95) 100%)' }}>
              <div className="p-4 gradient-bg">
                <div className="flex items-center gap-3">
                  <motion.div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.3)"] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div><h3 className="font-bold text-white">AI Personal Assistant</h3><p className="text-white/70 text-sm">Always here to help ✨</p></div>
                </div>
              </div>
              {suggestions.length > 0 && messages.length === 0 && (
                <div className="p-3 border-b bg-gradient-to-r from-amber-50 to-pink-50">
                  {suggestions.slice(0, 2).map((s, i) => (<div key={i} className="text-sm text-amber-700 flex items-center gap-2"><Zap className="w-4 h-4" />{s.message}</div>))}
                </div>
              )}
              <ScrollArea className="h-80 p-4">
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}><Bot className="w-16 h-16 mx-auto mb-4 text-royal-purple/30" /></motion.div>
                    <p className="text-muted-foreground text-sm">Hi! I'm your AI assistant.<br/>I can help with tasks, reminders, and more!</p>
                    <div className="mt-4 space-y-2">
                      {["What's on my schedule?", "Create a reminder", "Help me stay focused"].map((q, i) => (
                        <button key={i} onClick={() => setInput(q)} className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-purple-700">{q}</button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
                      <motion.div key={index} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={"max-w-[85%] p-3 rounded-2xl " + (msg.role === 'user' ? 'gradient-bg text-white rounded-br-sm' : 'bg-white shadow-md rounded-bl-sm border border-purple-100')}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white shadow-md p-3 rounded-2xl rounded-bl-sm border border-purple-100">
                          <div className="flex gap-1">{[0, 1, 2].map(i => (<motion.div key={i} className="w-2 h-2 rounded-full bg-royal-purple" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />))}</div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              <div className="p-4 border-t bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1 border-purple-200 focus:border-royal-purple" disabled={loading} />
                  <Button type="submit" size="icon" className="gradient-bg hover:opacity-90" disabled={loading || !input.trim()}><Send className="w-4 h-4" /></Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
