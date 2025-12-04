import { db } from "../lib/db/index.ts";

async function main() {
    try {
        console.log("Checking Loan Products...");
        const products = await db.loanProduct.findMany();
        console.log(`Found ${products.length} products:`);
        products.forEach(p => console.log(`- ${p.name} (${p.id})`));
    } catch (error) {
        console.error("Failed to fetch products:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
