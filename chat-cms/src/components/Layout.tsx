import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc]">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="min-h-screen lg:ml-72">

                <Header
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <main className="p-4 md:p-6 xl:p-8">
                    <div className="mx-auto w-full max-w-[1600px]">
                        {children}
                    </div>
                </main>

            </div>

        </div>
    );
}