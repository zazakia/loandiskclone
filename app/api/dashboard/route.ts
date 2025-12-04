import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch key metrics in parallel
        const [
            totalBorrowers,
            activeLoansCount,
            totalDisbursed,
            totalRepaid,
        ] = await Promise.all([
            db.borrower.count(),
            db.loan.count({
                where: { status: { in: ["APPROVED", "DISBURSED"] } },
            }),
            db.loan.aggregate({
                _sum: { principal: true },
                where: { status: "DISBURSED" },
            }),
            db.repayment.aggregate({
                _sum: { amount: true },
            }),
        ]);

        // Calculate Portfolio At Risk (PAR) - simplified for MVP
        // In a real app, this would check for overdue payments
        const par = 0;

        return NextResponse.json({
            totalBorrowers,
            activeLoans: activeLoansCount,
            totalDisbursed: Number(totalDisbursed._sum.principal || 0),
            totalRepaid: Number(totalRepaid._sum.amount || 0),
            par,
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
