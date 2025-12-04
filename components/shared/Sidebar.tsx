"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Banknote,
    PiggyBank,
    TrendingUp,
    Settings,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Borrowers",
        icon: Users,
        href: "/borrowers",
        color: "text-violet-500",
    },
    {
        label: "Loans",
        icon: CreditCard,
        href: "/loans",
        color: "text-pink-700",
    },
    {
        label: "Repayments",
        icon: Banknote,
        href: "/repayments",
        color: "text-orange-700",
    },
    {
        label: "Savings",
        icon: PiggyBank,
        href: "/savings",
        color: "text-emerald-500",
    },
    {
        label: "Investors",
        icon: TrendingUp,
        href: "/investors",
        color: "text-green-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">Loandisk Clone</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="block md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#111827]">
                <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                <SheetDescription className="hidden">
                    Mobile navigation menu
                </SheetDescription>
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
