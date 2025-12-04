"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import { motion } from "framer-motion";
import { Users, CreditCard, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ["dashboard-metrics"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch metrics");
            return res.json();
        },
    });

    // Mock data for charts (since we don't have historical data API yet)
    const chartData = [
        { name: "Jan", total: 1200 },
        { name: "Feb", total: 2100 },
        { name: "Mar", total: 1800 },
        { name: "Apr", total: 2400 },
        { name: "May", total: 3200 },
        { name: "Jun", total: 3800 },
    ];

    if (isLoading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Dashboard
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="backdrop-blur-xl bg-white/50 border-white/20 shadow-xl cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Borrowers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.totalBorrowers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="backdrop-blur-xl bg-white/50 border-white/20 shadow-xl cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics?.activeLoans || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +15 since last week
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="backdrop-blur-xl bg-white/50 border-white/20 shadow-xl cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${metrics?.totalDisbursed?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +19% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="backdrop-blur-xl bg-white/50 border-white/20 shadow-xl cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${metrics?.totalRepaid?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +4% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 backdrop-blur-xl bg-white/50 border-white/20 shadow-xl">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3 backdrop-blur-xl bg-white/50 border-white/20 shadow-xl">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Mock Recent Activity */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Loan Disbursed
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Olivia Martin - $1,500.00
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Just now</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Repayment Received
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Jackson Lee - $250.00
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">2 min ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        New Borrower
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Isabella Nguyen
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">1 hour ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
