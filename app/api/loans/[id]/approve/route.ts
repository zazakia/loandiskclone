import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// POST /api/loans/[id]/approve - Approve loan
export async function POST(
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

        // TODO: Add role-based authorization (only ADMIN can approve)
        // For now, any authenticated user can approve

        const body = await req.json();
        const { action, notes } = body; // action: 'approve' or 'reject'

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }

        // Check if loan exists
        const existingLoan = await db.loan.findUnique({
            where: { id: params.id },
            include: {
                borrower: true,
                product: true,
            },
        });

        if (!existingLoan) {
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            );
        }

        // Only allow approving/rejecting loans in PENDING status
        if (existingLoan.status !== "PENDING") {
            return NextResponse.json(
                { error: "Can only approve/reject loans in PENDING status" },
                { status: 400 }
            );
        }

        const newStatus = action === 'approve' ? 'APPROVED' : 'WRITTEN_OFF';

        const updatedLoan = await db.loan.update({
            where: { id: params.id },
            data: {
                status: newStatus,
                // Store approval/rejection info in customFields
                customFields: {
                    ...(existingLoan.customFields as object || {}),
                    approvalAction: action,
                    approvalNotes: notes || null,
                    approvedBy: userId,
                    approvedAt: new Date().toISOString(),
                },
            },
            include: {
                borrower: true,
                product: true,
            },
        });

        return NextResponse.json({
            message: `Loan ${action}d successfully`,
            loan: updatedLoan,
        });
    } catch (error) {
        console.error("[LOAN_APPROVE]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
