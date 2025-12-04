"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { borrowerSchema, BorrowerFormValues } from "@/features/borrowers/types";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function BorrowerForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<BorrowerFormValues>({
        resolver: zodResolver(borrowerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            uniqueId: "",
            mobile: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: BorrowerFormValues) => {
            const res = await fetch("/api/borrowers", {
                method: "POST",
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to create borrower");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Borrower created successfully");
            queryClient.invalidateQueries({ queryKey: ["borrowers"] });
            form.reset();
            onSuccess?.();
        },
        onError: () => {
            toast.error("Something went wrong");
        },
        onSettled: () => setLoading(false),
    });

    const onSubmit = (values: BorrowerFormValues) => {
        setLoading(true);
        mutation.mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="uniqueId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unique ID (National ID)</FormLabel>
                                <FormControl>
                                    <Input placeholder="123456789" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Borrower"}
                </Button>
            </form>
        </Form>
    );
}
