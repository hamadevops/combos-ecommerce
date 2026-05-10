import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  ChevronDown,
  Shield,
  Lock,
  FileText,
  Hash,
  Tag,
  Webhook,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";

import { PermissionEnum } from "@/constants/permissions";

type SidebarItemType = {
  icon: any;
  label: string;
  href?: string;
  permissions?: string[];
  children?: { label: string; href: string; icon?: any; permissions?: string[] }[];
};

const sidebarItems: SidebarItemType[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", permissions: [PermissionEnum.DASHBOARD_VIEW] },
  {
    icon: Package,
    label: "Sản phẩm",
    permissions: [PermissionEnum.PRODUCT_READ],
    children: [
      {
        label: "Tất cả sản phẩm",
        href: "/products",
        icon: Package,
        permissions: [PermissionEnum.PRODUCT_READ],
      },
      {
        label: "Danh mục",
        href: "/categories",
        icon: FolderTree,
        permissions: [PermissionEnum.CATEGORY_READ],
      },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Kinh doanh",
    // No permissions for Order/Customer yet as per request
    children: [
      {
        label: "Đơn hàng",
        href: "/orders",
        icon: ShoppingCart,
        permissions: [PermissionEnum.ORDER_READ],
      },
      {
        label: "Khách hàng",
        href: "/customers",
        icon: Users,
        permissions: [PermissionEnum.CUSTOMER_READ],
      },
    ],
  },
  {
    icon: FileText,
    label: "Nội dung",
    children: [
      { label: "Bài viết", href: "/blog", icon: FileText, permissions: [PermissionEnum.POST_READ] },
      { label: "Chủ đề", href: "/topics", icon: Hash, permissions: [PermissionEnum.TOPIC_READ] },
      { label: "Thẻ", href: "/tags", icon: Tag, permissions: [PermissionEnum.TAG_READ] },
      {
        label: "Popup",
        href: "/popups",
        icon: MessageSquare,
        permissions: [PermissionEnum.POPUP_READ],
      },
    ],
  },
  {
    icon: Search,
    label: "Pages",
    permissions: [PermissionEnum.PAGE_READ],
    children: [
      {
        label: "SEO Static Page",
        href: "/seo",
        icon: Search,
        permissions: [PermissionEnum.PAGE_READ],
      },
      {
        label: "Other Pages",
        href: "/pages",
        icon: FileText,
        permissions: [PermissionEnum.PAGE_READ],
      }, // Uncovering the hidden pages module
    ],
  },
  {
    icon: Shield,
    label: "Quản trị",
    children: [
      { label: "Thành viên", href: "/users", icon: Users, permissions: [PermissionEnum.USER_READ] },
      { label: "Vai trò", href: "/roles", icon: Lock, permissions: [PermissionEnum.ROLE_READ] },
      { label: "Quyền hạn", href: "/permissions", icon: Shield, permissions: [PermissionEnum.PERMISSION_READ] },
      { label: "Nhóm Quyền", href: "/permission-groups", icon: FolderTree, permissions: [PermissionEnum.PERMISSION_READ] },
    ],
  },
  {
    icon: Settings,
    label: "Cài đặt",
    children: [
      {
        label: "Cấu hình chung",
        href: "/settings",
        icon: Settings,
        permissions: [PermissionEnum.SETTING_READ],
      },
      {
        label: "Webhooks",
        href: "/webhooks",
        icon: Webhook,
        permissions: [PermissionEnum.WEBHOOK_READ],
      },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const SidebarItem = ({ item }: { item: SidebarItemType }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if any child is active to auto-open
  useEffect(() => {
    if (item.children?.some((child) => location.pathname.startsWith(child.href))) {
      setIsOpen(true);
    }
  }, [location.pathname, item.children]);

  const isActive = item.href ? location.pathname === item.href : false;
  const isChildActive = item.children?.some((child) => location.pathname === child.href);

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent text-sidebar-foreground",
              isChildActive && !isOpen && "bg-sidebar-accent/50",
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              {item.label}
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.children.map((child) => {
            const isChildLinkActive = location.pathname === child.href;
            return (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors pl-12",
                  isChildLinkActive
                    ? "text-sidebar-primary font-bold dark:text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
};

const Sidebar = ({ className }: { className?: string }) => {
  const { user } = useUserStore();
  const { logout } = useAuth();
  const { hasPermission } = usePermission();
  const { getSetting } = useShopSettings();
  const shopName = getSetting("store_name", "Cửa hàng");
  const shopLogo = getSetting("store_logo", null);

  // Filter items based on permissions
  const filteredItems = sidebarItems.reduce<SidebarItemType[]>((acc, item) => {

    // Check parent permission (if any)
    // For sections like "Sản phẩm", we might want to show it if ANY child is visible,
    // OR if it has explicit permission.
    // Here we check explicit permission first.
    if (item.permissions && !hasPermission(item.permissions)) {
      return acc;
    }

    const newItem = { ...item };

    if (item.children) {
      newItem.children = item.children.filter((child) => hasPermission(child.permissions));

      // If parent has specific children list but all are hidden, hide parent?
      // Only if parent acts solely as a container (no href)
      // Logic: If item has children defined but filtered list is empty, and item.href is not defined, skip it.
      if (newItem.children.length === 0 && !item.href) {
        return acc;
      }
    }

    acc.push(newItem);
    return acc;
  }, []);

  return (
    <div className={cn("flex h-full flex-col bg-sidebar", className)}>
      {/* Logo */}
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 hover:bg-sidebar-accent/50 transition-colors">
        {shopLogo && <img src={getImageUrl(shopLogo)} alt={shopName} className="h-8 w-auto object-contain" />}
        <span className="text-xl font-semibold text-sidebar-primary truncate">{shopName}</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <SidebarItem key={index} item={item} />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent transition-colors outline-none">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getImageUrl(user.avatar)} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => logout.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => import("@/utils/logger").then((m) => m.logger.downloadLogs())}
              >
                <FolderTree className="mr-2 h-4 w-4" />
                <span>Tải xuống Logs</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r lg:block bg-background">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{title}</h1>
            <ModeToggle />
          </div>
        </header>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6">
          {children}
        </motion.div>
      </main>
    </div>
  );
};
