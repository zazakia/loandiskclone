"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { repaymentSchema, RepaymentFormValues } from "@/features/repayments/types";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function RepaymentForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Fetch loans for the dropdown
    const { data: loans } = useQuery({
        queryKey: ["loans"],
        queryFn: async () => {
            const res = await fetch("/api/loans");
            if (!res.ok) throw new Error("Failed to fetch loans");
            return res.json();
        },
    });

    const form = useForm<RepaymentFormValues>({
        resolver: zodResolver(repaymentSchema) as any,
        defaultValues: {
            loanId: "",
            amount: 0,
            date: new Date().toISOString().split("T")[0],
            method: "CASH",
            notes: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: RepaymentFormValues) => {
            const res = await fetch("/api/repayments", {
                method: "POST",
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to record repayment");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Repayment recorded successfully");
            queryClient.invalidateQueries({ queryKey: ["repayments"] });
            form.reset();
            onSuccess?.();
        },
        onError: () => {
            toast.error("Something went wrong");
        },
        onSettled: () => setLoading(false),
    });

    const onSubmit = (values: RepaymentFormValues) => {
        setLoading(true);
        mutation.mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="loanId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Loan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a loan" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {loans?.map((l: any) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.borrower?.firstName} {l.borrower?.lastName} - ${l.principal}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading}>
                    {loading ? "Recording..." : "Record Repayment"}
                </Button>
            </form>
        </Form>
    );
}
