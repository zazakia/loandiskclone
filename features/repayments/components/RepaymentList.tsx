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
import { RepaymentForm } from "./RepaymentForm";
import { useState } from "react";

export function RepaymentList() {
    const [open, setOpen] = useState(false);
    const { data: repayments, isLoading } = useQuery({
        queryKey: ["repayments"],
        queryFn: async () => {
            const res = await fetch("/api/repayments");
            if (!res.ok) throw new Error("Failed to fetch repayments");
            return res.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Repayments</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Record Repayment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Record New Repayment</DialogTitle>
                            <DialogDescription className="hidden">
                                Form to record a new repayment
                            </DialogDescription>
                        </DialogHeader>
                        <RepaymentForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {repayments?.map((repayment: any) => (
                            <TableRow key={repayment.id}>
                                <TableCell className="font-medium">
                                    {repayment.loan?.borrower?.firstName} {repayment.loan?.borrower?.lastName}
                                </TableCell>
                                <TableCell>${repayment.amount}</TableCell>
                                <TableCell>{repayment.method}</TableCell>
                                <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {repayments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    No repayments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
