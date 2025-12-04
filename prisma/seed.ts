import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    // Seed Branch
    const mainBranch = await prisma.branch.upsert({
        where: { id: "main-branch" },
        update: {},
        create: {
            id: "main-branch",
            name: "Main Branch",
            address: "123 Main Street",
        },
    });

    console.log("Seeded branch:", mainBranch);

    // Seed Borrowers
    const borrower1 = await prisma.borrower.upsert({
        where: { uniqueId: "BOR-001" },
        update: {},
        create: {
            uniqueId: "BOR-001",
            firstName: "John",
            lastName: "Doe",
            mobile: "+1234567890",
            email: "john.doe@example.com",
            branchId: mainBranch.id,
        },
    });

    const borrower2 = await prisma.borrower.upsert({
        where: { uniqueId: "BOR-002" },
        update: {},
        create: {
            uniqueId: "BOR-002",
            firstName: "Jane",
            lastName: "Smith",
            mobile: "+1234567891",
            email: "jane.smith@example.com",
            branchId: mainBranch.id,
        },
    });

    console.log("Seeded borrowers:", { borrower1, borrower2 });

    // Seed Loan Products
    const personalLoan = await prisma.loanProduct.upsert({
        where: { id: "personal-loan-10" },
        update: {},
        create: {
            id: "personal-loan-10",
            name: "Personal Loan (10%)",
            minPrincipal: 1000,
            maxPrincipal: 50000,
            interestRate: 10,
            interestType: "REDUCING",
            term: 12,
            termUnit: "MONTHS",
        },
    });

    const businessLoan = await prisma.loanProduct.upsert({
        where: { id: "business-loan-5" },
        update: {},
        create: {
            id: "business-loan-5",
            name: "Business Loan (5%)",
            minPrincipal: 5000,
            maxPrincipal: 200000,
            interestRate: 5,
            interestType: "REDUCING",
            term: 24,
            termUnit: "MONTHS",
        },
    });

    console.log("Seeded loan products:", { personalLoan, businessLoan });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

