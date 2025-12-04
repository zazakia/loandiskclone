import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { loanSchema } from "@/features/loans/types";

// GET /api/loans/[id] - Fetch single loan
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const loan = await db.loan.findUnique({
            where: { id: params.id },
            include: {
                borrower: true,
                product: true,
                branch: true,
                repayments: {
                    orderBy: { date: "desc" },
                },
            },
        });

        if (!loan) {
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(loan);
    } catch (error) {
        console.error("[LOAN_GET]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// PATCH /api/loans/[id] - Update loan
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Validate request body
        const validationResult = loanSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        // Check if loan exists
        const existingLoan = await db.loan.findUnique({
            where: { id: params.id },
        });

        if (!existingLoan) {
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            );
        }

        // Only allow editing loans in PENDING status
        if (existingLoan.status !== "PENDING") {
            return NextResponse.json(
                { error: "Can only edit loans in PENDING status" },
                { status: 400 }
            );
        }

        // Get borrower's branch for validation
        const borrower = await db.borrower.findUnique({
            where: { id: validatedData.borrowerId },
        });

        if (!borrower) {
            return NextResponse.json(
                { error: "Borrower not found" },
                { status: 404 }
            );
        }

        const updatedLoan = await db.loan.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                branchId: borrower.branchId,
                disbursedAt: validatedData.disbursedAt
                    ? new Date(validatedData.disbursedAt)
                    : null,
                firstRepaymentDate: validatedData.firstRepaymentDate
                    ? new Date(validatedData.firstRepaymentDate)
                    : null,
            },
            include: {
                borrower: true,
                product: true,
            },
        });

        return NextResponse.json(updatedLoan);
    } catch (error) {
        console.error("[LOAN_PATCH]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/loans/[id] - Delete loan
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if loan exists
        const existingLoan = await db.loan.findUnique({
            where: { id: params.id },
            include: {
                repayments: true,
            },
        });

        if (!existingLoan) {
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            );
        }

        // Only allow deleting loans in PENDING status with no repayments
        if (existingLoan.status !== "PENDING") {
            return NextResponse.json(
                { error: "Can only delete loans in PENDING status" },
                { status: 400 }
            );
        }

        if (existingLoan.repayments.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete loan with existing repayments" },
                { status: 400 }
            );
        }

        await db.loan.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: "Loan deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("[LOAN_DELETE]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
