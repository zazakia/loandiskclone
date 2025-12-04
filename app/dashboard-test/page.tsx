import { auth } from "@clerk/nextjs/server";

export default async function DashboardTestPage() {
    const { userId } = await auth();
    return <div>Dashboard Test: {userId}</div>;
}
