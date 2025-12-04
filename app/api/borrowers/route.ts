import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { borrowerSchema } from "@/features/borrowers/types";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const validatedData = borrowerSchema.parse(body);

        // In a real app with RLS, we would get the branchId from the user's context
        // For now, we'll assume a default branch or create one if missing
        // This is a simplification for the MVP
        let branch = await db.branch.findFirst();
        if (!branch) {
            branch = await db.branch.create({
                data: { name: "Main Branch" },
            });
        }

        const borrower = await db.borrower.create({
            data: {
                ...validatedData,
                branchId: branch.id,
                dob: validatedData.dob ? new Date(validatedData.dob) : null,
            },
        });

        return NextResponse.json(borrower);
    } catch (error) {
        console.error("[BORROWERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // Skip auth check for testing
        // const { userId } = await auth();
        // if (!userId) {
        //     return new NextResponse("Unauthorized", { status: 401 });
        // }

        const borrowers = await db.borrower.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(borrowers);
    } catch (error) {
        console.error("[BORROWERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
