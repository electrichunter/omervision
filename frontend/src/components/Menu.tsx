"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenTool, BookOpen, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import axios from "axios";

// Roller: 1=Admin, 2=Editor, 3=Writer, 4=Reader
const ROLES = {
    ADMIN: 1,
    EDITOR: 2,
    WRITER: 3,
    READER: 4,
};

interface MenuItem {
    name: string;
    href: string;
    icon: any;
    minRole: number; // Bu rol ve altındakiler görebilir (Mantık: ID küçüldükçe yetki artar)
}

const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minRole: ROLES.READER },
    { name: "My Posts", href: "/my-posts", icon: BookOpen, minRole: ROLES.WRITER },
    { name: "Editor", href: "/editor", icon: PenTool, minRole: ROLES.WRITER },
    { name: "Admin Panel", href: "/admin", icon: Shield, minRole: ROLES.ADMIN },
    { name: "Settings", href: "/settings", icon: Settings, minRole: ROLES.READER },
];

export function Menu() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<number>(ROLES.READER); // Varsayılan Reader
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Backend'den kullanıcı rolünü çekme simülasyonu
        // Gerçekte: /users/me endpointinden rol id'si döner
        const fetchUserRole = async () => {
            try {
                const token = Cookies.get("token");
                if (token) {
                    // Örnek: Rolü token'dan veya endpoint'ten al
                    // const res = await axios.get("http://localhost:8000/users/me");
                    // setUserRole(res.data.role_id);

                    // Şimdilik Admin olarak varsayıyorum testi kolaylaştırmak için
                    setUserRole(ROLES.ADMIN);
                }
            } catch (error) {
                console.error("Rol çekilemedi", error);
            }
        };

        fetchUserRole();
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex bg-slate-900 text-white min-h-screen w-64 flex-col justify-between p-4 border-r border-slate-800">
            <div>
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        O
                    </div>
                    <span className="text-xl font-bold tracking-tight">Omervision</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        // Kullanıcı rolü item.minRole'dan küçük veya eşitse (yani daha yetkili veya eşitse) göster
                        // Örn: Admin(1) <= Writer(3) -> True (Görür)
                        // Reader(4) <= Writer(3) -> False (Görmez)
                        if (userRole > item.minRole && item.minRole !== ROLES.READER) return null;

                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-800 pt-4">
                <button
                    onClick={() => {
                        Cookies.remove("token");
                        window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
}
