import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { isMockMode, setMockMode } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarDays, 
  Utensils, 
  Receipt, 
  User, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Database,
  Coffee,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMock = isMockMode();

  const customerLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Browse Rooms', path: '/rooms', icon: BedDouble },
    { label: 'My Bookings', path: '/bookings', icon: CalendarDays },
    { label: 'Order Food', path: '/food-order', icon: Utensils },
    { label: 'Payment History', path: '/payments', icon: CreditCard },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Rooms', path: '/admin/rooms', icon: BedDouble },
    { label: 'Manage Bookings', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Food Menu', path: '/admin/food-menu', icon: Coffee },
    { label: 'Food Orders', path: '/admin/food-orders', icon: Utensils },
    { label: 'Manage Payments', path: '/admin/payments', icon: Receipt },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const links = user?.role === 'admin' ? adminLinks : customerLinks;

  const currentLink = links.find(l => l.path === location.pathname);
  const pageTitle = currentLink ? currentLink.label : 'Grand Royale';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-card border-r border-border relative z-20">
        {/* Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-serif font-semibold tracking-wider text-primary">GRAND ROYALE</span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 bg-muted/50 rounded-xl border border-border/50 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-serif text-primary font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-500" />}
              {user?.role}
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span>{link.label}</span>
                </div>
                {!isActive && (
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Quick Mock DB Toggle (for user testability) */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Database className="w-3 h-3 text-primary" /> Database:
            </span>
            <button
              onClick={() => setMockMode(!isMock)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                isMock
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}
            >
              {isMock ? 'Mock DB' : 'Flask API'}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            {/* Side Menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-40 md:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <span className="text-lg font-serif font-semibold tracking-wider text-primary">GRAND ROYALE</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 mx-4 my-3 bg-muted/50 rounded-xl border border-border/50 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-serif text-primary font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border space-y-3">
                {/* Quick Mock DB Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Database className="w-3 h-3 text-primary" /> Database:
                  </span>
                  <button
                    onClick={() => setMockMode(!isMock)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                      isMock
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}
                  >
                    {isMock ? 'Mock DB' : 'Flask API'}
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 rounded-md hover:bg-muted md:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg md:text-xl font-medium tracking-wide text-foreground">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Show active indicators */}
            {isMock && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                Mocking Flask API Sandbox
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
