import { db } from "../lib/db/index.ts";

async function main() {
    try {
        console.log("Connecting to database...");
        const userCount = await db.user.count();
        console.log(`Successfully connected! Found ${userCount} users.`);

        console.log("Checking Loan table...");
        const loanCount = await db.loan.count();
        console.log(`Found ${loanCount} loans.`);
    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
