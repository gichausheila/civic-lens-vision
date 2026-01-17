import { NavLink } from "@/components/NavLink";
import { Home, Search, Users, Crown, ClipboardList, MessageSquare } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/national-leaders", label: "National", icon: Crown },
  { to: "/leaders", label: "Governors", icon: Users },
  { to: "/surveys", label: "Surveys", icon: ClipboardList },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">CL</span>
            </div>
            <span className="text-xl font-bold text-foreground">CivicLens</span>
          </NavLink>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                activeClassName="bg-primary/10 text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="flex items-center justify-center p-2 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                activeClassName="bg-primary/10 text-primary"
              >
                <item.icon className="h-5 w-5" />
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
