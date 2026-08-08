import { CalendarDays, Cake, LoaderCircle, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/auth';
import { showErrorMessage } from '../utils/toast.util';

interface UserProfile {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    birthOfDate: string;
    roleName: string[];
}

interface UserProfileResponse {
    data: UserProfile | null;
    message: { message: string; status: number };
}

function formatDate(date: string) {
    if (!date) return 'Chưa cập nhật';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(`${date}T00:00:00`));
}

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            const token = authService.getToken();
            const username = authService.getPayload()?.username;

            if (!token || !username) {
                authService.removeToken();
                navigate('/login', { replace: true });
                return;
            }

            try {
                const response = await fetch(`https://hust-trolyao-gateway.io.vn/user-service/api/v1/get-user-by-username?username=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const result: UserProfileResponse = await response.json();

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
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchProfile();
        return () => controller.abort();
    }, [navigate]);

    if (isLoading) {
        return <div className="flex min-h-[420px] items-center justify-center"><LoaderCircle size={28} className="animate-spin text-[#9a001f]" /></div>;
    }

    if (!user) {
        return <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center"><p className="text-sm text-gray-500">Không tìm thấy thông tin tài khoản.</p></div>;
    }

    const fullName = `${user.lastName || ''} ${user.firstName || ''}`.trim() || 'Chưa cập nhật';
    const avatar = user.firstName?.charAt(0).toUpperCase() || 'A';

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Thông tin tài khoản</h1><p className="mt-1 text-sm text-gray-500">Thông tin cá nhân và quyền truy cập của bạn</p></div>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-6 md:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#9a001f] text-3xl font-bold text-white">{avatar}</div>
                        <div className="min-w-0"><h2 className="truncate text-xl font-bold text-gray-900">{fullName}</h2><p className="mt-1 truncate text-sm text-gray-500">{user.username}</p><div className="mt-3 flex flex-wrap gap-2">{user.roleName.map((role) => <span key={role} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#9a001f]">{role}</span>)}</div></div>
                    </div>
                </div>

                <div className="grid gap-x-10 gap-y-6 px-6 py-7 md:grid-cols-2 md:px-8">
                    <ProfileItem icon={<UserRound size={19} />} label="Họ và tên" value={fullName} />
                    <ProfileItem icon={<Mail size={19} />} label="Tài khoản" value={user.username} />
                    <ProfileItem icon={<CalendarDays size={19} />} label="Ngày sinh" value={formatDate(user.birthOfDate)} />
                    <ProfileItem icon={<Cake size={19} />} label="Tuổi" value={user.age ? `${user.age} tuổi` : 'Chưa cập nhật'} />
                    <ProfileItem icon={<ShieldCheck size={19} />} label="Quyền truy cập" value={user.roleName.length ? user.roleName.join(', ') : 'Chưa được cấp quyền'} />
                    <ProfileItem icon={<UserRound size={19} />} label="Mã người dùng" value={`#${user.id}`} />
                </div>
            </section>
        </div>
    );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return <div className="flex items-start gap-3"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">{icon}</div><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-gray-800">{value}</p></div></div>;
}