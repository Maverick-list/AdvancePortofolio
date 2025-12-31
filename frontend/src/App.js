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

// Navbar
const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/articles', label: 'Articles', icon: FileText },
    { href: '/gallery', label: 'Gallery', icon: Image },
    { href: '/admin/login', label: 'Admin', icon: Settings },
  ];

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className={"fixed top-0 left-0 right-0 z-40 transition-all duration-500 " + (scrolled ? 'glass shadow-lg' : 'bg-transparent')}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/"><AnimatedLogo /></Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link to={link.href} className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-all font-medium hover:scale-105">
                  <link.icon className="w-4 h-4" />{link.label}
                </Link>
              </motion.div>
            ))}
            <motion.button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors" whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-4 pb-4">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-foreground/70 hover:text-foreground transition-colors">
                  <link.icon className="w-5 h-5" />{link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

// Homepage
const HomePage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.get('/portfolio');
        data.avatar_url = PROFILE_PHOTO;
        setPortfolio(data);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchPortfolio();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        <motion.div animate={{ y: [-30, 30, -30], x: [-20, 20, -20], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <motion.div animate={{ y: [30, -30, 30], x: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-hot-pink/20 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto">
            <motion.div variants={fadeInUp} className="mb-8" whileHover={{ scale: 1.05 }}>
              <motion.div animate={{ boxShadow: ["0 0 30px rgba(106, 0, 255, 0.3)", "0 0 50px rgba(255, 94, 207, 0.4)", "0 0 30px rgba(106, 0, 255, 0.3)"] }} transition={{ duration: 3, repeat: Infinity }} className="inline-block rounded-full p-1 bg-gradient-to-r from-royal-purple via-hot-pink to-royal-purple">
                <Avatar className="w-36 h-36 border-4 border-white/30">
                  <AvatarImage src={PROFILE_PHOTO} alt={portfolio?.name} />
                  <AvatarFallback className="text-4xl gradient-bg text-white">{portfolio?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </motion.div>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">{portfolio?.name || 'Miryam Abida'}</motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-white/90 mb-8 font-light">{portfolio?.title || 'Creative Developer & Designer'}</motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="btn-gradient text-white px-8 py-6 text-lg rounded-full shadow-lg" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore My Work<ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full backdrop-blur">
                  <Mail className="mr-2 w-5 h-5" />Get in Touch
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </section>

      {/* About Section */}
      {portfolio?.sections_visible?.about !== false && (
        <section id="about" className="py-24 gradient-bg-soft">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">About Me</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">Hello, I'm {portfolio?.name?.split(' ')[0] || 'Miryam'}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{portfolio?.bio}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {portfolio?.sections_visible?.skills !== false && portfolio?.skills?.length > 0 && (
        <section className="py-24 gradient-bg-page">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">My Expertise</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Skills & Technologies</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {portfolio?.skills?.map((skill, index) => (
                <motion.div key={skill.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                  <Card className="card-hover border-0 shadow-card overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">{skill.name}</span>
                        <Badge variant="outline" className="text-royal-purple border-royal-purple">{skill.category}</Badge>
                      </div>
                      <div className="relative h-2 bg-purple-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: skill.level + "%" }} viewport={{ once: true }} transition={{ duration: 1, delay: index * 0.1 }} className="absolute inset-y-0 left-0 gradient-bg rounded-full" />
                      </div>
                      <span className="text-sm text-muted-foreground mt-2 block text-right">{skill.level}%</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {portfolio?.sections_visible?.experience !== false && portfolio?.experience?.length > 0 && (
        <section className="py-24 gradient-bg-soft">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">Career Journey</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Experience</h2>
            </motion.div>
            <div className="max-w-3xl mx-auto space-y-6">
              {portfolio?.experience?.map((exp, index) => (
                <motion.div key={exp.id} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.02 }}>
                  <Card className="card-hover border-l-4 border-l-royal-purple">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <Badge variant="secondary" className="w-fit">{exp.period}</Badge>
                      </div>
                      <p className="text-royal-purple font-medium mb-2">{exp.company}</p>
                      <p className="text-muted-foreground">{exp.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {portfolio?.sections_visible?.projects !== false && portfolio?.projects?.length > 0 && (
        <section className="py-24 gradient-bg-page">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">Portfolio</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Featured Projects</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portfolio?.projects?.map((project, index) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                  <Card className="card-hover overflow-hidden border-0 shadow-card group h-full">
                    <div className="relative h-48 overflow-hidden">
                      <motion.img src={project.image} alt={project.title} className="w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags?.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {portfolio?.sections_visible?.contact !== false && (
        <section className="py-24 gradient-bg-soft">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">Get in Touch</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">Let's Work Together</h2>
              <p className="text-lg text-muted-foreground mb-12">Have a project in mind? I'd love to hear from you.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {portfolio?.contact?.email && (
                  <motion.div whileHover={{ y: -5 }}><Card className="card-hover"><CardContent className="pt-6 text-center"><div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3"><Mail className="w-6 h-6 text-white" /></div><p className="font-medium">{portfolio.contact.email}</p></CardContent></Card></motion.div>
                )}
                {portfolio?.contact?.location && (
                  <motion.div whileHover={{ y: -5 }}><Card className="card-hover"><CardContent className="pt-6 text-center"><div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3"><Home className="w-6 h-6 text-white" /></div><p className="font-medium">{portfolio.contact.location}</p></CardContent></Card></motion.div>
                )}
                {portfolio?.contact?.phone && (
                  <motion.div whileHover={{ y: -5 }}><Card className="card-hover"><CardContent className="pt-6 text-center"><div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3"><MessageCircle className="w-6 h-6 text-white" /></div><p className="font-medium">{portfolio.contact.phone}</p></CardContent></Card></motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <footer className="py-8 border-t gradient-bg-soft">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} {portfolio?.name}. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
};
