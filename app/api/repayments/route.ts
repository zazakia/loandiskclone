import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { repaymentSchema } from "@/features/repayments/types";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = repaymentSchema.parse(body);

        // Verify loan exists
        const loan = await db.loan.findUnique({
            where: { id: validatedData.loanId },
        });

        if (!loan) {
            return new NextResponse("Loan not found", { status: 404 });
        }

        // Create repayment
        const repayment = await db.repayment.create({
            data: {
                ...validatedData,
                date: new Date(validatedData.date),
            },
        });

        // Calculate totals to check if loan is fully paid
        const allRepayments = await db.repayment.findMany({
            where: { loanId: validatedData.loanId },
        });

        const totalPaid = allRepayments.reduce((sum: number, r: { amount: any }) => sum + Number(r.amount), 0);
        const principal = Number(loan.principal);
        const interest = Number(loan.interestRate); // Assuming flat rate for MVP
        const totalDue = principal + (principal * interest / 100);

        if (totalPaid >= totalDue) {
            await db.loan.update({
                where: { id: loan.id },
                data: { status: "COMPLETED" },
            });
        } else if (loan.status === "PENDING" || loan.status === "APPROVED") {
            // Auto-disburse if first payment is made (simplification)
            // Or just ensure it's marked as DISBURSED if it wasn't already
            await db.loan.update({
                where: { id: loan.id },
                data: { status: "DISBURSED" },
            });
        }

        return NextResponse.json(repayment);
    } catch (error) {
        console.error("[REPAYMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const loanId = searchParams.get("loanId");

        const whereClause = loanId ? { loanId } : {};

        const repayments = await db.repayment.findMany({
            where: whereClause,
            include: {
                loan: {
                    include: {
                        borrower: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(repayments);
    } catch (error) {
        console.error("[REPAYMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
