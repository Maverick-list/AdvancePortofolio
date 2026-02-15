import { useState, useEffect, createContext, useContext, useRef, useMemo, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, MeshWobbleMaterial, PerspectiveCamera, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import Masonry from "react-masonry-css";
import * as THREE from "three";
import {
  Home, User, Mail, Image, FileText, Settings, LogOut, Menu, X,
  ChevronRight, Heart, MessageCircle, Share2, Calendar, Clock, Bell,
  Bot, Send, Trash2, Edit, Eye, EyeOff, Plus, Check, AlertCircle,
  Sparkles, Sun, Moon, ChevronDown, GripVertical, Download, Upload, CheckCircle2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type, Zap, Music, Volume2, VolumeX, Pause, Play, Upload
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://advance-portfolio-backend-amif.vercel.app";
const API = BACKEND_URL + "/api";



const AuthContext = createContext(null);
const ThemeContext = createContext(null);
const PortfolioContext = createContext(null);
const MusicContext = createContext(null);

const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);
const usePortfolio = () => useContext(PortfolioContext);
const useMusic = () => useContext(MusicContext);

const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [tracks, setTracks] = useState([
    { id: 1, name: "versace on the floor", url: "/music/versace_on_the_floor.mp3", artist: "Bruno Mars (Sax Cover)" },
    { id: 2, name: "anugerah terindah", url: "/music/anugerah_terindah.mp3", artist: "Andmesh (Sax Cover)" },
    { id: 3, name: "lofi chill", url: "/music/lofi_chill.mp3", artist: "Delosound" },
    { id: 4, name: "ambient lounge", url: "/music/ambient_lounge.mp3", artist: "Gensanmaier" },
    { id: 5, name: "forget", url: "/music/forget.mp3", artist: "Music for Video" },
    { id: 6, name: "jazzy love", url: "/music/jazzy_love.mp3", artist: "Sonican" },
    { id: 7, name: "summer rain", url: "/music/summer_rain.mp3", artist: "Xethrocc" }
  ]);

  const playTrack = (track) => {
    if (audioRef.current) audioRef.current.pause();
    const newAudio = new Audio(track.url);
    newAudio.volume = volume;
    newAudio.onended = () => playNextTrack();
    newAudio.play().catch(() => { });
    audioRef.current = newAudio;
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      if (tracks.length > 0) playTrack(tracks[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const addTrack = (track) => setTracks([...tracks, { ...track, id: Date.now() }]);
  const removeTrack = (id) => setTracks(tracks.filter(t => t.id !== id));
  const updateTrack = (id, updates) => setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <MusicContext.Provider value={{
      tracks, currentTrack, isPlaying, volume,
      setVolume, playTrack, togglePlayback,
      addTrack, removeTrack, updateTrack
    }}>
      {children}
    </MusicContext.Provider>
  );
};

const MusicVisualizer = ({ isPlaying }) => {
  return (
    <div className="flex items-end justify-center gap-[1px] h-3 w-full opacity-40 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-royal-purple/60 dark:bg-white/40 rounded-t-sm shrink-0"
          animate={{
            height: isPlaying ? [2, (Math.sin(i * 0.2 + Date.now() * 0.005) + 1) * 8 + 2, 2] : 2,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.02,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const getSubdomainUsername = () => {
    const host = window.location.hostname;
    // Check if hostname matches advance-portfolio-frontend-{username}.vercel.app
    if (host.includes('advance-portfolio-frontend-')) {
      const part = host.split('advance-portfolio-frontend-')[1];
      const username = part.split('.')[0];
      // Skip 'amif' as it's the main landing
      if (username && username !== 'amif') return username;
    }
    return null;
  };

  const fetchPortfolio = async (username = null) => {
    setLoading(true);
    try {
      const endpoint = username ? `/portfolio/${username}` : '/portfolio';
      const data = await api.get(endpoint);
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    // Check for /p/username pattern
    const pathUsername = (pathParts[1] === 'p' && pathParts[2]) ? pathParts[2] : undefined;

    // Check for subdomain username
    const subdomainUsername = getSubdomainUsername();

    const targetUsername = pathUsername || subdomainUsername;

    // Only fetch if:
    // 1. No portfolio loaded yet
    // 2. We have a target username and it's different from the loaded one
    // 3. We have NO target username but the loaded one is not the "primary" one (if we can distinguish)
    // Actually, simple check: if the requested username is different from current, fetch.
    if (!portfolio || portfolio.username !== targetUsername) {
      fetchPortfolio(targetUsername);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio, loading, fetchPortfolio, currentUsername: (location.pathname.split('/')[1] === 'p' ? location.pathname.split('/')[2] : getSubdomainUsername()) }}>
      {children}
    </PortfolioContext.Provider>
  );
};

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
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('auth_user');
    } catch { return null; }
  });
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
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.success) {
        setToken(response.token);
        setUser(response.username);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', response.username);
        return true;
      }
      return false;
    } catch { return false; }
  };

  const register = async (username, password, secret_key) => {
    try {
      const response = await api.post('/auth/register', { username, password, secret_key });
      return response.success;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
};

// Style Manager to inject global fonts and colors
const StyleManager = () => {
  const { portfolio } = usePortfolio();
  if (!portfolio) return null;

  const fontFamilies = ["Inter", "Roboto", "Outfit", "Playfair Display", "Montserrat", "Poppins", "Lora", "Open Sans", "Syne", "Space Grotesk", "Bricolage Grotesque", "Cormorant Garamond", "Josefin Sans", "Lexend", "Manrope", "Plus Jakarta Sans", "Raleway", "Sora", "Urbanist", "Work Sans"];

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies.map(f => f.replace(/ /g, '+')).join(':wght@400;500;600;700&family=')}:wght@400;500;600;700&display=swap`;

  return (
    <>
      <link rel="stylesheet" href={googleFontsUrl} />
      <style>{`
        body {
          font-family: '${portfolio.font_family || 'Inter'}', sans-serif !important;
          color: ${portfolio.font_style_color || 'inherit'} !important;
        }
        h1, h2, h3, h4, h5, h6, .font-display {
          font-family: '${portfolio.font_family || 'Inter'}', sans-serif !important;
        }
        .admin-scope {
          font-family: '${portfolio.admin_font_family || 'Inter'}', sans-serif !important;
          color: ${portfolio.admin_font_color || 'inherit'} !important;
        }
        /* Fix react-quill in dark mode */
        .ql-editor.ql-blank::before { color: rgba(255,255,255,0.3) !important; }
        .dark .ql-toolbar { background: #1e293b; border-color: rgba(255,255,255,0.1) !important; }
        .dark .ql-container { border-color: rgba(255,255,255,0.1) !important; }
        .dark .ql-stroke { stroke: #fff !important; }
        .dark .ql-fill { fill: #fff !important; }
        .dark .ql-picker { color: #fff !important; }
      `}</style>
    </>
  );
};

// Utility for Native Browser Notifications
const showNativeNotification = (title, message) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body: message, icon: '/logo192.png' });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: message, icon: '/logo192.png' });
      }
    });
  }
};

const PROFILE_PHOTO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAgKADAAQAAAABAAAAgAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAgACAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMABgYGBgYGCgYGCg4KCgoOEg4ODg4SFxISEhISFxwXFxcXFxccHBwcHBwcHCIiIiIiIicnJycnLCwsLCwsLCwsLP/bAEMBBwcHCwoLEwoKEy4fGh8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLv/dAAQACP/aAAwDAQACEQMRAD8A+VaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Q+VaKKKACiiigAoqxZ2st9dRWcG3zJnWNNzBRuY4GWOAOe5rsvEXw18Z+FdP/ALU1yx8m23hC4kR8M3TIRiQD69KAOForsfDHgLxR4whmn8PWy3C27BZB5saMpYZHDMDg+tc/q+kajoOpTaTqsRgubdtsiEg4OMjkZBBByCKAM6itLSNI1HXtSh0jSojPc3DbY0BAycZPJwAABkk1v+J/AXifwfDDP4ht1t1nYrGPNjdmKjJ4VicDufegDjqK7rw78NfGfirT/wC1NEsfOtt5QO0iJll64DsCQPXpXG3drLY3UtnPt8yF2jbawYblODhhkHnuKAK9FFFABRRRQB//0flWiiigAooooAK+4/hvr9j8T/AM/h/XD5txBH9lugfvMpH7uUe/HX+8M18OV3Pw68YzeCfFFvqwJNs58q6QfxRMeePVfvD3FAHUeFtU1D4Q/EaSw1QkW6yfZ7rHR4WOVlA9uGHtkd69b+PvgtNU0yHxvpSh5LZVW5Kc74G+4/HXaT19D6Cp/jz4Rg13QIPG+k7Xe0RfNZf+Wls/KsD32k5HsT6VP8DvGEHibw7N4L1rEstnGURX5821b5dp9dmdp9iKAKXwC8GR6Xpc3jfVAEe5Vkty/GyBfvvz03EfkPevI/FOqah8XviNHYaWT9naT7Pa56JCpy0pHuMsfbAre8Za3r/w70jU/heNzWtxL5lnck8izlyWjHvuGD/wL1Fei/Afwjb6DoE/jfVtqSXaN5bN0jtk5Zie24jJ9gPWgDe+STX6P3yvXvj98N76/wBXieG7hk8u0uMcXERQM7ex5IyO/U9jXrfxy8W6NrfhdIYZ0m1S7kAt4IpfN8oDq8g2rswTwQRyeM96734cqr/B6zVgCDZXAIPIPzSV8w/D3xVqdnBf6HJbyX+kT27vewINzRR8K08YP8SZBPrj2yNaLitWtiKibVkexfC3xb4s0/w+8moW8T6FZA4u7iXyfLA6qp2sZAOgAHXjPQVi+O5fEPxC8Maj4vu/M0/QtPQNYWx4e5cuqmaT/ZwTj9O5PnfxF8V6jeQWPh+G3ksNHgt0eygcbWlj5VZ5AO74JAPT3zk/SXjn/kic3/YOtf5x0Vmm7pbhTTSszgf2aP8Aj01z/rpb/wApK8l8S6ba6x8XtR029YpDNfSh2UgEAAnqcgdKsfDv4jxeAfD+si3j83Ub14RbKR8i7Q+529hkYHc+1eV39/eanezajfyGW4uHaSRz1Zm5Jrmkm00mbQaUk2rnvj6/8O/BQMekxJc3K8ZixI+feVuB+B/CuC1r4peEtS3R2JWxiP8Azz5kx7uf6AV5rRXJTwNOL5p+8+7OyrmFWS5Ye6uy0HO7yu0kjFmYksxOSSepJptFFdpwn//U+VaKKKACiiigAooooA+zvhH4v0nVPh7J4aVxHfadbTq0THl0O5g6eo5wfQ/UV5N+zzg+O5VPINjN/wChx14la3d1Y3C3VnK0MqfddCVYZGDyPUcV7Z+zyQPHsmSBmxmx7/MlAB+0LgePIwOALGH/ANCevTPid400fS/hraeFmbzb/ULG2AjU/wCrQBG3v6ZxgDqfpXmX7QpB8fIAc4soc+3zPXiVxcT3UpnuZGlkIALOSTgDA5PoBge1AENFFFABRRRQAV//1flWiiigAooooAKKKKACrmn6he6Vexajp0zQXEDB45EOCpH+eR3qnRQBc1DUL3Vb2XUdRmae4nYvJI5yWJ/z07VToooAKKKKACiiigAooooA/9b5VooooAKKKKACiiigAooooAKKKKACiiigAooooAVVZ2CICzE4AHJJqa6tbiyuHtbpDHJGcMp7Gi1uriyuEurVzHJGcqw6irWq6reaxeNeXjbmPQDoo7AD0oA//9k=";

const AnimatedLogo = () => {
  const { portfolio } = usePortfolio();
  return (
    <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
      <motion.div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg bg-white/5 flex items-center justify-center p-1" animate={{ boxShadow: ["0 0 10px rgba(106, 0, 255, 0.3)", "0 0 20px rgba(255, 94, 207, 0.3)", "0 0 10px rgba(106, 0, 255, 0.3)"] }} transition={{ duration: 3, repeat: Infinity }}>
        <img src={portfolio?.avatar_url || PROFILE_PHOTO} alt="Logo" className="w-full h-full object-contain" />
      </motion.div>
      <span className="text-xl font-display font-bold bg-clip-text text-transparent" style={{ backgroundImage: portfolio?.font_style_color ? 'none' : 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)', color: portfolio?.font_style_color || 'transparent' }}>{portfolio?.name || 'Firza Ilmi'}</span>
    </motion.div>
  );
};

// Floating AI Agent
const FloatingAIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { token } = useAuth();
  const { theme } = useTheme();
  const { portfolio } = usePortfolio();

  useEffect(() => {
    if (isOpen) {
      api.get('/ai/suggestions', token).then(res => setSuggestions(res?.suggestions || [])).catch(() => { });
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
      let response;
      try {
        response = await api.post('/ai/chat', {
          message: input,
          username: portfolio?.username
        }, token);
      } catch (err) {
        console.warn("Floating AI: Main backend failed, trying local proxy...");
        const fallbackRes = await axios.post('/api/ai/chat', { message: input, username: portfolio?.username });
        response = fallbackRes.data;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Maaf, saya sedang mengalami kendala teknis dan gagal terhubung ke otak AI saya. Silakan coba lagi." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <motion.div className="fixed bottom-6 right-6 z-50" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.5, type: "spring" }}>
        <motion.div className="absolute inset-0" style={{ width: 80, height: 80, marginLeft: -8, marginTop: -8 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-full" style={{ background: portfolio?.font_style_color || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)', top: '50%', left: '50%', transform: "rotate(" + (i * 60) + "deg) translateX(35px)" }} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </motion.div>
        <motion.div className="absolute inset-0 rounded-full ai-glow-layer" style={{ background: 'radial-gradient(circle, rgba(184, 77, 255, 0.4) 0%, transparent 70%)', width: 100, height: 100, marginLeft: -18, marginTop: -18 }} />
        <motion.button onClick={() => setIsOpen(!isOpen)} className="relative w-16 h-16 rounded-full flex items-center justify-center ai-agent-orb cursor-pointer shadow-lg" style={{ background: portfolio?.font_style_color || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <motion.div animate={isOpen ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.3 }}>{isOpen ? <X className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}</motion.div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }} className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
            <Card className="border-0 shadow-2xl overflow-hidden dark:bg-slate-900 dark:border dark:border-white/10" style={{ background: theme === 'dark' ? '#0f172a' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,230,255,0.95) 100%)' }}>
              <div className="p-4" style={{ background: portfolio?.font_style_color || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' }}>
                <div className="flex items-center gap-3">
                  <motion.div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.3)"] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div><h3 className="font-bold text-white">AI Personal Assistant</h3><p className="text-white/70 text-sm">Active & ready to help ✨</p></div>
                </div>
              </div>
              {suggestions.length > 0 && messages.length === 0 && (
                <div className="p-3 border-b bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-900/20 dark:to-pink-900/20">
                  {suggestions.slice(0, 2).map((s, i) => (<div key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2"><Zap className="w-4 h-4" />{s.message}</div>))}
                </div>
              )}
              <ScrollArea className="h-80 p-4">
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}><Bot className="w-16 h-16 mx-auto mb-4 text-royal-purple/30 dark:text-white/20" /></motion.div>
                    <p className="text-muted-foreground dark:text-gray-400 text-sm">Hi! I'm your AI assistant.<br />I can help with tasks, reminders, and more!</p>
                    <div className="mt-4 space-y-2">
                      {["What's on my schedule?", "Create a reminder", "Help me stay focused"].map((q, i) => (
                        <button key={i} onClick={() => setInput(q)} className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 hover:from-purple-100 hover:to-pink-100 dark:hover:bg-white/10 transition-colors text-purple-700 dark:text-purple-300">{q}</button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
                      <motion.div key={index} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={"max-w-[85%] p-3 rounded-2xl " + (msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 shadow-md rounded-bl-sm border border-purple-100 dark:border-white/10 dark:text-gray-200')} style={msg.role === 'user' ? { background: portfolio?.font_style_color || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' } : {}}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 shadow-md p-3 rounded-2xl rounded-bl-sm border border-purple-100 dark:border-white/10">
                          <div className="flex gap-1">{[0, 1, 2].map(i => (<motion.div key={i} className="w-2 h-2 rounded-full bg-royal-purple dark:bg-purple-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />))}</div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              <div className="p-4 border-t bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-800 dark:to-slate-800 dark:border-white/10">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1 border-purple-200 dark:bg-slate-900 dark:border-white/10 dark:text-white focus:border-royal-purple" disabled={loading} />
                  <Button type="submit" size="icon" className="hover:opacity-90 text-white" style={{ background: portfolio?.font_style_color || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' }} disabled={loading || !input.trim()}><Send className="w-4 h-4" /></Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


// --- HELPER COMPONENTS ---

const Typewriter = ({ text, delay = 50, className = "", onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(new Audio('https://www.soundjay.com/communication/typewriter-key-1.mp3'));

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);

        if (audioRef.current) {
          audioRef.current.volume = 0.15;
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => { });
        }
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <span className={className}>{currentText}</span>;
};

const LogoLoader = ({ onComplete }) => {
  const { playTrack, tracks } = useMusic();

  useEffect(() => {
    const startAudio = new Audio('https://www.soundjay.com/ambient/ambient-noise-01.mp3');
    startAudio.volume = 0.3;
    startAudio.play().catch(() => { });

    const exitTimeout = setTimeout(() => {
      setIsExiting(true);
      const transitionAudio = new Audio('https://www.soundjay.com/misc/sounds/magic-chime-01.mp3');
      transitionAudio.play().catch(() => { });
    }, 3200);

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(exitTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete, playTrack, tracks]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden"
      animate={isExiting ? { scale: 12, opacity: 0, filter: 'blur(30px)' } : { scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeIn" }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 15 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/5 flex items-center justify-center p-12 relative bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <img
              src="/assets/logo_loading_2.jpg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


// Navbar
const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const { currentUsername } = usePortfolio();
  const { theme, setTheme } = useTheme();
  const { tracks, playTrack, currentTrack, isPlaying, volume, setVolume, togglePlayback } = useMusic();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPath = (path) => currentUsername ? `/p/${currentUsername}${path === '/' ? '' : path}` : path;

  const navLinks = [
    { href: getPath('/'), label: 'Home', icon: Home },
    { href: getPath('/templates'), label: 'Design', icon: Zap },
    { href: getPath('/articles'), label: 'Blog', icon: FileText },
    { href: getPath('/gallery'), label: 'Media', icon: Image },
    { href: '/admin/login', label: 'Admin', icon: User },
  ];

  const [volumeHover, setVolumeHover] = useState(false);

  return (
    <>
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className={"fixed top-0 left-0 right-0 z-40 transition-all duration-500 " + (scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4')}>
        <nav className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between relative z-10">
            <Link to="/">
              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                <div className="relative">
                  <AnimatedLogo />
                  <motion.div className="absolute inset-0 bg-white/30 rounded-full blur-lg" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
              </motion.div>
            </Link>

            <div className="flex items-center gap-4">
              {/* 1. Navigation Bolt */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0, x: 20 }}
                      animate={{ width: 'auto', opacity: 1, x: 0 }}
                      exit={{ width: 0, opacity: 0, x: 20 }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2 overflow-hidden bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 whitespace-nowrap shadow-2xl"
                    >
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all group"
                        >
                          <link.icon className="w-7 h-7 transition-transform group-hover:scale-125" />
                          <span className="text-sm font-black uppercase tracking-widest">{link.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => setMenuOpen(!menuOpen)}
                  animate={{ rotate: menuOpen ? 90 : 0 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:text-royal-purple transition-colors z-20"
                >
                  <Settings className="w-7 h-7" />
                </motion.button>
              </div>

              {/* Theme Toggle */}
              <motion.button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all" whileHover={{ scale: 1.15, rotate: 20 }} whileTap={{ scale: 0.85 }}>
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>

          {/* Visualizer at Bottom of Navbar */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full opacity-50 px-4">
            <MusicVisualizer isPlaying={isPlaying} />
          </div>
        </nav>
      </motion.header>

      {/* Left Side Volume Control */}
      <motion.div
        className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex items-center"
        onMouseEnter={() => setVolumeHover(true)}
        onMouseLeave={() => setVolumeHover(false)}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <motion.div
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-hidden flex items-center"
          animate={{ width: volumeHover ? 'auto' : '3rem' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer text-white">
            <Volume2 className={"w-5 h-5 " + (isPlaying ? "text-royal-purple shadow-glow" : "")} />
          </div>

          <AnimatePresence>
            {volumeHover && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-4 pr-6 whitespace-nowrap overflow-hidden"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Now Playing</span>
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">{currentTrack?.name || 'No Track'}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full accent-royal-purple cursor-pointer"
                />

                <button onClick={togglePlayback} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};


// Templates Page
const TemplatesPage = () => {
  const { portfolio } = usePortfolio();
  const { username } = useParams();
  const navigate = useNavigate();

  // Mock template data
  const templates = [
    { id: 1, title: "Modern Minimalist", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", category: "Portfolio" },
    { id: 2, title: "Cyberpunk Glow", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800", category: "Landing Page" },
    { id: 3, title: "Art Gallery", image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800", category: "Exhibition" },
    { id: 4, title: "Product Showcase", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800", category: "E-commerce" },
    { id: 5, title: "Technical Documentation", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800", category: "Docs" },
    { id: 6, title: "Creative Resume", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800", category: "Resume" },
    { id: 7, title: "Agency Portal", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800", category: "Business" },
    { id: 8, title: "Mobile UI Kit", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800", category: "Mobile" },
  ];

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pt-32 pb-24 px-4 min-h-screen gradient-bg-page">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <Badge className="mb-4 gradient-bg text-white px-4 py-1">Templates</Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text">Design Library</h1>
            <p className="text-xl text-muted-foreground mt-4">Explore high-quality templates and digital creations</p>
          </div>
        </div>

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex -ml-6 w-auto"
          columnClassName="pl-6 bg-clip-padding"
        >
          {templates.map((tpl) => (
            <motion.div key={tpl.id} className="mb-8" whileHover={{ y: -10 }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <Card className="overflow-hidden border-0 shadow-xl group cursor-pointer bg-white/50 backdrop-blur-sm">
                <div className="relative overflow-hidden aspect-[4/5]">
                  <motion.img src={tpl.image} alt={tpl.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <Badge className="w-fit mb-2 bg-royal-purple text-white">{tpl.category}</Badge>
                    <h3 className="text-xl font-bold text-white mb-2">{tpl.title}</h3>
                    <Button size="sm" className="w-full bg-white text-royal-purple hover:bg-white/90">Preview Template</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </Masonry>
      </div>
    </motion.div>
  );
};

// Homepage
const HomePage = () => {
  const { portfolio, loading } = usePortfolio();
  const { username } = useParams();
  const { tracks, playTrack, isPlaying } = useMusic();
  // fetch handled by Provider now

  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;

  const getBackgroundStyle = () => {
    if (portfolio?.bg_type === 'solid') return { backgroundColor: portfolio.bg_color || '#ffffff' };
    if (portfolio?.bg_type === 'gradient') return { background: portfolio.bg_gradient || 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' };
    return {}; // Default animated background uses CSS classes
  };

  const getSectionClass = (defaultClass) => {
    if (portfolio?.bg_type === 'solid' || portfolio?.bg_type === 'gradient') return 'py-24 bg-transparent';
    return `py-24 ${defaultClass}`;
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen" style={getBackgroundStyle()}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {portfolio?.bg_type === 'animated' && <div className="absolute inset-0 animated-gradient opacity-90" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
        {portfolio?.bg_type === 'animated' && (
          <>
            <motion.div animate={{ y: [-30, 30, -30], x: [-20, 20, -20], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <motion.div animate={{ y: [30, -30, 30], x: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-hot-pink/20 blur-3xl" />
          </>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="text-left">
              <motion.div variants={fadeInUp} className="mb-6">
                <Badge className="px-4 py-2 text-sm gradient-bg text-white mb-4">
                  <Typewriter text="Software Engineer" delay={100} />
                </Badge>
                <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
                  {portfolio?.name ? (
                    <>
                      <span className="block text-white/40"><Typewriter text={portfolio.name.split(' ')[0].toUpperCase()} delay={150} /></span>
                      <span className="block gradient-text"><Typewriter text={portfolio.name.split(' ').slice(1).join(' ').toUpperCase() || 'ILMI'} delay={200} /></span>
                    </>
                  ) : (
                    <>
                      <span className="block text-white/40"><Typewriter text="MAVERICK" delay={150} /></span>
                      <span className="block gradient-text"><Typewriter text="FIRZA ILMI" delay={200} /></span>
                    </>
                  )}
                </h1>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-xl md:text-2xl text-white/80 mb-8 font-light max-w-lg leading-relaxed">
                <Typewriter
                  text={portfolio?.bio || 'Passionate about building scalable applications and crafting intuitive user experiences.'}
                  delay={30}
                  onComplete={() => {
                    if (!isPlaying) playTrack(tracks[0]);
                  }}
                />
              </motion.div>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link to={username ? `/p/${username}/projects` : '/projects'}>
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg gradient-bg text-white shadow-lg hover:opacity-90 transition-all">
                    View Projects <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-sm" onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Contact Me
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Photo */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-[600px] hidden lg:block">
              {/* Background Elements */}
              <div className="absolute right-0 top-0 w-3/4 h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[3rem] backdrop-blur-3xl -z-10" />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute right-20 top-20 w-96 h-96 border border-white/10 rounded-full border-dashed -z-10" />

              {/* Main Photo with Subtle Floating Animation */}
              <div className="absolute bottom-0 right-10 z-10 w-full h-[90%] flex items-end justify-center">
                <motion.div
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full flex items-end justify-center"
                >
                  <motion.img
                    src={portfolio?.avatar_url || PROFILE_PHOTO}
                    alt={portfolio?.name}
                    className="max-h-full object-cover filter drop-shadow-2xl rounded-[3rem] border-4 border-white/10"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />

        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </section>

      {/* About Section */}
      {portfolio?.sections_visible?.about !== false && (
        <section id="about" className={getSectionClass('gradient-bg-soft')}>
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
        <section className={getSectionClass('gradient-bg-page')}>
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">My Expertise</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Skills & Technologies</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {portfolio?.skills?.map((skill, index) => (
                <motion.div key={skill.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                  <Card className="card-hover border-0 shadow-card overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">{skill.name}</span>
                        <Badge variant="outline" className="text-royal-purple border-royal-purple">{skill.category}</Badge>
                      </div>
                      <div className="relative h-2 bg-purple-100/50 rounded-full overflow-hidden">
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
      {(portfolio?.sections_visible?.experience !== false || portfolio?.cv_data || portfolio?.cv_url) && (
        <section className={getSectionClass('gradient-bg-soft')}>
          <div className="container mx-auto px-4">
            {portfolio?.experience?.length > 0 && portfolio?.sections_visible?.experience !== false && (
              <>
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                  <Badge className="mb-4 gradient-bg text-white px-4 py-1">Career Journey</Badge>
                  <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Experience</h2>
                </motion.div>
                <div className="max-w-3xl mx-auto space-y-6">
                  {portfolio?.experience?.map((exp, index) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.02 }}>
                      <Card className="card-hover border-l-4 border-l-royal-purple bg-white/50 backdrop-blur-sm">
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
              </>
            )}

            {(portfolio?.cv_data || portfolio?.cv_url) && (
              <div className="mt-12 text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => {
                        if (portfolio.cv_data) {
                          const base64Content = portfolio.cv_data.split(',')[1];
                          const byteCharacters = atob(base64Content);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: 'application/pdf' });
                          const fileURL = URL.createObjectURL(blob);
                          window.open(fileURL, '_blank');
                        } else if (portfolio.cv_url) {
                          window.open(portfolio.cv_url, '_blank');
                        }
                      }}
                      className="gradient-bg text-white px-8 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg group w-full sm:w-auto"
                    >
                      <Eye className="mr-3 w-6 h-6 group-hover:pulse" />
                      View Resume
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild variant="outline" className="border-2 border-royal-purple/20 bg-white/80 backdrop-blur-sm text-royal-purple px-8 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg group w-full sm:w-auto">
                      <a href={portfolio.cv_data || portfolio.cv_url} download={portfolio.cv_filename || "Miryam_Abida_CV.pdf"} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-3 w-6 h-6 group-hover:bounce" />
                        Download PDF
                      </a>
                    </Button>
                  </motion.div>
                </div>
                <p className="mt-6 text-muted-foreground text-sm font-medium italic">Professional Resume • PDF Format</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {portfolio?.sections_visible?.projects !== false && portfolio?.projects?.length > 0 && (
        <section className={getSectionClass('gradient-bg-page')}>
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <Badge className="mb-4 gradient-bg text-white px-4 py-1">Portfolio</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">Featured Projects</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {portfolio?.projects?.map((project, index) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }}>
                  <Card className="card-hover overflow-hidden border-0 shadow-card group h-full bg-white/50 backdrop-blur-sm">
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
        <section id="contact-section" className={getSectionClass('gradient-bg-soft')}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Badge className="mb-4 gradient-bg text-white px-4 py-1">Get in Touch</Badge>
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 gradient-text">Let's Create Something Amazing</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">Have a vision or a project you'd like to discuss? I'm available for freelance opportunities and collaborations.</p>
                <div className="space-y-6 mt-8">
                  {portfolio?.contact?.email && (
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href = `mailto:${portfolio.contact.email}`}>
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:gradient-bg transition-all duration-300">
                        <Mail className="w-6 h-6 text-royal-purple group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Email Me</p>
                        <p className="text-lg font-bold">{portfolio.contact.email}</p>
                      </div>
                    </div>
                  )}
                  {portfolio?.contact?.location && (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <Home className="w-6 h-6 text-royal-purple" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                        <p className="text-lg font-bold">{portfolio.contact.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md p-2">
                  <CardHeader>
                    <CardTitle className="text-2xl font-display">Send a Message</CardTitle>
                    <CardDescription>I'll get back to you as soon as possible.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Name</Label><Input placeholder="Your Name" className="border-purple-100 focus:border-royal-purple bg-white/50" /></div>
                      <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="your@email.com" className="border-purple-100 focus:border-royal-purple bg-white/50" /></div>
                    </div>
                    <div className="space-y-2"><Label>Subject</Label><Input placeholder="How can I help?" className="border-purple-100 focus:border-royal-purple bg-white/50" /></div>
                    <div className="space-y-2"><Label>Message / Feedback</Label><Textarea placeholder="Share your thoughts..." className="min-h-[150px] border-purple-100 focus:border-royal-purple bg-white/50" /></div>
                    <Button className="w-full gradient-bg text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"><Send className="w-5 h-5 mr-2" />Send Message</Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <footer className="py-12 border-t bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">

          <div className="text-left flex-1">
            <AnimatedLogo />
            <p className="text-muted-foreground mt-4 max-w-sm">Designing and building exceptional digital experiences with a focus on creativity and performance.</p>
            <div className="flex gap-4 mt-6">
              {[Image, FileText, Settings].map((Icon, i) => (
                <motion.div key={i} whileHover={{ y: -5, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-royal-purple cursor-pointer hover:gradient-bg hover:text-white transition-all"><Icon className="w-5 h-5" /></motion.div>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right flex-1">
            <p className="text-muted-foreground">© {new Date().getFullYear()} {portfolio?.name}. All rights reserved.</p>
            <p className="text-sm font-medium gradient-text mt-2">Built with React, Framer Motion & Passion</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-royal-purple/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-hot-pink/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
      </footer>
    </motion.div >
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
    } catch { }
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
    try { await api.post("/articles/" + articleId + "/like"); setArticle({ ...article, likes: (article.likes || 0) + 1 }); } catch { }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.author_name || !comment.content) return;
    try {
      const response = await api.post("/articles/" + articleId + "/comment", comment);
      setArticle({ ...article, comments: [...(article.comments || []), response.comment] });
      setComment({ author_name: '', content: '' });
    } catch { }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center gradient-bg-page"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;
  if (!article) return <div className="min-h-screen pt-24 flex items-center justify-center gradient-bg-page"><Card className="max-w-md text-center p-8 card-hover"><AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Article Not Found</h2><p className="text-muted-foreground mb-4">The article doesn't exist.</p><Link to="/articles"><Button className="gradient-bg text-white">Back to Articles</Button></Link></Card></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 gradient-bg-page">
      <article className="container mx-auto px-4 max-w-3xl">
        {article.cover_image && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl overflow-hidden mb-8 shadow-lg"><img src={article.cover_image} alt={article.title} className="w-full h-64 md:h-96 object-cover" /></motion.div>)}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-bold mb-6">{article.title}</motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b">
          <button onClick={handleLike} className="flex items-center gap-2 text-muted-foreground hover:text-hot-pink transition-colors"><Heart className="w-5 h-5" /><span>{article.likes || 0} likes</span></button>
          <span className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="w-5 h-5" /><span>{article.comments?.length || 0} comments</span></span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-royal-purple transition-colors"><Share2 className="w-5 h-5" /><span>Share</span></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}>Copy Link</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}`, '_blank')}>Twitter</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${article.title} ${window.location.href}`, '_blank')}>WhatsApp</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-royal-purple transition-colors"><Download className="w-5 h-5" /><span>Download</span></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.print()}>Save as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const blob = new Blob([`<html><head><title>${article.title}</title></head><body><h1>${article.title}</h1>${article.content}</body></html>`], { type: 'text/html' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${article.title}.html`; a.click();
              }}>Save as HTML</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-lg dark:prose-invert max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content }} />
        <div className="border-t pt-8">
          <h3 className="text-2xl font-display font-bold mb-6">Comments ({article.comments?.length || 0})</h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mb-8">
            <form onSubmit={handleComment}>
              <div className="grid gap-4">
                <Input placeholder="Your name" value={comment.author_name} onChange={(e) => setComment({ ...comment, author_name: e.target.value })} className="border-purple-200 dark:bg-slate-800 dark:border-white/10" required />
                <Textarea placeholder="Add a comment..." value={comment.content} onChange={(e) => setComment({ ...comment, content: e.target.value })} rows={3} className="border-purple-200 dark:bg-slate-800 dark:border-white/10" required />
                <Button type="submit" className="w-full sm:w-auto text-white" style={{ background: 'linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)' }}>Post Comment</Button>
              </div>
            </form>
          </div>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

// Admin Login & Register
const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '', secret_key: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/admin/dashboard'); }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (isLogin) {
        const success = await login(credentials.username, credentials.password);
        if (success) navigate('/admin/dashboard');
        else setError('Invalid credentials');
      } else {
        // Register logic
        if (!credentials.secret_key) {
          setError('Secret Key is required for registration');
          setLoading(false);
          return;
        }
        const success = await register(credentials.username, credentials.password, credentials.secret_key);
        if (success) {
          const personalLink = `advance-portfolio-frontend-${credentials.username.toLowerCase()}.vercel.app`;
          setSuccessMsg(`Registration successful! Your link: ${personalLink}. Please login.`);
          setIsLogin(true);
          setCredentials({ ...credentials, password: '', secret_key: '' });
        }
      }
    } catch (err) {
      console.error(err);
      setError(isLogin ? 'Login failed. Please try again.' : 'Registration failed. Username may exist or error occurred.');
    }
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
            <CardTitle className="text-2xl font-display text-slate-900">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription className="text-slate-600 font-medium">{isLogin ? 'Sign in to your admin dashboard' : 'Join the platform to build your portfolio'}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</motion.div>)}
              {successMsg && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-green-500/10 text-green-600 text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" />{successMsg}</motion.div>)}

              <div className="space-y-2"><Label htmlFor="username" className="text-slate-700 font-semibold">Username</Label><Input id="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} placeholder="Choose a username" className="border-purple-200 focus:border-royal-purple text-slate-900 placeholder:text-slate-400" required /></div>
              <div className="space-y-2"><Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label><Input id="password" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} placeholder="Choose a password" className="border-purple-200 focus:border-royal-purple text-slate-900 placeholder:text-slate-400" required /></div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="secret_key" className="text-slate-700 font-semibold">Secret Key</Label>
                  <Input id="secret_key" type="password" value={credentials.secret_key} onChange={(e) => setCredentials({ ...credentials, secret_key: e.target.value })} placeholder="Create your secret recovery key" className="border-purple-200 focus:border-royal-purple text-slate-900 placeholder:text-slate-400" required />
                  <p className="text-xs text-slate-500">This key is required to recover your account or verify identity.</p>
                </div>
              )}

              <Button type="submit" className="w-full gradient-bg text-white py-6" disabled={loading}>
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <>{isLogin ? <><Sparkles className="w-4 h-4 mr-2" />Sign In</> : <><User className="w-4 h-4 mr-2" />Register</>}</>}
              </Button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-royal-purple hover:underline">
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-6"><Link to="/" className="text-sm text-slate-500 hover:text-royal-purple font-medium transition-colors flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180" />Back to Portfolio</Link></CardFooter>
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
    if (token) {
      api.get('/notifications', token).then(data => {
        const unread = data.filter(n => !n.read);
        setNotifications(unread.slice(0, 5));

        // Show native notification for unread ones on login/refresh
        if (unread.length > 0) {
          showNativeNotification("You have pending tasks!", `You have ${unread.length} unread notifications.`);
        }
      }).catch(() => { });

      // Request permission on mount
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
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

  const { portfolio } = usePortfolio();

  const getAdminBgStyle = () => {
    if (theme === 'dark') return { background: '#0f172a' }; // Force dark bg in dark mode
    if (portfolio?.admin_bg_type === 'solid') return { backgroundColor: portfolio.admin_bg_color || '#f0ebff' };
    return { background: portfolio?.admin_bg_gradient || 'linear-gradient(135deg, rgba(240,235,255,1) 0%, rgba(255,245,250,1) 50%, rgba(240,235,255,1) 100%)' };
  };

  return (
    <div className="min-h-screen flex" style={{ ...getAdminBgStyle(), fontFamily: portfolio?.admin_font_family || 'Inter', color: portfolio?.admin_font_color || 'inherit' }}>
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 280 : 80 }} className="fixed left-0 top-0 h-screen z-40 flex flex-col dark:bg-slate-900/95" style={{ background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.95) 100%)', borderRight: '1px solid rgba(106, 0, 255, 0.1)' }}>
        <div className="p-4 border-b border-purple-100 dark:border-white/10 flex items-center justify-between">
          {sidebarOpen ? <AnimatedLogo /> : <motion.div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center" whileHover={{ scale: 1.05 }}><Sparkles className="w-5 h-5 text-white" /></motion.div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-white/10 transition-colors dark:text-white">{sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={item.path} className={"flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 " + (isActive ? 'sidebar-active bg-gradient-to-r from-royal-purple/10 to-transparent text-royal-purple font-medium dark:text-purple-300' : 'text-muted-foreground hover:bg-purple-50 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white')}>
                    <item.icon className={"w-5 h-5 flex-shrink-0 " + (isActive ? 'text-royal-purple dark:text-purple-300' : '')} />{sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-purple-100 dark:border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-destructive transition-colors"><LogOut className="w-5 h-5" />{sidebarOpen && <span>Logout</span>}</button>
        </div>
      </motion.aside>
      <main className={"flex-1 " + (sidebarOpen ? 'ml-[280px]' : 'ml-20') + " transition-all duration-300 min-h-screen"}>
        <header className="sticky top-0 z-30 px-6 py-3 glass dark:bg-slate-900/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <motion.h1 className="text-xl font-semibold dark:text-white" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</motion.h1>
            <div className="flex items-center gap-3">
              <motion.button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-white/10 transition-colors dark:text-white" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</motion.button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-white/10 transition-colors dark:text-white"><Bell className="w-5 h-5" />{notifications.length > 0 && <motion.span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-hot-pink" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />}</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 dark:bg-slate-900 dark:border-white/10"><div className="p-3 border-b dark:border-white/10"><h3 className="font-semibold dark:text-white">Notifications</h3></div>{notifications.length === 0 ? <div className="p-4 text-center text-muted-foreground">No new notifications</div> : notifications.map(n => (<DropdownMenuItem key={n.id} className="p-3 focus:bg-purple-50 dark:focus:bg-white/10"><div><p className="font-medium text-sm dark:text-white">{n.title}</p><p className="text-xs text-muted-foreground dark:text-white/60">{n.message}</p></div></DropdownMenuItem>))}</DropdownMenuContent>
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
  const { token, user } = useAuth();
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
              <motion.h2 className="text-3xl font-display font-bold text-white mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>Welcome back, {user || 'Admin'}! ✨</motion.h2>
              <motion.p className="text-white/80" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>Here's what's happening with your portfolio today.</motion.p>
            </div>
            <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute right-8 top-1/2 -translate-y-1/2"><Sparkles className="w-24 h-24 text-white/20" /></motion.div>
          </div>
        </Card>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} whileHover={{ y: -5 }}>
            <Card className="border-0 shadow-card overflow-hidden card-hover dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">{stat.label}</p>{loading ? <Skeleton className="w-12 h-8" /> : <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 + index * 0.1 }} className="text-3xl font-bold dark:text-white">{stat.value}</motion.p>}</div>
                  <motion.div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + stat.color + " flex items-center justify-center"} whileHover={{ scale: 1.1, rotate: 5 }}><stat.icon className="w-6 h-6 text-white" /></motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-card dark:bg-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <motion.div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(106, 0, 255, 0.3)", "0 0 20px rgba(255, 94, 207, 0.4)", "0 0 10px rgba(106, 0, 255, 0.3)"] }} transition={{ duration: 2, repeat: Infinity }}><Bot className="w-5 h-5 text-white" /></motion.div>
                <CardTitle className="dark:text-white">AI Suggestions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{suggestions.map((suggestion, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className={"p-4 rounded-lg " + (suggestion.type === 'urgent' ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-500/30' : suggestion.type === 'reminder' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-white/10')}><p className="text-sm dark:text-gray-200">{suggestion.message}</p></motion.div>))}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ to: '/admin/writing', icon: FileText, title: 'Write New Article', desc: 'Share your thoughts', gradient: 'from-royal-purple to-hot-pink' }, { to: '/admin/tasks', icon: Plus, title: 'Add New Task', desc: 'Stay organized', gradient: 'from-hot-pink to-rose-pink' }, { to: '/admin/ai-agent', icon: Bot, title: 'Chat with AI', desc: 'Your personal assistant', gradient: 'from-deep-purple to-royal-purple' }].map((action, index) => (
          <motion.div key={action.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} whileHover={{ y: -5 }}>
            <Link to={action.to}><Card className="border-0 shadow-card cursor-pointer h-full card-hover dark:bg-slate-800"><CardContent className="p-6 flex items-center gap-4"><motion.div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + action.gradient + " flex items-center justify-center"} whileHover={{ scale: 1.1, rotate: 5 }}><action.icon className="w-6 h-6 text-white" /></motion.div><div><h3 className="font-semibold dark:text-white">{action.title}</h3><p className="text-sm text-muted-foreground dark:text-slate-400">{action.desc}</p></div></CardContent></Card></Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Portfolio Editor
const PortfolioEditor = () => {
  const { token } = useAuth();
  const { portfolio, setPortfolio, loading, fetchPortfolio } = usePortfolio();
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('basic');

  const fontOptions = ["Inter", "Roboto", "Outfit", "Playfair Display", "Montserrat", "Poppins", "Lora", "Open Sans", "Syne", "Space Grotesk", "Bricolage Grotesque", "Cormorant Garamond", "Josefin Sans", "Lexend", "Manrope", "Plus Jakarta Sans", "Raleway", "Sora", "Urbanist", "Work Sans"];
  const colorOptions = [
    { name: "Classic Dark", color: "#000000" },
    { name: "Royal Purple", color: "#6A00FF" },
    { name: "Hot Pink", color: "#FF5ECF" },
    { name: "Ocean Blue", color: "#0070F3" },
    { name: "Emerald Green", color: "#10B981" },
    { name: "Sunset Orange", color: "#F59E0B" },
    { name: "Slate Gray", color: "#475569" },
    { name: "Deep Indigo", color: "#4338CA" },
    { name: "Crimson Red", color: "#DC2626" },
    { name: "Midnight Navy", color: "#1E293B" }
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await api.put('/portfolio', portfolio, token);
      fetchPortfolio();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  };
  const updateField = (field, value) => { setPortfolio({ ...portfolio, [field]: value }); };

  if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-full border-4 border-royal-purple border-t-hot-pink" /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-display font-bold dark:text-white">Portfolio Editor</h2><p className="text-muted-foreground dark:text-white/70">Customize your public portfolio</p></div>
        <div className="flex gap-3">
          <Link to="/" target="_blank"><Button variant="outline" className="border-purple-200"><Eye className="w-4 h-4 mr-2" />Preview</Button></Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSave} disabled={saveStatus === 'saving'} className={(saveStatus === 'saved' ? 'bg-green-500 hover:bg-green-600' : 'gradient-bg') + " text-white"}>
              {saveStatus === 'saving' ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" /> : (saveStatus === 'saved' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />)}
              {saveStatus === 'saving' ? 'Saving...' : (saveStatus === 'saved' ? 'Saved!' : 'Save Changes')}
            </Button>
          </motion.div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-2xl bg-purple-100/50 dark:bg-white/10 dark:border dark:border-white/10">
          <TabsTrigger value="basic" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Basic Info</TabsTrigger>
          <TabsTrigger value="appearance" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Appearance</TabsTrigger>
          <TabsTrigger value="skills" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Skills</TabsTrigger>
          <TabsTrigger value="experience" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Experience</TabsTrigger>
          <TabsTrigger value="projects" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Projects</TabsTrigger>
          <TabsTrigger value="contact" className="dark:text-white/60 dark:data-[state=active]:text-white dark:data-[state=active]:bg-white/10">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-card bg-white/70 dark:bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Sun className="w-5 h-5 text-royal-purple" />Main Site Theme</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="dark:text-white">Background Type</Label>
                  <Select value={portfolio?.bg_type || 'animated'} onValueChange={(v) => updateField('bg_type', v)}>
                    <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:text-white">
                      <SelectItem value="animated">Animated (Default)</SelectItem>
                      <SelectItem value="solid">Solid Color (HEX)</SelectItem>
                      <SelectItem value="gradient">Custom Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {portfolio?.bg_type === 'solid' && (
                  <div>
                    <Label className="dark:text-white">Background Color (HEX)</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={portfolio?.bg_color || '#ffffff'} onChange={(e) => updateField('bg_color', e.target.value)} className="w-12 h-10 p-1 border-purple-200 dark:border-white/20" />
                      <Input value={portfolio?.bg_color || '#ffffff'} onChange={(e) => updateField('bg_color', e.target.value)} placeholder="#ffffff" className="flex-1 border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                    </div>
                  </div>
                )}
                {portfolio?.bg_type === 'gradient' && (
                  <div>
                    <Label className="dark:text-white">Gradient CSS</Label>
                    <Input value={portfolio?.bg_gradient || ''} onChange={(e) => updateField('bg_gradient', e.target.value)} placeholder="linear-gradient(...)" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                    <p className="text-[10px] text-muted-foreground dark:text-white/40 mt-1">Example: linear-gradient(135deg, #6A00FF 0%, #FF5ECF 100%)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card bg-white/70 dark:bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Settings className="w-5 h-5 text-royal-purple" />Admin Panel Theme</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="dark:text-white">Background Type</Label>
                  <Select value={portfolio?.admin_bg_type || 'gradient'} onValueChange={(v) => updateField('admin_bg_type', v)}>
                    <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:text-white">
                      <SelectItem value="solid">Solid Color (HEX)</SelectItem>
                      <SelectItem value="gradient">Custom Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {portfolio?.admin_bg_type === 'solid' && (
                  <div>
                    <Label className="dark:text-white">Background Color (HEX)</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={portfolio?.admin_bg_color || '#f0ebff'} onChange={(e) => updateField('admin_bg_color', e.target.value)} className="w-12 h-10 p-1 border-purple-200 dark:border-white/20" />
                      <Input value={portfolio?.admin_bg_color || '#f0ebff'} onChange={(e) => updateField('admin_bg_color', e.target.value)} placeholder="#f0ebff" className="flex-1 border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                    </div>
                  </div>
                )}
                {portfolio?.admin_bg_type === 'gradient' && (
                  <div>
                    <Label className="dark:text-white">Gradient CSS</Label>
                    <Input value={portfolio?.admin_bg_gradient || ''} onChange={(e) => updateField('admin_bg_gradient', e.target.value)} placeholder="linear-gradient(...)" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card bg-white/70 dark:bg-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Type className="w-5 h-5 text-royal-purple" />Typography Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="dark:text-white">Main Site Font</Label>
                    <Select value={portfolio?.font_family || 'Inter'} onValueChange={(v) => updateField('font_family', v)}>
                      <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:text-white">
                        {fontOptions.map(font => <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="dark:text-white">Main Font Color</Label>
                    <Select value={portfolio?.font_style_color || '#000000'} onValueChange={(v) => updateField('font_style_color', v)}>
                      <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:text-white">
                        {colorOptions.map(opt => <SelectItem key={opt.color} value={opt.color}><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />{opt.name}</div></SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="dark:text-white">Admin Dashboard Font</Label>
                    <Select value={portfolio?.admin_font_family || 'Inter'} onValueChange={(v) => updateField('admin_font_family', v)}>
                      <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:text-white">
                        {fontOptions.map(font => <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="dark:text-white">Admin Font Color</Label>
                    <Select value={portfolio?.admin_font_color || '#000000'} onValueChange={(v) => updateField('admin_font_color', v)}>
                      <SelectTrigger className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:text-white">
                        {colorOptions.map(opt => <SelectItem key={opt.color} value={opt.color}><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />{opt.name}</div></SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="basic" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-royal-purple/5 rounded-2xl border border-royal-purple/10">
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <Avatar className="w-24 h-24 border-4 border-royal-purple/20 shadow-xl">
                  <AvatarImage src={portfolio?.avatar_url || PROFILE_PHOTO} />
                  <AvatarFallback className="gradient-bg text-white text-2xl">{portfolio?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateField('avatar_url', reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </motion.div>
              <div className="flex-1 w-full space-y-3">
                <div>
                  <Label htmlFor="avatar_url" className="text-sm font-semibold mb-1 block dark:text-white">Profile Photo URL</Label>
                  <Input id="avatar_url" value={portfolio?.avatar_url || ''} onChange={(e) => updateField('avatar_url', e.target.value)} placeholder="https://example.com/photo.jpg" className="border-purple-200 focus:ring-royal-purple dark:bg-black/20 dark:text-white dark:placeholder:text-white/40" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" className="relative overflow-hidden border-dashed border-purple-300 dark:border-purple-500/50 dark:text-white hover:bg-purple-50 dark:hover:bg-white/10">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateField('avatar_url', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <Upload className="w-3.5 h-3.5 mr-2" /> Upload Local Photo
                  </Button>
                  {portfolio?.avatar_url && portfolio.avatar_url.startsWith('data:') && (
                    <Button variant="ghost" size="sm" onClick={() => updateField('avatar_url', '')} className="text-destructive hover:text-destructive hover:bg-destructive/5 text-xs h-8">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Local
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="name" className="dark:text-white">Full Name</Label><Input id="name" value={portfolio?.name || ''} onChange={(e) => updateField('name', e.target.value)} className="border-purple-200 dark:bg-white/5 dark:text-white dark:border-white/20" /></div>
              <div><Label htmlFor="title" className="dark:text-white">Title / Tagline</Label><Input id="title" value={portfolio?.title || ''} onChange={(e) => updateField('title', e.target.value)} className="border-purple-200 dark:bg-white/5 dark:text-white dark:border-white/20" /></div>
            </div>
            <div><Label htmlFor="bio" className="dark:text-white">Bio</Label><Textarea id="bio" value={portfolio?.bio || ''} onChange={(e) => updateField('bio', e.target.value)} rows={4} className="border-purple-200 dark:bg-white/5 dark:text-white dark:border-white/20" /></div>
            <Separator className="dark:bg-white/10" />
            <div><h3 className="font-semibold mb-4 dark:text-white">Section Visibility</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['hero', 'about', 'skills', 'experience', 'projects', 'contact'].map(section => (
                  <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10"><span className="capitalize dark:text-white">{section}</span><Switch checked={portfolio?.sections_visible?.[section] !== false} onCheckedChange={(checked) => updateField('sections_visible', { ...portfolio?.sections_visible, [section]: checked })} /></div>
                ))}
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="space-y-4">
              {portfolio?.skills?.map((skill, index) => (
                <motion.div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <GripVertical className="w-5 h-5 text-muted-foreground dark:text-white/40 cursor-move" />
                  <Input value={skill.name} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].name = e.target.value; updateField('skills', newSkills); }} className="flex-1 border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" placeholder="Skill name" />
                  <Input type="number" value={skill.level} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].level = parseInt(e.target.value) || 0; updateField('skills', newSkills); }} className="w-20 border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" min="0" max="100" />
                  <Input value={skill.category} onChange={(e) => { const newSkills = [...portfolio.skills]; newSkills[index].category = e.target.value; updateField('skills', newSkills); }} className="w-32 border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" placeholder="Category" />
                  <Button variant="ghost" size="icon" onClick={() => { const newSkills = portfolio.skills.filter((_, i) => i !== index); updateField('skills', newSkills); }} className="dark:text-white/60 dark:hover:text-red-400"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('skills', [...(portfolio?.skills || []), { name: '', level: 50, category: '' }])} className="w-full border-dashed border-purple-300"><Plus className="w-4 h-4 mr-2" />Add Skill</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="experience" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="mb-8 p-4 bg-royal-purple/5 dark:bg-white/5 rounded-xl border border-royal-purple/10 dark:border-white/10">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 dark:text-white"><FileText className="w-5 h-5 text-royal-purple" /> CV / Resume</h3>
              <p className="text-sm text-muted-foreground dark:text-white/60 mb-4">Upload your professional resume for visitors to download.</p>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                  <Label className="dark:text-white">Resume URL (Optional)</Label>
                  <Input value={portfolio?.cv_url || ''} onChange={(e) => updateField('cv_url', e.target.value)} placeholder="https://example.com/resume.pdf" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                </div>
                <div className="w-full md:w-auto">
                  <Label className="dark:text-white">Or Upload File (PDF)</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 md:flex-none border-dashed border-purple-300 dark:border-white/20 dark:text-white relative overflow-hidden">
                      <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPortfolio({ ...portfolio, cv_data: reader.result, cv_filename: file.name });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <Upload className="w-4 h-4 mr-2" /> {portfolio?.cv_filename ? 'Change File' : 'Choose PDF'}
                    </Button>
                    {portfolio?.cv_data && (
                      <Button variant="ghost" size="icon" onClick={() => setPortfolio({ ...portfolio, cv_data: null, cv_filename: null })} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                  {portfolio?.cv_filename && <p className="text-xs text-royal-purple mt-1 font-medium italic">Current: {portfolio.cv_filename}</p>}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {portfolio?.experience?.map((exp, index) => (
                <motion.div key={exp.id || index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10 space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="flex items-center justify-between"><span className="font-medium text-royal-purple dark:text-purple-300">Experience {index + 1}</span><Button variant="ghost" size="icon" onClick={() => { const newExp = portfolio.experience.filter((_, i) => i !== index); updateField('experience', newExp); }} className="dark:text-white/60 dark:hover:text-red-400"><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={exp.title} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].title = e.target.value; updateField('experience', newExp); }} placeholder="Job Title" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                    <Input value={exp.company} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].company = e.target.value; updateField('experience', newExp); }} placeholder="Company" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  </div>
                  <Input value={exp.period} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].period = e.target.value; updateField('experience', newExp); }} placeholder="Period (e.g., 2020 - Present)" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  <Textarea value={exp.description} onChange={(e) => { const newExp = [...portfolio.experience]; newExp[index].description = e.target.value; updateField('experience', newExp); }} placeholder="Description" rows={2} className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('experience', [...(portfolio?.experience || []), { id: Date.now().toString(), title: '', company: '', period: '', description: '' }])} className="w-full border-dashed border-purple-300 dark:border-white/20 dark:text-white"><Plus className="w-4 h-4 mr-2" />Add Experience</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <Card className="border-0 shadow-card"><CardContent className="p-6">
            <div className="space-y-4">
              {portfolio?.projects?.map((project, index) => (
                <motion.div key={project.id || index} className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10 space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <div className="flex items-center justify-between"><span className="font-medium text-royal-purple dark:text-purple-300">Project {index + 1}</span><Button variant="ghost" size="icon" onClick={() => { const newProjects = portfolio.projects.filter((_, i) => i !== index); updateField('projects', newProjects); }} className="dark:text-white/60 dark:hover:text-red-400"><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                  <Input value={project.title} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].title = e.target.value; updateField('projects', newProjects); }} placeholder="Project Title" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  <Textarea value={project.description} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].description = e.target.value; updateField('projects', newProjects); }} placeholder="Description" rows={2} className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  <Input value={project.image} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].image = e.target.value; updateField('projects', newProjects); }} placeholder="Image URL" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                  <Input value={project.tags?.join(', ')} onChange={(e) => { const newProjects = [...portfolio.projects]; newProjects[index].tags = e.target.value.split(',').map(t => t.trim()); updateField('projects', newProjects); }} placeholder="Tags (comma separated)" className="border-purple-200 dark:bg-black/20 dark:text-white dark:border-white/10" />
                </motion.div>
              ))}
              <Button variant="outline" onClick={() => updateField('projects', [...(portfolio?.projects || []), { id: Date.now().toString(), title: '', description: '', image: '', tags: [], link: '' }])} className="w-full border-dashed border-purple-300 dark:border-white/20 dark:text-white"><Plus className="w-4 h-4 mr-2" />Add Project</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <Card className="border-0 shadow-card dark:bg-slate-800"><CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ key: 'email', label: 'Email', placeholder: 'your@email.com' }, { key: 'phone', label: 'Phone', placeholder: '+1 234 567 890' }, { key: 'location', label: 'Location', placeholder: 'City, Country' }, { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' }, { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' }, { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' }].map(field => (
                <div key={field.key}><Label className="dark:text-white">{field.label}</Label><Input value={portfolio?.contact?.[field.key] || ''} onChange={(e) => updateField('contact', { ...portfolio?.contact, [field.key]: e.target.value })} placeholder={field.placeholder} className="border-purple-200 dark:bg-slate-900/50 dark:text-white dark:border-white/10" /></div>
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
      let response;
      try {
        response = await api.post('/ai/chat', { message: input, username: 'admin' }, token);
      } catch (err) {
        console.warn("Main backend AI failed, trying local proxy...");
        // Fallback to Cloudflare Pages Function
        const fallbackRes = await axios.post('/api/ai/chat', { message: input, username: 'admin' });
        response = fallbackRes.data;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      const memData = await api.get('/ai/memory', token);
      setMemories(memData);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]); }
    finally { setLoading(false); }
  };

  const clearMemory = async () => { try { await api.delete('/ai/memory', token); setMemories([]); } catch { } };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-card h-full flex flex-col overflow-hidden dark:bg-slate-800">
          <CardHeader className="gradient-bg text-white">
            <div className="flex items-center gap-3">
              <motion.div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center" animate={{ boxShadow: ["0 0 10px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.3)"] }} transition={{ duration: 2, repeat: Infinity }}><Bot className="w-6 h-6 text-white" /></motion.div>
              <div><CardTitle className="text-white">AI Personal Assistant</CardTitle><CardDescription className="text-white/70">Your intelligent helper with memory</CardDescription></div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (<div className="text-center py-12"><motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}><Bot className="w-16 h-16 mx-auto mb-4 text-royal-purple/30 dark:text-purple-300/30" /></motion.div><h3 className="font-semibold mb-2 dark:text-white">Start a Conversation</h3><p className="text-sm text-muted-foreground dark:text-slate-400 max-w-md mx-auto">I can help you manage tasks, remember important things, and provide productivity suggestions.</p></div>)}
              {messages.map((msg, index) => (<motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}><div className={"max-w-[80%] p-4 rounded-2xl " + (msg.role === 'user' ? 'gradient-bg text-white rounded-br-sm' : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10 dark:text-gray-200 rounded-bl-sm border border-purple-100')}><p className="whitespace-pre-wrap">{msg.content}</p></div></motion.div>))}
              {loading && (<div className="flex justify-start"><div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl rounded-bl-sm border border-purple-100 dark:bg-white/5 dark:border-white/10"><div className="flex gap-1">{[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-2 h-2 rounded-full bg-royal-purple dark:bg-white" />)}</div></div></div>)}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-800 dark:to-slate-800 dark:border-white/10">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3"><Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="flex-1 border-purple-200 dark:bg-slate-900/50 dark:border-white/10 dark:text-white" disabled={loading} /><Button type="submit" className="gradient-bg text-white" disabled={loading}><Send className="w-4 h-4" /></Button></form>
          </div>
        </Card>
      </div>
      <div>
        <Card className="border-0 shadow-card h-full flex flex-col dark:bg-slate-800">
          <CardHeader className="border-b border-purple-100 dark:border-white/10"><div className="flex items-center justify-between"><CardTitle className="text-lg dark:text-white">Memory Bank</CardTitle><Button variant="ghost" size="sm" onClick={clearMemory} className="text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4 mr-1" />Clear</Button></div></CardHeader>
          <ScrollArea className="flex-1"><div className="p-4 space-y-3">{memories.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 dark:text-slate-500">No memories stored yet</p> : memories.slice(0, 10).map(memory => (<motion.div key={memory.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-white/10 dark:to-white/5 text-sm dark:text-gray-300"><p className="line-clamp-3">{memory.content}</p><p className="text-xs text-muted-foreground dark:text-slate-500 mt-2">{new Date(memory.created_at).toLocaleDateString()}</p></motion.div>))}</div></ScrollArea>
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

  const addTask = async () => { if (!newTask.title) return; try { const response = await api.post('/tasks', newTask, token); setTasks([...tasks, response.task]); setNewTask({ title: '', description: '', priority: 'medium', deadline: '' }); setShowAddTask(false); } catch { } };
  const toggleTask = async (taskId, completed) => { try { await api.put("/tasks/" + taskId, { completed: !completed }, token); setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t)); } catch { } };
  const deleteTask = async (taskId) => { try { await api.delete("/tasks/" + taskId, token); setTasks(tasks.filter(t => t.id !== taskId)); } catch { } };

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

// Writing Studio (Mini Microsoft Word Style)
const WritingStudioPage = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentArticle, setCurrentArticle] = useState({ title: '', content: '', excerpt: '', cover_image: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/articles', token).then(setArticles).catch(console.error).finally(() => setLoading(false)); }, [token]);

  const saveArticle = async (publish = false) => {
    if (!currentArticle.title || !currentArticle.content) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put("/articles/" + editing, { ...currentArticle, published: publish }, token);
        setArticles(articles.map(a => a.id === editing ? { ...a, ...currentArticle, published: publish } : a));
      } else {
        const response = await api.post('/articles', { ...currentArticle, published: publish }, token);
        setArticles([response.article, ...articles]);
      }
      setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' });
      setEditing(null);
    } catch { } finally { setSaving(false); }
  };
  const deleteArticle = async (articleId) => { try { await api.delete("/articles/" + articleId, token); setArticles(articles.filter(a => a.id !== articleId)); } catch { } };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }, { 'font': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'clean']
    ],
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-display font-bold dark:text-white">Writing Studio</h2><p className="text-muted-foreground dark:text-white/70">Mini Microsoft Word for your articles</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-slate-200/50 dark:bg-slate-900/50 p-4 md:p-8 rounded-2xl min-h-[800px] flex justify-center">
            <Card className="w-full max-w-[800px] border-0 shadow-2xl bg-white dark:bg-slate-800 min-h-[1056px] flex flex-col">
              <CardHeader className="border-b dark:border-white/10 space-y-4 pt-10 px-12">
                <Input
                  value={currentArticle.title}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                  placeholder="Article Title Here..."
                  className="text-4xl font-bold border-none focus-visible:ring-0 px-0 h-auto dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
                <div className="flex gap-2">
                  <Input value={currentArticle.cover_image} onChange={(e) => setCurrentArticle({ ...currentArticle, cover_image: e.target.value })} placeholder="Cover Image URL" className="text-sm dark:bg-slate-900/50" />
                  <Input value={currentArticle.excerpt} onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })} placeholder="Brief excerpt" className="text-sm dark:bg-slate-900/50" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="writing-word-editor h-full">
                  <div className="sticky top-[68px] z-20 bg-slate-50 dark:bg-slate-900 border-b dark:border-white/10">
                    {/* Toolbar is managed by Quill via the modules prop */}
                  </div>
                  {/* We'll use a direct Quill integration or react-quill if available */}
                  <ReactQuill
                    theme="snow"
                    value={currentArticle.content}
                    onChange={(val) => setCurrentArticle({ ...currentArticle, content: val })}
                    modules={modules}
                    placeholder="Start writing your masterpiece..."
                    className="h-full border-none"
                  />
                </div>
              </CardContent>
              <div className="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-6 border-t dark:border-white/10 flex gap-3 justify-end z-30">
                {editing && <Button variant="ghost" onClick={() => { setCurrentArticle({ title: '', content: '', excerpt: '', cover_image: '' }); setEditing(null); }} className="dark:text-white">Cancel</Button>}
                <Button variant="outline" onClick={() => saveArticle(false)} disabled={saving} className="border-purple-200 dark:border-white/20 dark:text-white">Save Draft</Button>
                <Button onClick={() => saveArticle(true)} className="gradient-bg text-white" disabled={saving}>{saving && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />}Publish</Button>
              </div>
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          <Card className="border-0 shadow-card dark:bg-slate-800"><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold dark:text-white uppercase tracking-wider">All Articles</CardTitle></CardHeader><CardContent className="px-2">
            <ScrollArea className="h-[600px]">
              {loading ? <div className="space-y-3 p-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div> : articles.length === 0 ? <div className="text-center py-8"><FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">No articles yet</p></div> : (
                <div className="space-y-1 p-2">{articles.map(article => (<div key={article.id} className={"p-2 rounded-lg cursor-pointer transition-colors " + (editing === article.id ? 'bg-royal-purple/10 border-l-2 border-royal-purple' : 'hover:bg-slate-100 dark:hover:bg-white/5')} onClick={() => { setCurrentArticle({ title: article.title, content: article.content, excerpt: article.excerpt || '', cover_image: article.cover_image || '' }); setEditing(article.id); }}><div className="flex items-start justify-between gap-2 text-sm font-medium dark:text-white mb-1"><span className="line-clamp-1">{article.title}</span><Badge variant={article.published ? 'default' : 'secondary'} className={article.published ? 'text-[10px] h-4 bg-green-500' : 'text-[10px] h-4'}>{article.published ? 'LIVE' : 'DRAFT'}</Badge></div><div className="flex justify-end"><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-40 hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }}><Trash2 className="w-3 h-3" /></Button></div></div>))}</div>
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

  const toggleVisibility = async (photoId, visible) => { try { await api.put("/gallery/" + photoId, { visible: !visible }, token); setPhotos(photos.map(p => p.id === photoId ? { ...p, visible: !visible } : p)); } catch { } };
  const updateCaption = async (photoId, caption) => { try { await api.put("/gallery/" + photoId, { caption }, token); setPhotos(photos.map(p => p.id === photoId ? { ...p, caption } : p)); } catch { } };

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
  const { user } = useAuth();
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
        <div className="flex items-center gap-4"><Avatar className="w-16 h-16 border-2 border-royal-purple/20"><AvatarImage src={PROFILE_PHOTO} /><AvatarFallback className="gradient-bg text-white text-xl">{user?.charAt(0).toUpperCase() || 'A'}</AvatarFallback></Avatar><div><p className="font-semibold">{user || 'Administrator'}</p><p className="text-sm text-muted-foreground">Role: Admin</p></div></div>
      </CardContent></Card>

      <MusicManager />
    </motion.div>
  );
};

const MusicManager = () => {
  const { tracks, addTrack, removeTrack, updateTrack } = useMusic();
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackFile, setNewTrackFile] = useState(null);

  const handleAddTrack = () => {
    if (!newTrackFile || !newTrackName) return;
    // In a real app, you would upload the file here. 
    // For this fast implementation, we'll create a local object URL (which works temporarily)
    // or assume the user puts it in /music manually if no backend.
    // Given requirements, we will use ObjectURL for immediate feedback.
    const url = URL.createObjectURL(newTrackFile);
    addTrack({ name: newTrackName.toLowerCase(), url, artist: 'Custom Upload' });
    setNewTrackName('');
    setNewTrackFile(null);
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Music className="w-5 h-5 text-royal-purple" /> Music Manager</CardTitle>
        <CardDescription>Manage playlist songs (Add, Rename, Remove)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Song Name</Label>
              <Input value={newTrackName} onChange={(e) => setNewTrackName(e.target.value)} placeholder="e.g. my song" />
            </div>
            <div className="space-y-2">
              <Label>Audio File</Label>
              <div className="flex gap-2">
                <Input type="file" accept="audio/*" onChange={(e) => setNewTrackFile(e.target.files[0])} className="cursor-pointer" />
                <Button onClick={handleAddTrack} disabled={!newTrackFile || !newTrackName} className="gradient-bg text-white"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Current Playlist</Label>
          <div className="border rounded-lg divide-y dark:border-white/10">
            {tracks.map((track) => (
              <div key={track.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-royal-purple"><Music className="w-4 h-4" /></div>
                  <Input
                    value={track.name}
                    onChange={(e) => updateTrack(track.id, { name: e.target.value })}
                    className="h-8 w-40 md:w-64 border-transparent hover:border-input focus:border-royal-purple bg-transparent"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeTrack(track.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


// Main App
function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <PortfolioProvider>
              <MusicProvider>
                <StyleManager />
                <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
                  <AnimatePresence mode="wait">
                    {initialLoading ? (
                      <LogoLoader key="loader" onComplete={() => setInitialLoading(false)} />
                    ) : (
                      <>
                        <FloatingAIAgent />
                        <Routes>
                          <Route path="/" element={<><PublicNavbar /><HomePage /></>} />
                          <Route path="/templates" element={<><PublicNavbar /><TemplatesPage /></>} />
                          <Route path="/p/:username" element={<><PublicNavbar /><HomePage /></>} />
                          <Route path="/p/:username/templates" element={<><PublicNavbar /><TemplatesPage /></>} />
                          <Route path="/p/:username/articles" element={<><PublicNavbar /><ArticlesPage /></>} />
                          <Route path="/p/:username/gallery" element={<><PublicNavbar /><GalleryPage /></>} />

                          <Route path="/articles" element={<><PublicNavbar /><ArticlesPage /></>} />
                          <Route path="/articles/:id" element={<><PublicNavbar /><ArticlePage /></>} />
                          <Route path="/gallery" element={<><PublicNavbar /><GalleryPage /></>} />
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
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </MusicProvider>
            </PortfolioProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
