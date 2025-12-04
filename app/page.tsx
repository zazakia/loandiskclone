import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold">Loandisk Clone</h1>
      <p className="text-gray-500">Please sign in to continue.</p>
      <a
        href="/sign-in"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Sign In
      </a>
    </div>
  );
}
