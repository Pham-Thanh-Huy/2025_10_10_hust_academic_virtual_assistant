import {Activity, BookOpen, LayoutDashboard, MessageSquareText, Users, X} from "lucide-react";
import {useNavigate} from "react-router-dom";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const menus = [
    {name: "Dashboard", icon: LayoutDashboard, path: "/"},
    {name: "Danh sách học phần", icon: BookOpen, path: "/courses"},
    {name: "Tác vụ đồng bộ", icon: Activity, path: "/jobs"},
    { name: 'Lịch sử chat', icon: MessageSquareText, path: '/chat-history' },
    {name: "Quản lý sinh viên", icon: Users, path: "/students"},
];


export default function Sidebar({open, onClose}: SidebarProps) {
    const navigate = useNavigate();
    return (
        <>
            <div onClick={onClose}
                 className={`fixed inset-0 z-40 bg-black/40 transition-all duration-300 lg:hidden ${open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}/>
            <aside
                className={`fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col overflow-y-auto border-r border-gray-100 bg-white px-5 py-6 transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                <div className="mb-4 flex shrink-0 justify-end lg:hidden">
                    <button onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-100">
                        <X size={20} className="text-gray-600"/></button>
                </div>
                <div className="mb-12 flex shrink-0 items-center gap-3 px-2"><img src="/hust-logo.svg" alt="HUST Logo"
                                                                                  className="h-10 w-10 object-contain"/>
                    <div className="flex items-center"><h1 className="text-xl font-bold tracking-tight"><span
                        className="text-red-700">HUST</span> <span className="text-gray-800"> CMS</span></h1></div>
                </div>
                <div className="mb-4 shrink-0 px-3"><p
                    className="text-[11px] font-semibold uppercase tracking-wider text-gray-400"> Main Menu </p></div>
                <nav className="flex-1 space-y-2"> {menus.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (<button key={item.path} onClick={() => {
                            navigate(item.path);
                            onClose?.();
                        }}
                                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ${active ? "bg-gradient-to-r bg-red-800 text-white shadow-lg shadow-red-700/20" : "text-gray-600 hover:bg-red-50 hover:text-red-700"}`}>
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? "bg-white/20" : "bg-gray-100 group-hover:bg-red-100"}`}>
                                <Icon size={19}/>
                            </div>

                            <span className="text-sm font-medium">
                {item.name}
            </span>
                        </button>
                    );
                })}
                </nav>

                {/*<div className="mt-6 shrink-0 rounded-2xl border border-red-100 bg-red-50 p-4">*/}
                {/*    <div className="mb-2 flex items-center gap-2">*/}
                {/*        <Circle size={10} fill="#16a34a" className="text-green-600" />*/}

                {/*        <span className="text-sm font-semibold text-gray-800">*/}
                {/*            System Online*/}
                {/*        </span>*/}
                {/*    </div>*/}

                {/*    <p className="text-xs leading-relaxed text-gray-500">*/}
                {/*        HUST Assistant AI đang hoạt động ổn định*/}
                {/*    </p>*/}
                {/*</div>*/}
            </aside>
        </>
    );
}