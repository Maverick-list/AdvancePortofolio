import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Briefcase, Mail, Image, FileText, Settings, LogOut, Menu, X,
  ChevronRight, Star, Heart, MessageCircle, Share2, Calendar, Clock, Bell,
  Bot, Send, Trash2, Edit, Eye, EyeOff, Plus, Check, AlertCircle,
  Sparkles, TrendingUp, BookOpen, Camera, Sun, Moon, ChevronDown, GripVertical,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== CONTEXTS ====================

const AuthContext = createContext(null);
const ThemeContext = createContext(null);

// ==================== HOOKS ====================

const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);

// ==================== API HELPERS ====================

const api = {
  get: async (endpoint, token = null) => {
    const url = token ? `${API}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${token}` : `${API}${endpoint}`;
    const response = await axios.get(url);
    return response.data;
  },
  post: async (endpoint, data, token = null) => {
    const url = token ? `${API}${endpoint}?token=${token}` : `${API}${endpoint}`;
    const response = await axios.post(url, data);
    return response.data;
  },
  put: async (endpoint, data, token = null) => {
    const url = token ? `${API}${endpoint}?token=${token}` : `${API}${endpoint}`;
    const response = await axios.put(url, data);
    return response.data;
  },
  delete: async (endpoint, token = null) => {
    const url = token ? `${API}${endpoint}?token=${token}` : `${API}${endpoint}`;
    const response = await axios.delete(url);
    return response.data;
  }
};

// ==================== ANIMATION VARIANTS ====================

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
};

// ==================== COMPONENTS ====================

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Auth Provider
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
    if (token) {
      await api.post('/auth/logout', {}, token);
    }
    localStorage.removeItem('auth_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full animated-gradient" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Animated Logo
const AnimatedLogo = () => (
  <motion.div 
    className="flex items-center gap-2"
    whileHover={{ scale: 1.02 }}
  >
    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow-purple">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <span className="text-xl font-display font-bold gradient-text">Miryam</span>
  </motion.div>
);

// Navbar for Public Pages
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
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <AnimatedLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 text-foreground/70 hover:text-foreground transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

// ==================== PUBLIC PAGES ====================

// Homepage
const HomePage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.get('/portfolio');
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-royal-purple border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 animated-gradient opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-hot-pink/20 blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <Avatar className="w-32 h-32 mx-auto border-4 border-white/30 shadow-2xl">
                <AvatarImage src={portfolio?.avatar_url} alt={portfolio?.name} />
                <AvatarFallback className="text-3xl gradient-bg text-white">
                  {portfolio?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
            >
              {portfolio?.name || 'Welcome'}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/80 mb-8 font-light"
            >
              {portfolio?.title}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="btn-gradient text-white px-8 py-6 text-lg rounded-full"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore My Work
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full backdrop-blur"
              >
                <Mail className="mr-2 w-5 h-5" />
                Get in Touch
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </section>

      {/* About Section */}
      {portfolio?.sections_visible?.about !== false && (
        <section id="about" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge className="mb-4 gradient-bg text-white">About Me</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">
                Hello, I'm {portfolio?.name?.split(' ')[0]}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {portfolio?.bio}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {portfolio?.sections_visible?.skills !== false && portfolio?.skills?.length > 0 && (
        <section className="py-24 gradient-bg-soft">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 gradient-bg text-white">My Expertise</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">
                Skills & Technologies
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {portfolio?.skills?.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover border-0 shadow-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">{skill.name}</span>
                        <Badge variant="outline" className="text-royal-purple border-royal-purple">
                          {skill.category}
                        </Badge>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                      <span className="text-sm text-muted-foreground mt-2 block text-right">
                        {skill.level}%
                      </span>
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
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 gradient-bg text-white">Career Journey</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">
                Experience
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {portfolio?.experience?.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover border-l-4 border-l-royal-purple">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <Badge variant="secondary">{exp.period}</Badge>
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
        <section className="py-24 gradient-bg-soft">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 gradient-bg text-white">Portfolio</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">
                Featured Projects
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portfolio?.projects?.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-hover overflow-hidden border-0 shadow-card group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
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
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge className="mb-4 gradient-bg text-white">Get in Touch</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 gradient-text">
                Let's Work Together
              </h2>
              <p className="text-lg text-muted-foreground mb-12">
                Have a project in mind? I'd love to hear from you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {portfolio?.contact?.email && (
                  <Card className="card-hover">
                    <CardContent className="pt-6 text-center">
                      <Mail className="w-8 h-8 mx-auto mb-3 text-royal-purple" />
                      <p className="font-medium">{portfolio.contact.email}</p>
                    </CardContent>
                  </Card>
                )}
                {portfolio?.contact?.location && (
                  <Card className="card-hover">
                    <CardContent className="pt-6 text-center">
                      <Home className="w-8 h-8 mx-auto mb-3 text-royal-purple" />
                      <p className="font-medium">{portfolio.contact.location}</p>
                    </CardContent>
                  </Card>
                )}
                {portfolio?.contact?.phone && (
                  <Card className="card-hover">
                    <CardContent className="pt-6 text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-3 text-royal-purple" />
                      <p className="font-medium">{portfolio.contact.phone}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {portfolio?.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

// Articles Page (Public)
const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await api.get('/articles?published_only=true');
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleLike = async (articleId) => {
    try {
      await api.post(`/articles/${articleId}/like`);
      setArticles(articles.map(a => 
        a.id === articleId ? { ...a, likes: (a.likes || 0) + 1 } : a
      ));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-12"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 gradient-bg text-white">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            My Articles
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thoughts, insights, and stories from my journey
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
              <p className="text-muted-foreground">Check back soon for new content!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-hover overflow-hidden h-full flex flex-col">
                  {article.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-4 flex-grow">
                    <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(article.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-hot-pink transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{article.likes || 0}</span>
                        </button>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{article.comments?.length || 0}</span>
                        </span>
                      </div>
                      <Link to={`/articles/${article.id}`}>
                        <Button variant="ghost" size="sm" className="text-royal-purple">
                          Read More <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
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

// Single Article Page
const ArticlePage = () => {
  const { id } = useLocation().pathname.split('/').pop();
  const articleId = useLocation().pathname.split('/').pop();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState({ author_name: '', content: '' });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await api.get(`/articles/${articleId}`);
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const handleLike = async () => {
    try {
      await api.post(`/articles/${articleId}/like`);
      setArticle({ ...article, likes: (article.likes || 0) + 1 });
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.author_name || !comment.content) return;
    try {
      const response = await api.post(`/articles/${articleId}/comment`, comment);
      setArticle({
        ...article,
        comments: [...(article.comments || []), response.comment]
      });
      setComment({ author_name: '', content: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-transparent"
        />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/articles">
            <Button className="gradient-bg text-white">Back to Articles</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-12"
    >
      <article className="container mx-auto px-4 max-w-3xl">
        {article.cover_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl overflow-hidden mb-8 shadow-lg"
          >
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold mb-6"
        >
          {article.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mb-8 pb-8 border-b"
        >
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-muted-foreground hover:text-hot-pink transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span>{article.likes || 0} likes</span>
          </button>
          <span className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span>{article.comments?.length || 0} comments</span>
          </span>
          <button
            onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
            className="flex items-center gap-2 text-muted-foreground hover:text-royal-purple transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Comments Section */}
        <div className="border-t pt-8">
          <h3 className="text-2xl font-display font-bold mb-6">Comments</h3>
          
          <form onSubmit={handleComment} className="mb-8">
            <div className="grid gap-4">
              <Input
                placeholder="Your name"
                value={comment.author_name}
                onChange={(e) => setComment({ ...comment, author_name: e.target.value })}
              />
              <Textarea
                placeholder="Write a comment..."
                value={comment.content}
                onChange={(e) => setComment({ ...comment, content: e.target.value })}
                rows={3}
              />
              <Button type="submit" className="gradient-bg text-white w-fit">
                Post Comment
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            {article.comments?.map((c, i) => (
              <Card key={c.id || i}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="gradient-bg text-white text-xs">
                        {c.author_name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{c.author_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground/80">{c.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </article>
    </motion.div>
  );
};

// Gallery Page (Public)
const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.get('/gallery?visible_only=true');
        setPhotos(data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-12"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 gradient-bg text-white">Gallery</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            Photo Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Moments captured through my lens
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer card-hover"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {selectedPhoto && (
              <div className="relative">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                {selectedPhoto.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-lg">{selectedPhoto.caption}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

// ==================== ADMIN PAGES ====================

// Admin Login
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await login(credentials.username, credentials.password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 animated-gradient opacity-30" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <AnimatedLogo />
            </div>
            <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
            <CardDescription>Sign in to your admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-bg text-white"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Portfolio
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
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
    const fetchNotifications = async () => {
      try {
        const data = await api.get('/notifications', token);
        setNotifications(data.filter(n => !n.read).slice(0, 5));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

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
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-screen bg-card border-r z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <AnimatedLogo />
          ) : (
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'sidebar-active bg-gradient-to-r from-royal-purple/10 to-transparent text-royal-purple font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-royal-purple' : ''}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-[280px]' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-hot-pink badge-pulse" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="p-3">
                        <div>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <Avatar className="w-9 h-9 border-2 border-royal-purple/20">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
                <AvatarFallback className="gradient-bg text-white">MA</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Admin Dashboard Overview
const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, suggestionsData] = await Promise.all([
          api.get('/stats', token),
          api.get('/ai/suggestions', token)
        ]);
        setStats(statsData);
        setSuggestions(suggestionsData.suggestions || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const statCards = [
    { label: 'Total Tasks', value: stats?.tasks?.total || 0, icon: Calendar, color: 'from-royal-purple to-hot-pink' },
    { label: 'Published Articles', value: stats?.articles?.published || 0, icon: FileText, color: 'from-hot-pink to-rose-pink' },
    { label: 'Gallery Photos', value: stats?.gallery?.total || 0, icon: Image, color: 'from-soft-lavender to-royal-purple' },
    { label: 'AI Memories', value: stats?.ai_memories?.total || 0, icon: Bot, color: 'from-deep-purple to-royal-purple' },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-0 shadow-card">
        <div className="relative p-8 animated-gradient">
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Welcome back, Miryam! ✨
            </h2>
            <p className="text-white/80">
              Here's what's happening with your portfolio today.
            </p>
          </div>
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-8 top-1/2 -translate-y-1/2"
          >
            <Sparkles className="w-24 h-24 text-white/20" />
          </motion.div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-hover border-0 shadow-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                      className="text-3xl font-bold"
                    >
                      {loading ? <Skeleton className="w-12 h-8" /> : stat.value}
                    </motion.p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center ai-aura">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <CardTitle>AI Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    suggestion.type === 'urgent'
                      ? 'bg-destructive/10 border border-destructive/20'
                      : suggestion.type === 'reminder'
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-muted'
                  }`}
                >
                  <p>{suggestion.message}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/writing">
          <Card className="card-hover border-0 shadow-card cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-royal-purple to-hot-pink flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Write New Article</h3>
                <p className="text-sm text-muted-foreground">Share your thoughts</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/tasks">
          <Card className="card-hover border-0 shadow-card cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hot-pink to-rose-pink flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Task</h3>
                <p className="text-sm text-muted-foreground">Stay organized</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/ai-agent">
          <Card className="card-hover border-0 shadow-card cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center ai-aura">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Chat with AI</h3>
                <p className="text-sm text-muted-foreground">Your personal assistant</p>
              </div>
            </CardContent>
          </Card>
        </Link>
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

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.get('/portfolio');
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/portfolio', portfolio, token);
    } catch (error) {
      console.error('Error saving portfolio:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setPortfolio({ ...portfolio, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Portfolio Editor</h2>
          <p className="text-muted-foreground">Customize your public portfolio</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white">
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-royal-purple/20">
                  <AvatarImage src={portfolio?.avatar_url} />
                  <AvatarFallback className="gradient-bg text-white text-2xl">
                    {portfolio?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar_url">Profile Photo URL</Label>
                  <Input
                    id="avatar_url"
                    value={portfolio?.avatar_url || ''}
                    onChange={(e) => updateField('avatar_url', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={portfolio?.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title / Tagline</Label>
                  <Input
                    id="title"
                    value={portfolio?.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={portfolio?.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={4}
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Section Visibility</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['hero', 'about', 'skills', 'experience', 'projects', 'contact'].map((section) => (
                    <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <span className="capitalize">{section}</span>
                      <Switch
                        checked={portfolio?.sections_visible?.[section] !== false}
                        onCheckedChange={(checked) => updateField('sections_visible', {
                          ...portfolio?.sections_visible,
                          [section]: checked
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {portfolio?.skills?.map((skill, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <Input
                      value={skill.name}
                      onChange={(e) => {
                        const newSkills = [...portfolio.skills];
                        newSkills[index].name = e.target.value;
                        updateField('skills', newSkills);
                      }}
                      className="flex-1"
                      placeholder="Skill name"
                    />
                    <Input
                      type="number"
                      value={skill.level}
                      onChange={(e) => {
                        const newSkills = [...portfolio.skills];
                        newSkills[index].level = parseInt(e.target.value) || 0;
                        updateField('skills', newSkills);
                      }}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <Input
                      value={skill.category}
                      onChange={(e) => {
                        const newSkills = [...portfolio.skills];
                        newSkills[index].category = e.target.value;
                        updateField('skills', newSkills);
                      }}
                      className="w-32"
                      placeholder="Category"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newSkills = portfolio.skills.filter((_, i) => i !== index);
                        updateField('skills', newSkills);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => updateField('skills', [...(portfolio?.skills || []), { name: '', level: 50, category: '' }])}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {portfolio?.experience?.map((exp, index) => (
                  <div key={exp.id || index} className="p-4 rounded-lg bg-muted space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Experience {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newExp = portfolio.experience.filter((_, i) => i !== index);
                          updateField('experience', newExp);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={exp.title}
                        onChange={(e) => {
                          const newExp = [...portfolio.experience];
                          newExp[index].title = e.target.value;
                          updateField('experience', newExp);
                        }}
                        placeholder="Job Title"
                      />
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...portfolio.experience];
                          newExp[index].company = e.target.value;
                          updateField('experience', newExp);
                        }}
                        placeholder="Company"
                      />
                    </div>
                    <Input
                      value={exp.period}
                      onChange={(e) => {
                        const newExp = [...portfolio.experience];
                        newExp[index].period = e.target.value;
                        updateField('experience', newExp);
                      }}
                      placeholder="Period (e.g., 2020 - Present)"
                    />
                    <Textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...portfolio.experience];
                        newExp[index].description = e.target.value;
                        updateField('experience', newExp);
                      }}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => updateField('experience', [
                    ...(portfolio?.experience || []),
                    { id: Date.now().toString(), title: '', company: '', period: '', description: '' }
                  ])}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {portfolio?.projects?.map((project, index) => (
                  <div key={project.id || index} className="p-4 rounded-lg bg-muted space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Project {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newProjects = portfolio.projects.filter((_, i) => i !== index);
                          updateField('projects', newProjects);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={project.title}
                      onChange={(e) => {
                        const newProjects = [...portfolio.projects];
                        newProjects[index].title = e.target.value;
                        updateField('projects', newProjects);
                      }}
                      placeholder="Project Title"
                    />
                    <Textarea
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...portfolio.projects];
                        newProjects[index].description = e.target.value;
                        updateField('projects', newProjects);
                      }}
                      placeholder="Description"
                      rows={2}
                    />
                    <Input
                      value={project.image}
                      onChange={(e) => {
                        const newProjects = [...portfolio.projects];
                        newProjects[index].image = e.target.value;
                        updateField('projects', newProjects);
                      }}
                      placeholder="Image URL"
                    />
                    <Input
                      value={project.tags?.join(', ')}
                      onChange={(e) => {
                        const newProjects = [...portfolio.projects];
                        newProjects[index].tags = e.target.value.split(',').map(t => t.trim());
                        updateField('projects', newProjects);
                      }}
                      placeholder="Tags (comma separated)"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => updateField('projects', [
                    ...(portfolio?.projects || []),
                    { id: Date.now().toString(), title: '', description: '', image: '', tags: [], link: '' }
                  ])}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={portfolio?.contact?.email || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={portfolio?.contact?.phone || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={portfolio?.contact?.location || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={portfolio?.contact?.linkedin || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input
                    value={portfolio?.contact?.github || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, github: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    value={portfolio?.contact?.twitter || ''}
                    onChange={(e) => updateField('contact', { ...portfolio?.contact, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await api.get('/ai/memory', token);
        setMemories(data);
      } catch (error) {
        console.error('Error fetching memories:', error);
      }
    };
    fetchMemories();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: input }, token);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearMemory = async () => {
    try {
      await api.delete('/ai/memory', token);
      setMemories([]);
    } catch (error) {
      console.error('Error clearing memory:', error);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]"
    >
      {/* Chat Section */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-card h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center ai-aura">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>AI Personal Assistant</CardTitle>
                <CardDescription>Your intelligent helper with memory</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    I can help you manage tasks, remember important things, and provide productivity suggestions.
                  </p>
                </div>
              )}
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'gradient-bg text-white rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-royal-purple"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        className="w-2 h-2 rounded-full bg-royal-purple"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-royal-purple"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" className="gradient-bg text-white" disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Memory Section */}
      <div>
        <Card className="border-0 shadow-card h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Memory Bank</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearMemory}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {memories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No memories stored yet
                </p>
              ) : (
                memories.slice(0, 10).map((memory) => (
                  <div
                    key={memory.id}
                    className="p-3 rounded-lg bg-muted text-sm"
                  >
                    <p className="line-clamp-3">{memory.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(memory.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
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

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const data = await api.get('/tasks', token);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title) return;
    try {
      const response = await api.post('/tasks', newTask, token);
      setTasks([...tasks, response.task]);
      setNewTask({ title: '', description: '', priority: 'medium', deadline: '' });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await api.put(`/tasks/${taskId}`, { completed: !completed }, token);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`, token);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const priorityColors = {
    low: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    high: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Tasks & Reminders</h2>
          <p className="text-muted-foreground">Stay organized and productive</p>
        </div>
        <Button onClick={() => setShowAddTask(true)} className="gradient-bg text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-royal-purple/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-royal-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.completed).length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-hot-pink/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-hot-pink" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first task to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    task.completed ? 'bg-muted/50 opacity-60' : 'bg-background'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-muted-foreground hover:border-royal-purple'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task to stay organized</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add more details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTask(false)}>
              Cancel
            </Button>
            <Button onClick={addTask} className="gradient-bg text-white">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Writing Studio Page
const WritingStudioPage = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentArticle, setCurrentArticle] = useState({ title: '', content: '', excerpt: '', cover_image: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [token]);

  const fetchArticles = async () => {
    try {
      const data = await api.get('/articles', token);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = async (publish = false) => {
    if (!currentArticle.title || !currentArticle.content) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/articles/${editing}`, { ...currentArticle, published: publish }, token);
        setArticles(articles.map(a => a.id === editing ? { ...a, ...currentArticle, published: publish } : a));
      } else {
        const response = await api.post('/articles', { ...currentArticle, published: publish }, token);
        setArticles([response.article, ...articles]);
      }
      setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' });
      setEditing(null);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteArticle = async (articleId) => {
    try {
      await api.delete(`/articles/${articleId}`, token);
      setArticles(articles.filter(a => a.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const editArticle = (article) => {
    setCurrentArticle({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      cover_image: article.cover_image || ''
    });
    setEditing(article.id);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Writing Studio</h2>
          <p className="text-muted-foreground">Create and publish your articles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>{editing ? 'Edit Article' : 'New Article'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={currentArticle.title}
                onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                placeholder="Article Title"
                className="text-xl font-semibold"
              />
              <Input
                value={currentArticle.cover_image}
                onChange={(e) => setCurrentArticle({ ...currentArticle, cover_image: e.target.value })}
                placeholder="Cover Image URL (optional)"
              />
              <Input
                value={currentArticle.excerpt}
                onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                placeholder="Short excerpt (optional)"
              />
              
              {/* Simple Rich Text Editor */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-muted border-b">
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('bold')}>
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('italic')}>
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('underline')}>
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('formatBlock', false, 'h1')}>
                    <Type className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyLeft')}>
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyCenter')}>
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('justifyRight')}>
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => document.execCommand('insertUnorderedList')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <div
                  contentEditable
                  className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
                  onInput={(e) => setCurrentArticle({ ...currentArticle, content: e.currentTarget.innerHTML })}
                  dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                {editing && (
                  <Button variant="outline" onClick={() => {
                    setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' });
                    setEditing(null);
                  }}>
                    Cancel
                  </Button>
                )}
                <Button variant="outline" onClick={() => saveArticle(false)} disabled={saving}>
                  Save Draft
                </Button>
                <Button onClick={() => saveArticle(true)} className="gradient-bg text-white" disabled={saving}>
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                  ) : null}
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <div>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Your Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No articles yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium line-clamp-1">{article.title}</h4>
                          <Badge variant={article.published ? 'default' : 'secondary'}>
                            {article.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editArticle(article)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteArticle(article.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

// Gallery Manager Page
const GalleryManagerPage = () => {
  const { token } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [token]);

  const fetchPhotos = async () => {
    try {
      const data = await api.get('/gallery', token);
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (photoId, visible) => {
    try {
      await api.put(`/gallery/${photoId}`, { visible: !visible }, token);
      setPhotos(photos.map(p => p.id === photoId ? { ...p, visible: !visible } : p));
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  const updateCaption = async (photoId, caption) => {
    try {
      await api.put(`/gallery/${photoId}`, { caption }, token);
      setPhotos(photos.map(p => p.id === photoId ? { ...p, caption } : p));
    } catch (error) {
      console.error('Error updating caption:', error);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Photo Gallery</h2>
          <p className="text-muted-foreground">Manage your photo collection</p>
        </div>
        <Link to="/gallery" target="_blank">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Public Gallery
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative group rounded-xl overflow-hidden ${
                    !photo.visible ? 'opacity-50' : ''
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <Input
                        value={photo.caption || ''}
                        onChange={(e) => updateCaption(photo.id, e.target.value)}
                        placeholder="Add caption..."
                        className="text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(photo.id, photo.visible)}
                          className="text-white hover:bg-white/20"
                        >
                          {photo.visible ? (
                            <><Eye className="w-4 h-4 mr-1" /> Visible</>
                          ) : (
                            <><EyeOff className="w-4 h-4 mr-1" /> Hidden</>
                          )}
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
    </motion.div>
  );
};

// Settings Page
const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h2 className="text-2xl font-display font-bold">Settings</h2>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the dashboard looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
              <AvatarFallback className="gradient-bg text-white text-xl">MA</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">MiryamAbida07</p>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==================== MAIN APP ====================

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><PublicNavbar /><HomePage /></>} />
              <Route path="/articles" element={<><PublicNavbar /><ArticlesPage /></>} />
              <Route path="/articles/:id" element={<><PublicNavbar /><ArticlePage /></>} />
              <Route path="/gallery" element={<><PublicNavbar /><GalleryPage /></>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/portfolio" element={
                <ProtectedRoute>
                  <AdminLayout><PortfolioEditor /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/ai-agent" element={
                <ProtectedRoute>
                  <AdminLayout><AIAgentPage /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/tasks" element={
                <ProtectedRoute>
                  <AdminLayout><TasksPage /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/writing" element={
                <ProtectedRoute>
                  <AdminLayout><WritingStudioPage /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/gallery" element={
                <ProtectedRoute>
                  <AdminLayout><GalleryManagerPage /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminLayout><SettingsPage /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
