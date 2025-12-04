import { auth } from "@clerk/nextjs/server";

export default async function TestProtectedPage() {
    const { userId } = await auth();
    return <div>Protected Content. User: {userId}</div>;
}
