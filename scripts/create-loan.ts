import { db } from "../lib/db/index.ts";

async function main() {
    try {
        console.log("Fetching borrowers...");
        const borrower = await db.borrower.findFirst();
        if (!borrower) {
            console.error("No borrowers found!");
            return;
        }
        console.log(`Found borrower: ${borrower.firstName} ${borrower.lastName} (${borrower.id})`);

        console.log("Fetching loan products...");
        const product = await db.loanProduct.findFirst();
        if (!product) {
            console.error("No loan products found!");
            return;
        }
        console.log(`Found product: ${product.name} (${product.id})`);

        console.log("Attempting to create loan...");
        const loan = await db.loan.create({
            data: {
                borrowerId: borrower.id,
                productId: product.id,
                principal: 5000,
                interestRate: 10,
                duration: 12,
                repaymentCycle: "MONTHLY",
                status: "PENDING",
                branchId: borrower.branchId,
            }
        });
        console.log("Loan created successfully:", loan.id);

    } catch (error) {
        console.error("Failed to create loan:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
