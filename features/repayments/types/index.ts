import { z } from "zod";

export const repaymentSchema = z.object({
    loanId: z.string().min(1, "Loan is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"), // ISO date string
    method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "ATM"]),
    notes: z.string().optional(),
});

export type RepaymentFormValues = z.infer<typeof repaymentSchema>;
