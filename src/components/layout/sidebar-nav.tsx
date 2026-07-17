import Link from "next/link";
import {
  CalendarDays,
  FileText,
  FlaskConical,
  Gauge,
  Home,
  LineChart,
  MessageCircle,
  NotebookText,
  Settings,
  Stethoscope,
  Syringe
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/symptoms", label: "Symptoms", icon: LineChart },
  { href: "/treatments", label: "Treatments", icon: Stethoscope },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/timeline", label: "Timeline", icon: NotebookText },
  { href: "/reports", label: "Reports", icon: Syringe },
  { href: "/assistant", label: "AI Assistant", icon: MessageCircle },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function SidebarNav() {
  return (
    <aside className="border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link className="text-lg font-semibold tracking-normal" href="/">
          EndoGuide
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
