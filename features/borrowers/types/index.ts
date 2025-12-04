import { z } from "zod";

export const borrowerSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    businessName: z.string().optional(),
    uniqueId: z.string().min(1, "Unique ID is required"),
    mobile: z.string().min(10, "Valid mobile number is required"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    zipCode: z.string().optional(),
    dob: z.string().optional(), // ISO date string
    gender: z.string().optional(),
});

export type BorrowerFormValues = z.infer<typeof borrowerSchema>;
