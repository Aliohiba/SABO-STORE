import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Home, Package, ShoppingCart, Settings, LogOut, Users, Truck, Mail, Percent, Plus, ListChecks, ExternalLink, LayoutDashboard, DollarSign, Menu, X, UserCog, Palette, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface AdminSidebarProps {
  activePath?: string;
}

export default function AdminSidebar({ activePath }: AdminSidebarProps) {
  const [, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const isActive = (path: string) => {
    return activePath === path;
  };

  const NavItem = ({ href, icon: Icon, label, active = false, badge = false }: any) => (
    <Link href={href} onClick={() => setIsMobileOpen(false)}>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-3 px-3 py-2.5 mb-1 text-[15px] font-medium transition-all duration-200 rounded-lg ${active
          ? "bg-blue-800 text-white shadow-lg shadow-blue-900/50 hover:bg-blue-800"
          : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
          }`}
      >
        <Icon className={`h-5 w-5 ${active ? "text-white" : "text-blue-200 group-hover:text-white"}`} />
        <span>{label}</span>
        {badge && (
          <span className="mr-auto w-2 h-2 bg-red-500 rounded-full animate-pulse border border-blue-900"></span>
        )}
      </Button>
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed to viewport */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-[60] lg:hidden text-gray-800 bg-white shadow-md hover:bg-gray-100 border border-gray-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed right-0 top-0 w-72 h-screen bg-blue-900 text-white shadow-xl z-[60] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 text-white p-2 rounded-xl backdrop-blur-sm shadow-inner border border-white/10">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SABO STORE</h1>
              <p className="text-xs text-blue-200 font-medium">لوحة التحكم</p>
            </div>
          </div>

          {/* Visit Store Button - Separate */}
          <Link href="/" target="_blank" className="block mt-3">
            <div className="flex items-center justify-between gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg group">
              <span className="text-sm font-medium">زيارة المتجر</span>
              <div className="bg-white/20 p-1.5 rounded group-hover:bg-white/30 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Close Button Mobile */}
        <Button variant="ghost" size="icon" className="lg:hidden text-blue-200 hover:text-white hover:bg-white/10 absolute left-3 top-3" onClick={() => setIsMobileOpen(false)}>
          <X className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex flex-col py-3 px-3 gap-4 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">الرئيسية</p>
            <nav className="space-y-0.5">
              <NavItem href="/admin/dashboard" icon={Home} label="نظرة عامة" active={isActive("/admin/dashboard")} />
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">إدارة المتجر</p>
            <nav className="space-y-0.5">
              <NavItem href="/admin/orders" icon={ShoppingCart} label="جميع الطلبات" active={isActive("/admin/orders")} />

              <NavItem href="/admin/products" icon={Package} label="المنتجات" active={isActive("/admin/products")} />
              <NavItem href="/admin/categories" icon={ListChecks} label="التصنيفات" active={isActive("/admin/categories")} />
              <NavItem href="/admin/finance" icon={DollarSign} label="المالية والجرد" active={isActive("/admin/finance")} />
              <NavItem href="/admin/customers" icon={Users} label="العملاء" active={isActive("/admin/customers")} />
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">أدوات وتسويق</p>
            <nav className="space-y-0.5">
              <NavItem href="/admin/marketing" icon={Percent} label="العروض والخصومات" active={isActive("/admin/marketing")} badge={true} />
              <NavItem href="/admin/shipments" icon={Truck} label="شحنات التوصيل" active={isActive("/admin/shipments")} />
              <NavItem href="/admin/support" icon={Mail} label="الدعم الفني" active={isActive("/admin/support")} />
            </nav>
          </div>

          <div className="mt-auto">
            <p className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">الإعدادات</p>
            <nav className="space-y-0.5">
              <NavItem href="/admin/theme" icon={Palette} label="مظهر المتجر" active={isActive("/admin/theme")} />
              <NavItem href="/admin/settings" icon={Settings} label="الإعدادات" active={isActive("/admin/settings")} />
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-blue-800 bg-blue-900 mt-auto">
          {/* Theme Toggle Switch */}
          <div className="flex justify-center mb-4">
            <div
              onClick={() => toggleTheme && toggleTheme()}
              className={`
                    relative w-28 h-9 rounded-full cursor-pointer p-1 transition-all duration-500 border flex items-center
                    ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 justify-end' : 'bg-blue-800/50 border-blue-700/50 hover:bg-blue-800 justify-start'}
                `}
              title={theme === 'dark' ? 'تبديل للوضع النهاري' : 'تبديل للوضع الليلي'}
            >
              <div className="absolute inset-0 flex justify-between items-center px-3 text-[12px] font-medium pointer-events-none select-none">
                <span className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100 text-white' : 'opacity-0'}`}>Dark</span>
                <span className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100 text-blue-200'}`}>Light</span>
              </div>

              <motion.div
                className="w-7 h-7 rounded-full shadow-md flex items-center justify-center relative z-10"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                animate={{
                  backgroundColor: theme === 'dark' ? 'var(--background)' : '#ffffff'
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-blue-400 fill-blue-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-orange-500 fill-orange-500" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-blue-200 font-bold text-sm border border-blue-700">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-blue-300 truncate">admin@sabo.store</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-red-300 hover:text-red-200 hover:bg-red-900/30 text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </>
  );
}
