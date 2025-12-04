"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { LoanForm } from "./LoanForm";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function LoanList() {
    const [open, setOpen] = useState(false);
    const { data: loans, isLoading } = useQuery({
        queryKey: ["loans"],
        queryFn: async () => {
            const res = await fetch("/api/loans");
            if (!res.ok) throw new Error("Failed to fetch loans");
            return res.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Loans</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Application
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>New Loan Application</DialogTitle>
                            <DialogDescription className="hidden">
                                Form to create a new loan application
                            </DialogDescription>
                        </DialogHeader>
                        <LoanForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Interest</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loans?.map((loan: any) => (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium">
                                    {loan.borrower?.firstName} {loan.borrower?.lastName}
                                </TableCell>
                                <TableCell>${loan.principal}</TableCell>
                                <TableCell>{loan.interestRate}%</TableCell>
                                <TableCell>
                                    <Badge variant={loan.status === "APPROVED" ? "default" : "secondary"}>
                                        {loan.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {loans?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No loans found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
