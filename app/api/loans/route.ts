import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { loanSchema } from "@/features/loans/types/index";

export async function POST(req: Request) {
    try {
        // Skip auth check for testing
        // const { userId } = await auth();
        // if (!userId) {
        //     return new NextResponse("Unauthorized", { status: 401 });
        // }

        const body = await req.json();
        const validatedData = loanSchema.parse(body);

        try {
            const fs = require('fs');
            fs.appendFileSync('debug.log', `[LOANS_POST] Validated Data: ${JSON.stringify(validatedData, null, 2)}\n`);
        } catch (e) {
            console.error("Failed to write to debug log", e);
        }

        // Get the borrower's branch to assign the loan to the same branch
        const borrower = await db.borrower.findUnique({
            where: { id: validatedData.borrowerId },
        });

        if (!borrower) {
            return new NextResponse("Borrower not found", { status: 404 });
        }

        const loan = await db.loan.create({
            data: {
                ...validatedData,
                branchId: borrower.branchId,
                disbursedAt: validatedData.disbursedAt ? new Date(validatedData.disbursedAt) : null,
                firstRepaymentDate: validatedData.firstRepaymentDate ? new Date(validatedData.firstRepaymentDate) : null,
                status: "PENDING",
            },
        });

        return NextResponse.json(loan);
    } catch (error) {
        console.error("[LOANS_POST]", error);
        try {
            const fs = require('fs');
            fs.appendFileSync('debug.log', `[LOANS_POST] ${new Date().toISOString()} ${error instanceof Error ? error.message : "Unknown error"}\n${error instanceof Error ? error.stack : ""}\n`);
        } catch (e) {
            console.error("Failed to write to debug log", e);
        }
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // Skip auth check for testing
        // const { userId } = await auth();
        // if (!userId) {
        //     return new NextResponse("Unauthorized", { status: 401 });
        // }

        const loans = await db.loan.findMany({
            include: {
                borrower: true,
                product: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(loans);
    } catch (error) {
        console.error("[LOANS_GET]", error);
        try {
            const fs = require('fs');
            fs.appendFileSync('debug.log', `[LOANS_GET] ${new Date().toISOString()} ${error instanceof Error ? error.message : "Unknown error"}\n${error instanceof Error ? error.stack : ""}\n`);
        } catch (e) {
            console.error("Failed to write to debug log", e);
        }
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
