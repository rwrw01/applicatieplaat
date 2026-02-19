import {
  Cloud, Server, Monitor, RefreshCw, CheckCircle, AlertCircle,
  XCircle, AlertTriangle, Building, Building2, Users, User,
  Lock, Unlock, Shield, ShieldCheck, Star, Heart, Zap,
  Globe, Globe2, Wifi, Database, HardDrive, Cpu,
  FileText, Folder, Mail, Phone, Calendar, Clock,
  Settings, Settings2, Package, Box, Archive,
  TrendingUp, TrendingDown, BarChart, PieChart,
  Home, Map, Navigation, Flag, Bookmark, Tag,
  Bell, BellOff, Eye, EyeOff, Search, Filter,
  Plus, Minus, Check, X, ArrowRight, ArrowLeft,
  ChevronUp, ChevronDown, Info, HelpCircle, Loader,
} from "lucide-react"
import type { ComponentType } from "react"

export interface IcoonOptie {
  naam: string
  type: "lucide" | "emoji"
  component?: ComponentType<{ size?: number; color?: string }>
  emoji?: string
  categorie: string
}

export const ICONEN: IcoonOptie[] = [
  // Infrastructuur
  { naam: "Cloud",      type: "lucide", component: Cloud,       categorie: "Infrastructuur" },
  { naam: "Server",     type: "lucide", component: Server,      categorie: "Infrastructuur" },
  { naam: "Monitor",    type: "lucide", component: Monitor,     categorie: "Infrastructuur" },
  { naam: "Database",   type: "lucide", component: Database,    categorie: "Infrastructuur" },
  { naam: "HardDrive",  type: "lucide", component: HardDrive,   categorie: "Infrastructuur" },
  { naam: "Cpu",        type: "lucide", component: Cpu,         categorie: "Infrastructuur" },
  { naam: "Wifi",       type: "lucide", component: Wifi,        categorie: "Infrastructuur" },

  // Organisatie
  { naam: "Building",   type: "lucide", component: Building,    categorie: "Organisatie" },
  { naam: "Building2",  type: "lucide", component: Building2,   categorie: "Organisatie" },
  { naam: "Users",      type: "lucide", component: Users,       categorie: "Organisatie" },
  { naam: "User",       type: "lucide", component: User,        categorie: "Organisatie" },
  { naam: "Globe",      type: "lucide", component: Globe,       categorie: "Organisatie" },
  { naam: "Globe2",     type: "lucide", component: Globe2,      categorie: "Organisatie" },

  // Status
  { naam: "CheckCircle",   type: "lucide", component: CheckCircle,   categorie: "Status" },
  { naam: "XCircle",       type: "lucide", component: XCircle,       categorie: "Status" },
  { naam: "AlertCircle",   type: "lucide", component: AlertCircle,   categorie: "Status" },
  { naam: "AlertTriangle", type: "lucide", component: AlertTriangle, categorie: "Status" },
  { naam: "ShieldCheck",   type: "lucide", component: ShieldCheck,   categorie: "Status" },
  { naam: "Shield",        type: "lucide", component: Shield,        categorie: "Status" },
  { naam: "Lock",          type: "lucide", component: Lock,          categorie: "Status" },
  { naam: "Unlock",        type: "lucide", component: Unlock,        categorie: "Status" },

  // Algemeen
  { naam: "Star",       type: "lucide", component: Star,        categorie: "Algemeen" },
  { naam: "Heart",      type: "lucide", component: Heart,       categorie: "Algemeen" },
  { naam: "Zap",        type: "lucide", component: Zap,         categorie: "Algemeen" },
  { naam: "Flag",       type: "lucide", component: Flag,        categorie: "Algemeen" },
  { naam: "Bookmark",   type: "lucide", component: Bookmark,    categorie: "Algemeen" },
  { naam: "Tag",        type: "lucide", component: Tag,         categorie: "Algemeen" },
  { naam: "Package",    type: "lucide", component: Package,     categorie: "Algemeen" },
  { naam: "Box",        type: "lucide", component: Box,         categorie: "Algemeen" },
  { naam: "Archive",    type: "lucide", component: Archive,     categorie: "Algemeen" },
  { naam: "RefreshCw",  type: "lucide", component: RefreshCw,   categorie: "Algemeen" },
  { naam: "Settings",   type: "lucide", component: Settings,    categorie: "Algemeen" },
  { naam: "Calendar",   type: "lucide", component: Calendar,    categorie: "Algemeen" },
  { naam: "Clock",      type: "lucide", component: Clock,       categorie: "Algemeen" },
  { naam: "Mail",       type: "lucide", component: Mail,        categorie: "Algemeen" },
  { naam: "Phone",      type: "lucide", component: Phone,       categorie: "Algemeen" },
  { naam: "Home",       type: "lucide", component: Home,        categorie: "Algemeen" },
  { naam: "Map",        type: "lucide", component: Map,         categorie: "Algemeen" },
  { naam: "TrendingUp", type: "lucide", component: TrendingUp,  categorie: "Analyse" },
  { naam: "BarChart",   type: "lucide", component: BarChart,    categorie: "Analyse" },
  { naam: "PieChart",   type: "lucide", component: PieChart,    categorie: "Analyse" },

  // Vlaggen (emoji)
  { naam: "🇳🇱 Nederland",     type: "emoji", emoji: "🇳🇱", categorie: "Vlaggen" },
  { naam: "🇪🇺 Europa",        type: "emoji", emoji: "🇪🇺", categorie: "Vlaggen" },
  { naam: "🇺🇸 Amerika",       type: "emoji", emoji: "🇺🇸", categorie: "Vlaggen" },
  { naam: "🇬🇧 Verenigd Kon.", type: "emoji", emoji: "🇬🇧", categorie: "Vlaggen" },
  { naam: "🇩🇪 Duitsland",     type: "emoji", emoji: "🇩🇪", categorie: "Vlaggen" },
  { naam: "🇫🇷 Frankrijk",     type: "emoji", emoji: "🇫🇷", categorie: "Vlaggen" },
  { naam: "🇧🇪 Belgie",        type: "emoji", emoji: "🇧🇪", categorie: "Vlaggen" },
  { naam: "🇨🇭 Zwitserland",   type: "emoji", emoji: "🇨🇭", categorie: "Vlaggen" },
  { naam: "🇸🇪 Zweden",        type: "emoji", emoji: "🇸🇪", categorie: "Vlaggen" },
  { naam: "🇳🇴 Noorwegen",     type: "emoji", emoji: "🇳🇴", categorie: "Vlaggen" },
  { naam: "🇩🇰 Denemarken",    type: "emoji", emoji: "🇩🇰", categorie: "Vlaggen" },
]

export function zoekIconen(query: string): IcoonOptie[] {
  if (!query) return ICONEN
  const q = query.toLowerCase()
  return ICONEN.filter(i => i.naam.toLowerCase().includes(q) || i.categorie.toLowerCase().includes(q))
}

export function getIcoonOptie(naam: string): IcoonOptie | undefined {
  return ICONEN.find(i => i.naam === naam)
}