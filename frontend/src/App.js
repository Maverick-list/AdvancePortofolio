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

// Articles Page
const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles?published_only=true').then(setArticles).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLike = async (articleId) => {
    try {
      await api.post("/articles/" + articleId + "/like");
      setArticles(articles.map(a => a.id === articleId ? { ...a, likes: (a.likes || 0) + 1 } : a));
    } catch {}
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 gradient-bg-page">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="mb-4 gradient-bg text-white px-4 py-1">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">My Articles</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Thoughts, insights, and stories from my journey</p>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1, 2, 3].map(i => (<Card key={i} className="overflow-hidden"><Skeleton className="h-48 w-full" /><CardContent className="pt-4"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>))}</div>
        ) : articles.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12 card-hover"><CardContent><FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="text-xl font-semibold mb-2">No Articles Yet</h3><p className="text-muted-foreground">Check back soon for new content!</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                <Card className="card-hover overflow-hidden h-full flex flex-col">
                  {article.cover_image && (<div className="relative h-48 overflow-hidden"><img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" /></div>)}
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleLike(article.id)} className="flex items-center gap-1 text-muted-foreground hover:text-hot-pink transition-colors"><Heart className="w-4 h-4" /><span className="text-sm">{article.likes || 0}</span></button>
                        <span className="flex items-center gap-1 text-muted-foreground"><MessageCircle className="w-4 h-4" /><span className="text-sm">{article.comments?.length || 0}</span></span>
                      </div>
                      <Link to={"/articles/" + article.id}><Button variant="ghost" size="sm" className="text-royal-purple">Read More <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Article Page
const ArticlePage = () => {
  const articleId = useLocation().pathname.split('/').pop();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({ author_name: '', content: '' });

  useEffect(() => {
    api.get("/articles/" + articleId).then(setArticle).catch(console.error).finally(() => setLoading(false));
  }, [articleId]);

  const handleLike = async () => {
    try { await api.post("/articles/" + articleId + "/like"); setArticle({ ...article, likes: (article.likes || 0) + 1 }); } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.author_name || !comment.content) return;
    try {
      const response = await api.post("/articles/" + articleId + "/comment", comment);
      setArticle({ ...article, comments: [...(article.comments || []), response.comment] });
      setComment({ author_name: '', content: '' });
    } catch {}
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;
  if (!article) return <div className="min-h-screen pt-24 flex items-center justify-center gradient-bg-page"><Card className="max-w-md text-center p-8 card-hover"><AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Article Not Found</h2><p className="text-muted-foreground mb-4">The article doesn't exist.</p><Link to="/articles"><Button className="gradient-bg text-white">Back to Articles</Button></Link></Card></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 gradient-bg-page">
      <article className="container mx-auto px-4 max-w-3xl">
        {article.cover_image && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl overflow-hidden mb-8 shadow-lg"><img src={article.cover_image} alt={article.title} className="w-full h-64 md:h-96 object-cover" /></motion.div>)}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-6">{article.title}</motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-6 mb-8 pb-8 border-b">
          <button onClick={handleLike} className="flex items-center gap-2 text-muted-foreground hover:text-hot-pink transition-colors"><Heart className="w-5 h-5" /><span>{article.likes || 0} likes</span></button>
          <span className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="w-5 h-5" /><span>{article.comments?.length || 0} comments</span></span>
          <button onClick={() => navigator.share?.({ title: article.title, url: window.location.href })} className="flex items-center gap-2 text-muted-foreground hover:text-royal-purple transition-colors"><Share2 className="w-5 h-5" /><span>Share</span></button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content }} />
        <div className="border-t pt-8">
          <h3 className="text-2xl font-display font-bold mb-6">Comments</h3>
          <form onSubmit={handleComment} className="mb-8">
            <div className="grid gap-4">
              <Input placeholder="Your name" value={comment.author_name} onChange={(e) => setComment({ ...comment, author_name: e.target.value })} className="border-purple-200" />
              <Textarea placeholder="Write a comment..." value={comment.content} onChange={(e) => setComment({ ...comment, content: e.target.value })} rows={3} className="border-purple-200" />
              <Button type="submit" className="gradient-bg text-white w-fit">Post Comment</Button>
            </div>
          </form>
          <div className="space-y-4">
            {article.comments?.map((c, i) => (
              <Card key={c.id || i} className="card-hover"><CardContent className="pt-4"><div className="flex items-center gap-3 mb-2"><Avatar className="w-8 h-8"><AvatarFallback className="gradient-bg text-white text-xs">{c.author_name?.charAt(0)?.toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{c.author_name}</span><span className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span></div><p className="text-foreground/80">{c.content}</p></CardContent></Card>
            ))}
          </div>
        </div>
      </article>
    </motion.div>
  );
};

// Gallery Page
const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    api.get('/gallery?visible_only=true').then(setPhotos).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 gradient-bg-page">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge className="mb-4 gradient-bg text-white px-4 py-1">Gallery</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">Photo Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Moments captured through my lens</p>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.03 }} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-card" onClick={() => setSelectedPhoto(photo)}>
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {photo.caption && (<div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"><p className="text-sm font-medium">{photo.caption}</p></div>)}
              </motion.div>
            ))}
          </div>
        )}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
            {selectedPhoto && (<div className="relative"><img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full h-auto max-h-[80vh] object-contain" />{selectedPhoto.caption && (<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"><p className="text-white text-lg">{selectedPhoto.caption}</p></div>)}</div>)}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

// Admin Login
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/admin/dashboard'); }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await login(credentials.username, credentials.password);
      if (success) navigate('/admin/dashboard');
      else setError('Invalid credentials');
    } catch { setError('Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient opacity-40" />
      <motion.div animate={{ y: [-20, 20, -20], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-20 w-64 h-64 rounded-full bg-royal-purple/20 blur-3xl" />
      <motion.div animate={{ y: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-hot-pink/20 blur-3xl" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,230,255,0.95) 100%)' }}>
          <div className="h-2 gradient-bg" />
          <CardHeader className="text-center pb-2 pt-8">
            <motion.div className="mx-auto mb-4" whileHover={{ scale: 1.05 }}><AnimatedLogo /></motion.div>
            <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
            <CardDescription>Sign in to your admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
              <div className="space-y-2"><Label htmlFor="username">Username</Label><Input id="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} placeholder="Enter your username" className="border-purple-200 focus:border-royal-purple" required /></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} placeholder="Enter your password" className="border-purple-200 focus:border-royal-purple" required /></div>
              <Button type="submit" className="w-full gradient-bg text-white py-6" disabled={loading}>
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Sparkles className="w-4 h-4 mr-2" />Sign In</>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-6"><Link to="/" className="text-sm text-muted-foreground hover:text-royal-purple transition-colors flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" />Back to Portfolio</Link></CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// Admin Layout
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { logout, token } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) api.get('/notifications', token).then(data => setNotifications(data.filter(n => !n.read).slice(0, 5))).catch(() => {});
  }, [token]);

  const handleLogout = async () => { await logout(); navigate('/admin/login'); };

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Overview' },
    { path: '/admin/portfolio', icon: User, label: 'Portfolio Editor' },
    { path: '/admin/ai-agent', icon: Bot, label: 'AI Personal Agent' },
    { path: '/admin/tasks', icon: Calendar, label: 'Tasks & Reminders' },
    { path: '/admin/writing', icon: FileText, label: 'Writing Studio' },
    { path: '/admin/gallery', icon: Image, label: 'Photo Gallery' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, rgba(240,235,255,1) 0%, rgba(255,245,250,1) 50%, rgba(240,235,255,1) 100%)' }}>
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 280 : 80 }} className="fixed left-0 top-0 h-screen z-40 flex flex-col" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.95) 100%)', borderRight: '1px solid rgba(106, 0, 255, 0.1)' }}>
        <div className="p-4 border-b border-purple-100 flex items-center justify-between">
          {sidebarOpen ? <AnimatedLogo /> : <motion.div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center" whileHover={{ scale: 1.05 }}><Sparkles className="w-5 h-5 text-white" /></motion.div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-purple-100 transition-colors">{sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={item.path} className={"flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 " + (isActive ? 'sidebar-active bg-gradient-to-r from-royal-purple/10 to-transparent text-royal-purple font-medium' : 'text-muted-foreground hover:bg-purple-50 hover:text-foreground')}>
                    <item.icon className={"w-5 h-5 flex-shrink-0 " + (isActive ? 'text-royal-purple' : '')} />{sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-purple-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"><LogOut className="w-5 h-5" />{sidebarOpen && <span>Logout</span>}</button>
        </div>
      </motion.aside>
      <main className={"flex-1 " + (sidebarOpen ? 'ml-[280px]' : 'ml-20') + " transition-all duration-300"}>
        <header className="sticky top-0 z-30 px-6 py-3 glass">
          <div className="flex items-center justify-between">
            <motion.h1 className="text-xl font-semibold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</motion.h1>
            <div className="flex items-center gap-3">
              <motion.button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-purple-100 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</motion.button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-purple-100 transition-colors"><Bell className="w-5 h-5" />{notifications.length > 0 && <motion.span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-hot-pink" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />}</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80"><div className="p-3 border-b"><h3 className="font-semibold">Notifications</h3></div>{notifications.length === 0 ? <div className="p-4 text-center text-muted-foreground">No new notifications</div> : notifications.map(n => (<DropdownMenuItem key={n.id} className="p-3"><div><p className="font-medium text-sm">{n.title}</p><p className="text-xs text-muted-foreground">{n.message}</p></div></DropdownMenuItem>))}</DropdownMenuContent>
              </DropdownMenu>
              <motion.div whileHover={{ scale: 1.05 }}><Avatar className="w-9 h-9 border-2 border-royal-purple/20"><AvatarImage src={PROFILE_PHOTO} /><AvatarFallback className="gradient-bg text-white">MA</AvatarFallback></Avatar></motion.div>
            </div>
          </div>
        </header>
        <div className="p-6"><AnimatePresence mode="wait">{children}</AnimatePresence></div>
      </main>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/stats', token), api.get('/ai/suggestions', token)])
      .then(([statsData, suggestionsData]) => { setStats(statsData); setSuggestions(suggestionsData.suggestions || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { label: 'Total Tasks', value: stats?.tasks?.total || 0, icon: Calendar, color: 'from-royal-purple to-hot-pink' },
    { label: 'Published Articles', value: stats?.articles?.published || 0, icon: FileText, color: 'from-hot-pink to-rose-pink' },
    { label: 'Gallery Photos', value: stats?.gallery?.total || 0, icon: Image, color: 'from-soft-lavender to-royal-purple' },
    { label: 'AI Memories', value: stats?.ai_memories?.total || 0, icon: Bot, color: 'from-deep-purple to-royal-purple' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative p-8 animated-gradient">
            <div className="relative z-10">
              <motion.h2 className="text-3xl font-display font-bold text-white mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>Welcome back, Miryam! ✨</motion.h2>
              <motion.p className="text-white/80" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>Here's what's happening with your portfolio today.</motion.p>
            </div>
            <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute right-8 top-1/2 -translate-y-1/2"><Sparkles className="w-24 h-24 text-white/20" /></motion.div>
          </div>
        </Card>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} whileHover={{ y: -5 }}>
            <Card className="border-0 shadow-card overflow-hidden card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground mb-1">{stat.label}</p>{loading ? <Skeleton className="w-12 h-8" /> : <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 + index * 0.1 }} className="text-3xl font-bold">{stat.value}</motion.p>}</div>
                  <motion.div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + stat.color + " flex items-center justify-center"} whileHover={{ scale: 1.1, rotate: 5 }}><stat.icon className="w-6 h-6 text-white" /></motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(106, 0, 255, 0.3)", "0 0 20px rgba(255, 94, 207, 0.4)", "0 0 10px rgba(106, 0, 255, 0.3)"] }} transition={{ duration: 2, repeat: Infinity }}><Bot className="w-5 h-5 text-white" /></motion.div>
                <CardTitle>AI Suggestions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{suggestions.map((suggestion, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className={"p-4 rounded-lg " + (suggestion.type === 'urgent' ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200' : suggestion.type === 'reminder' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-gradient-to-r from-purple-50 to-pink-50')}><p className="text-sm">{suggestion.message}</p></motion.div>))}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ to: '/admin/writing', icon: FileText, title: 'Write New Article', desc: 'Share your thoughts', gradient: 'from-royal-purple to-hot-pink' }, { to: '/admin/tasks', icon: Plus, title: 'Add New Task', desc: 'Stay organized', gradient: 'from-hot-pink to-rose-pink' }, { to: '/admin/ai-agent', icon: Bot, title: 'Chat with AI', desc: 'Your personal assistant', gradient: 'from-deep-purple to-royal-purple' }].map((action, index) => (
          <motion.div key={action.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} whileHover={{ y: -5 }}>
            <Link to={action.to}><Card className="border-0 shadow-card cursor-pointer h-full card-hover"><CardContent className="p-6 flex items-center gap-4"><motion.div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + action.gradient + " flex items-center justify-center"} whileHover={{ scale: 1.1, rotate: 5 }}><action.icon className="w-6 h-6 text-white" /></motion.div><div><h3 className="font-semibold">{action.title}</h3><p className="text-sm text-muted-foreground">{action.desc}</p></div></CardContent></Card></Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Portfolio Editor
const PortfolioEditor = () => {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => { api.get('/portfolio').then(setPortfolio).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSave = async () => { setSaving(true); try { await api.put('/portfolio', portfolio, token); } catch {} finally { setSaving(false); } };
  const updateField = (field, value) => { setPortfolio({ ...portfolio, [field]: value }); };

  if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-display font-bold">Portfolio Editor</h2><p className="text-muted-foreground">Customize your public portfolio</p></div>
        <div className="flex gap-3">
          <Link to="/" target="_blank"><Button variant="outline" className="border-purple-200"><Eye className="w-4 h-4 mr-2" />Preview</Button></Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Button onClick={handleSave} disabled={saving} className="gradient-bg text-white">{saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" /> : <Check className="w-4 h-4 mr-2" />}Save Changes</Button></motion.div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl bg-purple-100/50">
          <TabsTrigger value="basic">Basic Info</TabsTrigger><TabsTrigger value="skills">Skills</TabsTrigger><TabsTrigger value="experience">Experience</TabsTrigger><TabsTrigger value="projects">Projects</TabsTrigger><TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <motion.div whileHover={{ scale: 1.05 }}><Avatar className="w-24 h-24 border-4 border-royal-purple/20"><AvatarImage src={portfolio?.avatar_url || PROFILE_PHOTO} /><AvatarFallback className="gradient-bg text-white text-2xl">{portfolio?.name?.charAt(0)}</AvatarFallback></Avatar></motion.div>
              <div className="flex-1"><Label htmlFor="avatar_url">Profile Photo URL</Label><Input id="avatar_url" value={portfolio?.avatar_url || ''} onChange={(e) => updateField('avatar_url', e.target.value)} placeholder="https://example.com/photo.jpg" className="border-purple-200" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="name">Full Name</Label><Input id="name" value={portfolio?.name || ''} onChange={(e) => updateField('name', e.target.value)} className="border-purple-200" /></div>
              <div><Label htmlFor="title">Title / Tagline</Label><Input id="title" value={portfolio?.title || ''} onChange={(e) => updateField('title', e.target.value)} className="border-purple-200" /></div>
            </div>
            <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={portfolio?.bio || ''} onChange={(e) => updateField('bio', e.target.value)} rows={4} className="border-purple-200" /></div>
            <Separator />
            <div><h3 className="font-semibold mb-4">Section Visibility</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['hero', 'about', 'skills', 'experience', 'projects', 'contact'].map(section => (
                  <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50"><span className="capitalize">{section}</span><Switch checked={portfolio?.sections_visible?.[section] !== false} onCheckedChange={(checked) => updateField('sections_visible', { ...portfolio?.sections_visible, [section]: checked })} /></div>
                ))}
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="space-y-4">
              {portfolio?.skills?.map((skill, index) => (
                <motion.div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <Input value={skill.name} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].name = e.target.value; updateField('skills', newSkills); }} className="flex-1 border-purple-200" placeholder="Skill name" />
                  <Input type="number" value={skill.level} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].level = parseInt(e.target.value) || 0; updateField('skills', newSkills); }} className="w-20 border-purple-200" min="0" max="100" />
                  <Input value={skill.category} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].category = e.target.value; updateField('skills', newSkills); }} className="w-32 border-purple-200" placeholder="Category" />
                  <Button variant="ghost" size="icon" onClick={() => { const newSkills = portfolio.skills.filter((_, i) => i !== index); updateField('skills', newSkills); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('skills', [...(portfolio?.skills || []), { name: '', level: 50, category: '' }])} className="w-full border-dashed border-purple-300"><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="experience" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="space-y-4">
              {portfolio?.experience?.map((exp, index) => (
                <motion.div key={exp.id || index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="flex items-center justify-between"><span className="font-medium text-royal-purple">Experience {index + 1}</span><Button variant="ghost" size="icon" onClick={() => { const newExp = portfolio.experience.filter((_, i) => i !== index); updateField('experience', newExp); }}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={exp.title} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].title = e.target.value; updateField('experience', newExp); }} placeholder="Job Title" className="border-purple-200" />
                    <Input value={exp.company} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].company = e.target.value; updateField('experience', newExp); }} placeholder="Company" className="border-purple-200" />
                  </div>
                  <Input value={exp.period} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].period = e.target.value; updateField('experience', newExp); }} placeholder="Period (e.g., 2020 - Present)" className="border-purple-200" />
                  <Textarea value={exp.description} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].description = e.target.value; updateField('experience', newExp); }} placeholder="Description" rows={2} className="border-purple-200" />
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('experience', [...(portfolio?.experience || []), { id: Date.now().toString(), title: '', company: '', period: '', description: '' }])} className="w-full border-dashed border-purple-300"><Plus className="w-4 h-4 mr-2" />Add Experience</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="space-y-4">
              {portfolio?.projects?.map((project, index) => (
                <motion.div key={project.id || index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="flex items-center justify-between"><span className="font-medium text-royal-purple">Project {index + 1}</span><Button variant="ghost" size="icon" onClick={() => { const newProjects = portfolio.projects.filter((_, i) => i !== index); updateField('projects', newProjects); }}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                  <Input value={project.title} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].title = e.target.value; updateField('projects', newProjects); }} placeholder="Project Title" className="border-purple-200" />
                  <Textarea value={project.description} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].description = e.target.value; updateField('projects', newProjects); }} placeholder="Description" rows={2} className="border-purple-200" />
                  <Input value={project.image} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].image = e.target.value; updateField('projects', newProjects); }} placeholder="Image URL" className="border-purple-200" />
                  <Input value={project.tags?.join(', ')} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].tags = e.target.value.split(',').map(t => t.trim()); updateField('projects', newProjects); }} placeholder="Tags (comma separated)" className="border-purple-200" />
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('projects', [...(portfolio?.projects || []), { id: Date.now().toString(), title: '', description: '', image: '', tags: [], link: '' }])} className="w-full border-dashed border-purple-300"><Plus className="w-4 h-4 mr-2" />Add Project</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ key: 'email', label: 'Email', placeholder: 'your@email.com' }, { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890' }, { key: 'location', label: 'Location', placeholder: 'City, Country' }, { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' }, { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' }, { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' }].map(field => (
                <div key={field.key}><Label>{field.label}</Label><Input value={portfolio?.contact?.[field.key] || ''} onChange={(e) => updateField('contact', { ...portfolio?.contact, [field.key]: e.target.value })} placeholder={field.placeholder} className="border-purple-200" /></div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// AI Agent Page
const AIAgentPage = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { api.get('/ai/memory', token).then(setMemories).catch(console.error); }, [token]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/ai/chat', { message: input }, token);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      const memData = await api.get('/ai/memory', token);
      setMemories(memData);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]); }
    finally { setLoading(false); }
  };

  const clearMemory = async () => { try { await api.delete('/ai/memory', token); setMemories([]); } catch {} };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-card h-full flex flex-col overflow-hidden">
          <CardHeader className="gradient-bg text-white">
            <div className="flex items-center gap-3">
              <motion.div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.3)"] }} transition={{ duration: 2, repeat: Infinity }}><Bot className="w-6 h-6 text-white" /></motion.div>
              <div><CardTitle className="text-white">AI Personal Assistant</CardTitle><CardDescription className="text-white/70">Your intelligent helper with memory</CardDescription></div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (<div className="text-center py-12"><motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}><Bot className="w-16 h-16 mx-auto mb-4 text-royal-purple/30" /></motion.div><h3 className="font-semibold mb-2">Start a Conversation</h3><p className="text-sm text-muted-foreground max-w-md mx-auto">I can help you manage tasks, remember important things, and provide productivity suggestions.</p></div>)}
              {messages.map((msg, index) => (<motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}><div className={"max-w-[80%] p-4 rounded-2xl " + (msg.role === 'user' ? 'gradient-bg text-white rounded-br-sm' : 'bg-gradient-to-r from-purple-50 to-pink-50 rounded-bl-sm border border-purple-100')}><p className="whitespace-pre-wrap">{msg.content}</p></div></motion.div>))}
              {loading && (<div className="flex justify-start"><div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl rounded-bl-sm border border-purple-100"><div className="flex gap-1">{[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-2 h-2 rounded-full bg-royal-purple" />)}</div></div></div>)}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3"><Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1 border-purple-200" disabled={loading} /><Button type="submit" className="gradient-bg text-white" disabled={loading}><Send className="w-4 h-4" /></Button></form>
          </div>
        </Card>
      </div>
      <div>
        <Card className="border-0 shadow-card h-full flex flex-col">
          <CardHeader className="border-b border-purple-100"><div className="flex items-center justify-between"><CardTitle className="text-lg">Memory Bank</CardTitle><Button variant="ghost" size="sm" onClick={clearMemory} className="text-destructive hover:bg-red-50"><Trash2 className="w-4 h-4 mr-1" />Clear</Button></div></CardHeader>
          <ScrollArea className="flex-1"><div className="p-4 space-y-3">{memories.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No memories stored yet</p> : memories.slice(0, 10).map(memory => (<motion.div key={memory.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-sm"><p className="line-clamp-3">{memory.content}</p><p className="text-xs text-muted-foreground mt-2">{new Date(memory.created_at).toLocaleDateString()}</p></motion.div>))}</div></ScrollArea>
        </Card>
      </div>
    </motion.div>
  );
};

// Tasks Page
const TasksPage = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', deadline: '' });

  useEffect(() => { api.get('/tasks', token).then(setTasks).catch(console.error).finally(() => setLoading(false)); }, [token]);

  const addTask = async () => { if (!newTask.title) return; try { const response = await api.post('/tasks', newTask, token); setTasks([...tasks, response.task]); setNewTask({ title: '', description: '', priority: 'medium', deadline: '' }); setShowAddTask(false); } catch {} };
  const toggleTask = async (taskId, completed) => { try { await api.put("/tasks/" + taskId, { completed: !completed }, token); setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t)); } catch {} };
  const deleteTask = async (taskId) => { try { await api.delete("/tasks/" + taskId, token); setTasks(tasks.filter(t => t.id !== taskId)); } catch {} };

  const priorityColors = { low: 'bg-green-100 text-green-700 border-green-200', medium: 'bg-amber-100 text-amber-700 border-amber-200', high: 'bg-red-100 text-red-700 border-red-200' };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-display font-bold">Tasks & Reminders</h2><p className="text-muted-foreground">Stay organized and productive</p></div><motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Button onClick={() => setShowAddTask(true)} className="gradient-bg text-white"><Plus className="w-4 h-4 mr-2" />Add Task</Button></motion.div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Total Tasks', value: tasks.length, icon: Calendar, color: 'from-royal-purple to-hot-pink' }, { label: 'Completed', value: tasks.filter(t => t.completed).length, icon: Check, color: 'from-green-400 to-emerald-500' }, { label: 'Pending', value: tasks.filter(t => !t.completed).length, icon: Clock, color: 'from-hot-pink to-rose-pink' }].map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}><Card className="border-0 shadow-card card-hover"><CardContent className="p-4 flex items-center gap-4"><div className={"w-10 h-10 rounded-lg bg-gradient-to-br " + stat.color + " flex items-center justify-center"}><stat.icon className="w-5 h-5 text-white" /></div><div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div></CardContent></Card></motion.div>))}
      </div>
      <Card className="border-0 shadow-card"><CardContent className="p-6">
        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div> : tasks.length === 0 ? (<div className="text-center py-12"><Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold mb-2">No Tasks Yet</h3><p className="text-sm text-muted-foreground">Create your first task to get started</p></div>) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (<motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={"flex items-center gap-4 p-4 rounded-xl border " + (task.completed ? 'bg-gray-50 opacity-60' : 'bg-gradient-to-r from-white to-purple-50/50')}><button onClick={() => toggleTask(task.id, task.completed)} className={"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors " + (task.completed ? 'bg-green-500 border-green-500' : 'border-purple-300 hover:border-royal-purple')}>{task.completed && <Check className="w-4 h-4 text-white" />}</button><div className="flex-1"><p className={"font-medium " + (task.completed ? 'line-through' : '')}>{task.title}</p>{task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}{task.deadline && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString()}</p>}</div><Badge className={priorityColors[task.priority] + " border"}>{task.priority}</Badge><Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></motion.div>))}
          </div>
        )}
      </CardContent></Card>
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="border-0 shadow-2xl"><DialogHeader><DialogTitle>Add New Task</DialogTitle><DialogDescription>Create a new task to stay organized</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Task Title</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="What needs to be done?" className="border-purple-200" /></div>
            <div><Label>Description (optional)</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Add more details..." rows={2} className="border-purple-200" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label><Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}><SelectTrigger className="border-purple-200"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
              <div><Label>Deadline</Label><Input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className="border-purple-200" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button><Button onClick={addTask} className="gradient-bg text-white">Add Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Writing Studio
const WritingStudioPage = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentArticle, setCurrentArticle] = useState({ title: '', content: '', excerpt: '', cover_image: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/articles', token).then(setArticles).catch(console.error).finally(() => setLoading(false)); }, [token]);

  const saveArticle = async (publish = false) => { if (!currentArticle.title || !currentArticle.content) return; setSaving(true); try { if (editing) { await api.put("/articles/" + editing, { ...currentArticle, published: publish }, token); setArticles(articles.map(a => a.id === editing ? { ...a, ...currentArticle, published: publish } : a)); } else { const response = await api.post('/articles', { ...currentArticle, published: publish }, token); setArticles([response.article, ...articles]); } setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' }); setEditing(null); } catch {} finally { setSaving(false); } };
  const deleteArticle = async (articleId) => { try { await api.delete("/articles/" + articleId, token); setArticles(articles.filter(a => a.id !== articleId)); } catch {} };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div><h2 className="text-2xl font-display font-bold">Writing Studio</h2><p className="text-muted-foreground">Create and publish your articles</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-card"><CardHeader><CardTitle>{editing ? 'Edit Article' : 'New Article'}</CardTitle></CardHeader><CardContent className="space-y-4">
            <Input value={currentArticle.title} onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })} placeholder="Article Title" className="text-xl font-semibold border-purple-200" />
            <Input value={currentArticle.cover_image} onChange={(e) => setCurrentArticle({ ...currentArticle, cover_image: e.target.value })} placeholder="Cover Image URL (optional)" className="border-purple-200" />
            <Input value={currentArticle.excerpt} onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })} placeholder="Short excerpt (optional)" className="border-purple-200" />
            <div className="border rounded-lg overflow-hidden border-purple-200">
              <div className="flex items-center gap-1 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('bold')}><Bold className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('italic')}><Italic className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('underline')}><Underline className="w-4 h-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('formatBlock', false, 'h1')}><Type className="w-4 h-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyLeft')}><AlignLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyCenter')}><AlignCenter className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyRight')}><AlignRight className="w-4 h-4" /></Button>
              </div>
              <div contentEditable className="min-h-[300px] p-4 focus:outline-none prose max-w-none" onInput={(e) => setCurrentArticle({ ...currentArticle, content: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
            </div>
            <div className="flex gap-3 justify-end">
              {editing && <Button variant="outline" onClick={() => { setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' }); setEditing(null); }}>Cancel</Button>}
              <Button variant="outline" onClick={() => saveArticle(false)} disabled={saving} className="border-purple-200">Save Draft</Button>
              <Button onClick={() => saveArticle(true)} className="gradient-bg text-white" disabled={saving}>{saving && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />}Publish</Button>
            </div>
          </CardContent></Card>
        </div>
        <div>
          <Card className="border-0 shadow-card"><CardHeader><CardTitle>Your Articles</CardTitle></CardHeader><CardContent>
            <ScrollArea className="h-[500px]">
              {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div> : articles.length === 0 ? <div className="text-center py-8"><FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">No articles yet</p></div> : (
                <div className="space-y-3">{articles.map(article => (<div key={article.id} className="p-3 rounded-lg border border-purple-100 bg-gradient-to-r from-white to-purple-50/50 hover:shadow-md transition-shadow"><div className="flex items-start justify-between mb-2"><h4 className="font-medium line-clamp-1">{article.title}</h4><Badge variant={article.published ? 'default' : 'secondary'} className={article.published ? 'gradient-bg text-white' : ''}>{article.published ? 'Published' : 'Draft'}</Badge></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={() => { setCurrentArticle({ title: article.title, content: article.content, excerpt: article.excerpt || '', cover_image: article.cover_image || '' }); setEditing(article.id); }}><Edit className="w-3 h-3 mr-1" />Edit</Button><Button variant="ghost" size="sm" onClick={() => deleteArticle(article.id)}><Trash2 className="w-3 h-3 mr-1 text-destructive" /></Button></div></div>))}</div>
              )}
            </ScrollArea>
          </CardContent></Card>
        </div>
      </div>
    </motion.div>
  );
};

// Gallery Manager
const GalleryManagerPage = () => {
  const { token } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { api.get('/gallery', token).then(setPhotos).catch(console.error).finally(() => setLoading(false)); }, [token]);

  const toggleVisibility = async (photoId, visible) => { try { await api.put("/gallery/" + photoId, { visible: !visible }, token); setPhotos(photos.map(p => p.id === photoId ? { ...p, visible: !visible } : p)); } catch {} };
  const updateCaption = async (photoId, caption) => { try { await api.put("/gallery/" + photoId, { caption }, token); setPhotos(photos.map(p => p.id === photoId ? { ...p, caption } : p)); } catch {} };
  
  const deletePhoto = async (photoId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;
    try {
      await api.delete("/gallery/" + photoId, token);
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      try {
        // Convert to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // Upload to server
        const response = await api.post('/gallery/upload', {
          image_data: base64,
          caption: file.name.replace(/\.[^/.]+$/, '') // Use filename without extension as caption
        }, token);
        
        if (response.success) {
          setPhotos(prev => [...prev, response.photo]);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Photo Gallery</h2>
          <p className="text-muted-foreground">Kelola koleksi foto Anda - upload dan hapus foto</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="gradient-bg text-white"
              disabled={uploading}
            >
              {uploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Foto'}
            </Button>
          </motion.div>
          <Link to="/gallery" target="_blank">
            <Button variant="outline" className="border-purple-200">
              <Eye className="w-4 h-4 mr-2" />View Public Gallery
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="border-0 shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Belum ada foto</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload foto pertama Anda untuk memulai</p>
              <Button onClick={() => fileInputRef.current?.click()} className="gradient-bg text-white">
                <Plus className="w-4 h-4 mr-2" />Upload Foto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <motion.div 
                  key={photo.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: index * 0.05 }} 
                  className={"relative group rounded-xl overflow-hidden shadow-card " + (!photo.visible ? 'opacity-50' : '')}
                >
                  <img src={photo.url} alt={photo.caption} className="w-full aspect-square object-cover" />
                  
                  {/* Delete button - always visible on top right */}
                  <motion.button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  
                  {/* Bottom overlay with caption and visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <Input 
                        value={photo.caption || ''} 
                        onChange={(e) => updateCaption(photo.id, e.target.value)} 
                        placeholder="Add caption..." 
                        className="text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 mb-2" 
                      />
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleVisibility(photo.id, photo.visible)} 
                          className="text-white hover:bg-white/20"
                        >
                          {photo.visible ? <><Eye className="w-4 h-4 mr-1" /> Visible</> : <><EyeOff className="w-4 h-4 mr-1" /> Hidden</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upload hint */}
      <Card className="border-0 shadow-card bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Tips Upload Foto</p>
              <p className="text-sm text-muted-foreground">Anda bisa upload banyak foto sekaligus. Klik tombol "Upload Foto" dan pilih beberapa file.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Settings Page
const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-display font-bold">Settings</h2><p className="text-muted-foreground">Customize your experience</p></div>
      <Card className="border-0 shadow-card"><CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize how the dashboard looks</CardDescription></CardHeader><CardContent className="space-y-6">
        <div className="flex items-center justify-between"><div><Label>Theme</Label><p className="text-sm text-muted-foreground">Choose light or dark mode</p></div>
          <div className="flex items-center gap-2">
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')} className={theme === 'light' ? 'gradient-bg text-white' : 'border-purple-200'}><Sun className="w-4 h-4 mr-1" />Light</Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'gradient-bg text-white' : 'border-purple-200'}><Moon className="w-4 h-4 mr-1" />Dark</Button>
          </div>
        </div>
      </CardContent></Card>
      <Card className="border-0 shadow-card"><CardHeader><CardTitle>Account</CardTitle><CardDescription>Manage your admin account</CardDescription></CardHeader><CardContent>
        <div className="flex items-center gap-4"><Avatar className="w-16 h-16 border-2 border-royal-purple/20"><AvatarImage src={PROFILE_PHOTO} /><AvatarFallback className="gradient-bg text-white text-xl">MA</AvatarFallback></Avatar><div><p className="font-semibold">MiryamAbida07</p><p className="text-sm text-muted-foreground">Administrator</p></div></div>
      </CardContent></Card>
    </motion.div>
  );
};

// Main App
function App() {
  return (
    <ThemeProvider><AuthProvider><TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><PublicNavbar /><HomePage /><FloatingAIAgent /></>} />
          <Route path="/articles" element={<><PublicNavbar /><ArticlesPage /><FloatingAIAgent /></>} />
          <Route path="/articles/:id" element={<><PublicNavbar /><ArticlePage /><FloatingAIAgent /></>} />
          <Route path="/gallery" element={<><PublicNavbar /><GalleryPage /><FloatingAIAgent /></>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/portfolio" element={<ProtectedRoute><AdminLayout><PortfolioEditor /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/ai-agent" element={<ProtectedRoute><AdminLayout><AIAgentPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute><AdminLayout><TasksPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/writing" element={<ProtectedRoute><AdminLayout><WritingStudioPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute><AdminLayout><GalleryManagerPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider></AuthProvider></ThemeProvider>
  );
}

export default App;
