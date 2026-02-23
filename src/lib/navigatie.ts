import { LayoutDashboard, PlusCircle, Settings, HelpCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: "/",             label: "Applicatieplaat", icon: LayoutDashboard },
  { href: "/invoer",       label: "Data invoeren",   icon: PlusCircle },
  { href: "/instellingen", label: "Instellingen",    icon: Settings },
  { href: "/help",         label: "Help",            icon: HelpCircle },
]
