import { z } from "zod";

// Prisma-based LoanProduct type
export interface LoanProduct {
    id: string;
    name: string;
    minPrincipal: number;
    maxPrincipal: number;
    interestRate: number;
    interestType: "FLAT" | "REDUCING";
    term: number;
    termUnit: "DAYS" | "WEEKS" | "MONTHS";
    fees: any | null;
    penalties: any | null;
}

// Form validation schema for creating loan products
export const loanProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    minPrincipal: z.coerce.number().min(0, "Minimum principal must be positive"),
    maxPrincipal: z.coerce.number().min(0, "Maximum principal must be positive"),
    interestRate: z.coerce.number().min(0, "Interest rate must be positive"),
    interestType: z.enum(["FLAT", "REDUCING"]),
    term: z.coerce.number().min(1, "Term must be at least 1"),
    termUnit: z.enum(["DAYS", "WEEKS", "MONTHS"]),
    fees: z.any().optional(),
    penalties: z.any().optional(),
});

export type LoanProductFormValues = z.infer<typeof loanProductSchema>;

// API Response types
export interface LoanProductsResponse {
    data: LoanProduct[];
    error?: string;
}

export interface LoanProductResponse {
    data: LoanProduct;
    error?: string;
}

export interface ApiError {
    error: string;
    details?: any;
}
