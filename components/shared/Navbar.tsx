import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "./Sidebar";

export function Navbar() {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
    );
}
