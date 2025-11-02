"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  CreditCard,
  Shield,
  ScrollText,
  UserPlus,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  permission?: string | null;
  developerOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: "Produk",
    path: "/admin/products",
    icon: Package,
    permission: "products:read",
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Reseller",
    path: "/admin/resellers",
    icon: UserPlus,
    permission: "resellers:read",
  },
  {
    name: "Transaksi",
    path: "/admin/transactions",
    icon: CreditCard,
    permission: "transactions:read",
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
    permission: "users:read",
    developerOnly: true,
  },
  {
    name: "Roles",
    path: "/admin/roles",
    icon: Shield,
    permission: "roles:manage",
    developerOnly: true,
  },
  {
    name: "Activity Logs",
    path: "/admin/logs",
    icon: ScrollText,
    permission: "logs:read",
    developerOnly: true,
  },
];

const sidebarVariants = {
  open: {
    width: 280,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
  closed: {
    width: 80,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const menuItemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium text-muted-foreground">
            Loading admin panel...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isDeveloper = session.user.role === "DEVELOPER";
  const permissions = session.user.permissions || [];

  const hasAccess = (item: MenuItem) => {
    if (item.developerOnly && !isDeveloper) return false;
    if (item.permission && !permissions.includes(item.permission)) return false;
    return true;
  };

  const getPageTitle = () => {
    const currentPage = menuItems.find((item) => item.path === pathname);
    return currentPage ? currentPage.name : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        className={cn(
          "bg-white border-r border-border/40 text-foreground transition-all duration-300 fixed h-full z-50 shadow-xl",
          isMobile && "md:relative"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h1 className="text-lg font-bold text-gradient">
                    Admin Panel
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map(
            (item, index) =>
              hasAccess(item) && (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={item.path}>
                    <Button
                      variant={pathname === item.path ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12 transition-all duration-200",
                        pathname === item.path
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            variants={menuItemVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="font-medium truncate"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </Link>
                </motion.div>
              )
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border/40 space-y-3">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                variants={menuItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <Card className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.user.name}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {session.user.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-start gap-3 h-12"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: isMobile ? 0 : sidebarOpen ? 280 : 80,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
        }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border-b border-border/40 p-6 sticky top-0 z-30"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {session.user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="px-3 py-1 font-medium hidden sm:inline-flex"
              >
                {session.user.role}
              </Badge>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/" target="_blank">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View Store</span>
                </Link>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 p-6 space-y-6 animate-in"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}