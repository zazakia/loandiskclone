import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { loanProductSchema } from "@/features/loan-products/types";

export async function GET(req: NextRequest) {
    try {
        // Skip auth check for testing
        // const { userId } = await auth();
        // if (!userId) {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 401 }
        //     );
        // }

        const loanProducts = await db.loanProduct.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(loanProducts);
    } catch (error) {
        console.error("[LOAN_PRODUCTS_GET]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
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
        const validationResult = loanProductSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        // Additional business logic validation
        if (validatedData.maxPrincipal < validatedData.minPrincipal) {
            return NextResponse.json(
                { error: "Maximum principal must be greater than minimum principal" },
                { status: 400 }
            );
        }

        const loanProduct = await db.loanProduct.create({
            data: {
                name: validatedData.name,
                minPrincipal: validatedData.minPrincipal,
                maxPrincipal: validatedData.maxPrincipal,
                interestRate: validatedData.interestRate,
                interestType: validatedData.interestType,
                term: validatedData.term,
                termUnit: validatedData.termUnit,
                fees: validatedData.fees || null,
                penalties: validatedData.penalties || null,
            },
        });

        return NextResponse.json(loanProduct, { status: 201 });
    } catch (error) {
        console.error("[LOAN_PRODUCTS_POST]", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
