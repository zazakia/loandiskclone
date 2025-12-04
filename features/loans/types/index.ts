import { z } from "zod";

export const loanSchema = z.object({
    borrowerId: z.string().min(1, "Borrower is required"),
    productId: z.string().min(1, "Loan Product is required"),
    principal: z.coerce.number().min(1, "Principal must be greater than 0"),
    interestRate: z.coerce.number().min(0, "Interest rate cannot be negative"),
    duration: z.coerce.number().min(1, "Duration must be at least 1"),
    repaymentCycle: z.enum(["DAILY", "WEEKLY", "BI_WEEKLY", "MONTHLY"]),
    disbursedAt: z.string().optional(), // ISO date string
    firstRepaymentDate: z.string().optional(), // ISO date string
});

export type LoanFormValues = z.infer<typeof loanSchema>;
