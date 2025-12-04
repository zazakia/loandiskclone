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
import { BorrowerForm } from "./BorrowerForm";
import { useState } from "react";

export function BorrowerList() {
    const [open, setOpen] = useState(false);
    const { data: borrowers, isLoading } = useQuery({
        queryKey: ["borrowers"],
        queryFn: async () => {
            const res = await fetch("/api/borrowers");
            if (!res.ok) throw new Error("Failed to fetch borrowers");
            return res.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Borrowers</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Borrower
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Borrower</DialogTitle>
                            <DialogDescription className="hidden">
                                Form to add a new borrower
                            </DialogDescription>
                        </DialogHeader>
                        <BorrowerForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Unique ID</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {borrowers?.map((borrower: any) => (
                            <TableRow key={borrower.id}>
                                <TableCell className="font-medium">
                                    {borrower.firstName} {borrower.lastName}
                                </TableCell>
                                <TableCell>{borrower.uniqueId}</TableCell>
                                <TableCell>{borrower.mobile}</TableCell>
                                <TableCell>Active</TableCell>
                            </TableRow>
                        ))}
                        {borrowers?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    No borrowers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
