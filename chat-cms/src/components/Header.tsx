import {Bell, Search, ChevronDown, Menu, User, LogOut} from "lucide-react";
import { useState } from "react";

interface HeaderProps { onOpenSidebar: () => void; }

export default function Header({ onOpenSidebar }: HeaderProps) {
    const [openProfile, setOpenProfile] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 lg:h-20 items-center justify-between border-b border-gray-100 bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-3">
                <button onClick={onOpenSidebar} className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-100 lg:hidden"><Menu size={22} className="text-gray-700" /></button>
                <div className="hidden w-full max-w-xl items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 md:flex"><Search size={18} className="text-gray-400" /><input placeholder="Tìm kiếm sinh viên, câu hỏi..." className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" /></div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-100 md:hidden"><Search size={20} className="text-gray-600" /></button>

                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-red-50 md:h-11 md:w-11">
                    <Bell size={21} className="text-gray-600" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-700" />
                </button>

                <div className="hidden h-8 w-px bg-gray-200 md:block" />

                <div className="relative">
                    <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-gray-50 md:px-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-700 to-red-900 font-bold text-white shadow-lg shadow-red-700/20 md:h-11 md:w-11">A</div>
                        <div className="hidden text-left lg:block"><p className="text-sm font-semibold text-gray-900">Admin</p><p className="text-xs text-gray-400">HUST Assistant</p></div>
                        <ChevronDown size={17} className={`hidden text-gray-400 transition-transform lg:block ${openProfile ? "rotate-180" : ""}`} />
                    </button>

                    {openProfile && (
                        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/50">
                            <div className="border-b border-gray-100 px-4 py-3"><p className="text-sm font-semibold text-gray-900">Admin</p><p className="text-xs text-gray-400">admin@hust.edu.vn</p></div>
                            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"><User size={18}/>Thông tin tài khoản</button>
                            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"><LogOut size={18}/>Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}