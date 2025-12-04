"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loanSchema, LoanFormValues } from "@/features/loans/types";
import { LoanProduct } from "@/features/loan-products/types";
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

export function LoanForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Fetch borrowers for the dropdown
    const { data: borrowers } = useQuery({
        queryKey: ["borrowers"],
        queryFn: async () => {
            const res = await fetch("/api/borrowers");
            if (!res.ok) throw new Error("Failed to fetch borrowers");
            return res.json();
        },
    });

    // Fetch loan products for the dropdown
    const { data: loanProducts, isLoading: isLoadingProducts, error: productsError } = useQuery<LoanProduct[]>({
        queryKey: ["loan-products"],
        queryFn: async () => {
            const res = await fetch("/api/loan-products");
            if (!res.ok) throw new Error("Failed to fetch loan products");
            return res.json();
        },
    });

    const form = useForm<LoanFormValues>({
        resolver: zodResolver(loanSchema) as any,
        defaultValues: {
            borrowerId: "",
            productId: "",
            principal: 0,
            interestRate: 0,
            duration: 1,
            repaymentCycle: "MONTHLY",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: LoanFormValues) => {
            const res = await fetch("/api/loans", {
                method: "POST",
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to create loan");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Loan application created successfully");
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            form.reset();
            onSuccess?.();
        },
        onError: () => {
            toast.error("Something went wrong");
        },
        onSettled: () => setLoading(false),
    });

    const onSubmit = (values: LoanFormValues) => {
        setLoading(true);
        mutation.mutate(values);
    };

    // Show error state if loan products failed to load
    if (productsError) {
        return (
            <div className="p-4 border border-red-200 rounded-md bg-red-50" data-testid="loan-products-error">
                <p className="text-sm text-red-800">
                    Failed to load loan products. Please try again later.
                </p>
            </div>
        );
    }

    // Show loading state while fetching loan products
    if (isLoadingProducts) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    // Show message if no loan products available
    if (!loanProducts || loanProducts.length === 0) {
        return (
            <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50" data-testid="loan-products-empty">
                <p className="text-sm text-yellow-800">
                    No loan products available. Please contact an administrator to create loan products first.
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="borrowerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Borrower</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger data-testid="borrower-select">
                                        <SelectValue placeholder="Select a borrower" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {borrowers?.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.firstName} {b.lastName} ({b.uniqueId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loan Product</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger data-testid="loan-product-select">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {loanProducts?.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
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
                        name="principal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Principal Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} data-testid="principal-input" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="interestRate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Interest Rate (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} data-testid="interest-rate-input" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} data-testid="duration-input" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="repaymentCycle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Repayment Cycle</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger data-testid="repayment-cycle-select">
                                            <SelectValue placeholder="Select cycle" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={loading} data-testid="submit-loan-button">
                    {loading ? "Submitting..." : "Submit Application"}
                </Button>
            </form>
        </Form>
    );
}
