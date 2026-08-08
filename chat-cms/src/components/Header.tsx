import { Bell, ChevronDown, LoaderCircle, LogOut, Menu, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/auth';
import { showErrorMessage } from '../utils/toast.util';

interface HeaderProps { onOpenSidebar: () => void; }

interface UserInfo {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    birthOfDate: string;
    roleName: string[];
}

interface UserResponse {
    data: UserInfo | null;
    message: { message: string; status: number };
}

export default function Header({ onOpenSidebar }: HeaderProps) {
    const navigate = useNavigate();
    const [openProfile, setOpenProfile] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchUser = async () => {
            const token = authService.getToken();
            const username = authService.getPayload()?.username;

            if (!token || !username) {
                authService.removeToken();
                navigate('/login', { replace: true });
                return;
            }

            try {
                const response = await fetch(`https://hust-trolyao-gateway.io.vn/user-service/api/v1/get-user-by-username?username=${encodeURIComponent(username)}`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const result: UserResponse = await response.json();

                if (response.status === 401 || response.status === 403) {
                    authService.removeToken();
                    navigate('/login', { replace: true });
                    return;
                }

                if (!response.ok || result.message.status !== 200 || !result.data) throw new Error(result.message?.message || 'Không thể lấy thông tin tài khoản');
                setUser(result.data);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                showErrorMessage(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
            } finally {
                if (!controller.signal.aborted) setIsLoadingUser(false);
            }
        };

        fetchUser();
        return () => controller.abort();
    }, [navigate]);

    const jwtUsername = authService.getPayload()?.username || '';
    const username = user?.username || jwtUsername;
    const displayName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : 'Đang tải...';
    const avatar = user?.firstName?.charAt(0).toUpperCase() || 'A';

    const handleLogout = () => {
        authService.removeToken();
        navigate('/login', { replace: true });
    };

    const handleOpenProfile = () => {
        setOpenProfile(false);
        navigate('/profile');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-4 backdrop-blur md:px-6 lg:h-20 lg:px-8">
            <div className="flex flex-1 items-center gap-3">
                <button type="button" onClick={onOpenSidebar} className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-100 lg:hidden"><Menu size={22} className="text-gray-700" /></button>
                <div className="hidden w-full max-w-xl items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 md:flex"><Search size={18} className="text-gray-400" /><input type="search" placeholder="Tìm kiếm sinh viên, câu hỏi..." className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" /></div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-100 md:hidden"><Search size={20} className="text-gray-600" /></button>
                <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-red-50 md:h-11 md:w-11"><Bell size={21} className="text-gray-600" /><span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-700" /></button>
                <div className="hidden h-8 w-px bg-gray-200 md:block" />

                <div className="relative">
                    <button type="button" onClick={() => setOpenProfile((current) => !current)} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-gray-50 md:px-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-800 font-bold text-white md:h-11 md:w-11">{isLoadingUser ? <LoaderCircle size={19} className="animate-spin" /> : avatar}</div>
                        <div className="hidden max-w-48 text-left lg:block"><p className="truncate text-sm font-semibold text-gray-900">{displayName}</p><p className="truncate text-xs text-gray-400">{username}</p></div>
                        <ChevronDown size={17} className={`hidden text-gray-400 transition-transform lg:block ${openProfile ? 'rotate-180' : ''}`} />
                    </button>

                    {openProfile && (
                        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/50">
                            <div className="border-b border-gray-100 px-4 py-3"><p className="truncate text-sm font-semibold text-gray-900">{displayName}</p><p className="truncate text-xs text-gray-400">{username}</p>{user?.roleName?.length ? <p className="mt-1 text-xs font-medium text-red-700">{user.roleName.join(', ')}</p> : null}</div>
                            <button type="button" onClick={handleOpenProfile} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"><User size={18} />Thông tin tài khoản</button>
                            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"><LogOut size={18} />Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}