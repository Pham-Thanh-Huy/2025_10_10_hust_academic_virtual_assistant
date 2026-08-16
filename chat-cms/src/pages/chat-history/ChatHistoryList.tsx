import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Eye, LoaderCircle, MessageSquareText, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { chatHistoryService, type ChatDetail, type ChatHistory, type ChatHistoryListParams, type ChatStatus } from '../../services/chatHistoryService';
import ChatDetailModal from './ChatDetailModal';
interface ChatFilters {
    username: string;
    model: string;
    status: '' | ChatStatus;
    start: string;
    end: string;
}
const initialFilters: ChatFilters = {
    username: '',
    model: '',
    status: '',
    start: '',
    end: '',
};
export default function ChatHistoryList() {
    const [chats, setChats] = useState<ChatHistory[]>([]);
    const [filters, setFilters] = useState<ChatFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<ChatFilters>(initialFilters);
    const [selectedChat, setSelectedChat] = useState<ChatDetail | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [, setNumberOfElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        const params: ChatHistoryListParams = {
            page,
            size: pageSize,
            sort: 'id,desc',
        };
        if (appliedFilters.username.trim()) {
            params.username = appliedFilters.username.trim();
        }
        if (appliedFilters.model.trim()) {
            params.model = appliedFilters.model.trim();
        }
        if (appliedFilters.status) {
            params.status = appliedFilters.status;
        }
        if (appliedFilters.start) {
            params.start = formatDateTimeForApi(appliedFilters.start);
        }
        if (appliedFilters.end) {
            params.end = formatDateTimeForApi(appliedFilters.end);
        }
        chatHistoryService
            .getChatHistories(params)
            .then((data) => {
                if (cancelled) return;
                setChats(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
                setNumberOfElements(data.numberOfElements);
                setError('');
            })
            .catch((requestError: unknown) => {
                if (cancelled) return;
                console.error('Không thể tải danh sách lịch sử chat:', requestError);
                setChats([]);
                setTotalPages(0);
                setTotalElements(0);
                setNumberOfElements(0);
                setError('Không thể tải danh sách lịch sử chat. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [appliedFilters, page, pageSize]);
    const visiblePages = useMemo(() => {
        if (totalPages <= 0) return [];
        const maximumVisiblePages = 5;
        let startPage = Math.max(0, page - Math.floor(maximumVisiblePages / 2));
        const endPage = Math.min(totalPages - 1, startPage + maximumVisiblePages - 1);
        startPage = Math.max(0, endPage - maximumVisiblePages + 1);
        return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    }, [page, totalPages]);
    const hasFilter =
        filters.username.trim() !== '' ||
        filters.model.trim() !== '' ||
        filters.status !== '' ||
        filters.start !== '' ||
        filters.end !== '';
    const updateFilter = <K extends keyof ChatFilters>(field: K, value: ChatFilters[K]) => {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));
    };
    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (filters.start && filters.end && filters.start > filters.end) {
            setError('Thời gian bắt đầu không được lớn hơn thời gian kết thúc.');
            return;
        }
        setLoading(true);
        setError('');
        setPage(0);
        setAppliedFilters({
            username: filters.username.trim(),
            model: filters.model.trim(),
            status: filters.status,
            start: filters.start,
            end: filters.end,
        });
    };
    const handleClearFilters = () => {
        setLoading(true);
        setError('');
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    };
    const handlePageChange = (newPage: number) => {
        if (newPage === page || newPage < 0 || newPage >= totalPages) return;
        setLoading(true);
        setPage(newPage);
    };
    const handlePageSizeChange = (newPageSize: number) => {
        setLoading(true);
        setPageSize(newPageSize);
        setPage(0);
    };
    const handleViewDetail = async (id: string) => {
        setSelectedChat(null);
        setDetailModalOpen(true);
        setDetailLoading(true);
        setDetailLoadingId(id);
        setError('');
        try {
            const detail = await chatHistoryService.getChatDetail(id);
            setSelectedChat(detail);
        } catch (requestError) {
            console.error('Không thể tải chi tiết lịch sử chat:', requestError);
            setDetailModalOpen(false);
            setError('Không thể tải chi tiết lịch sử chat.');
        } finally {
            setDetailLoading(false);
            setDetailLoadingId(null);
        }
    };
    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedChat(null);
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Lịch sử chat</h1>
                <p className="mt-2 text-sm text-gray-500">Theo dõi các câu hỏi và câu trả lời trong hệ thống HUST Assistant</p>
            </div>
            <form onSubmit={handleSearch} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <FilterInput
                        label="Người dùng"
                        value={filters.username}
                        placeholder="Nhập email hoặc username..."
                        onChange={(value) => updateFilter('username', value)}
                    />
                    <FilterInput
                        label="Mô hình"
                        value={filters.model}
                        placeholder="Ví dụ: gpt-4o-mini..."
                        onChange={(value) => updateFilter('model', value)}
                    />
                    <StatusFilter
                        value={filters.status}
                        onChange={(value) => updateFilter('status', value)}
                    />
                    <DateTimeFilter
                        label="Thời gian bắt đầu"
                        value={filters.start}
                        onChange={(value) => updateFilter('start', value)}
                    />
                    <DateTimeFilter
                        label="Thời gian kết thúc"
                        value={filters.end}
                        onChange={(value) => updateFilter('end', value)}
                    />
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {hasFilter && (
                        <button type="button" onClick={handleClearFilters} disabled={loading} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
                            <X size={15} />
                            Xóa bộ lọc
                        </button>
                    )}
                    <button type="submit" disabled={loading} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#b5091b] px-4 text-xs font-semibold text-white transition hover:bg-[#960716] disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />}
                        Tìm kiếm
                    </button>
                </div>
            </form>
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-xs">
                        <thead>
                        <tr className="bg-gray-50/70">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Câu hỏi</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Người dùng</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Mô hình</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Thời gian</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading &&
                            chats.map((chat) => (
                                <tr key={chat.id} className="border-t border-gray-100 transition hover:bg-red-50/40">
                                    <td className="max-w-sm px-4 py-3">
                                        <p title={chat.message} className="truncate text-xs font-semibold text-gray-900">
                                            {chat.message || '—'}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-gray-400">Session: {chat.sessionId}</p>
                                    </td>
                                    <td className="max-w-56 px-4 py-3">
                                        <p title={chat.username} className="truncate text-xs text-gray-700">
                                            {chat.username || '—'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="whitespace-nowrap rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{chat.model || '—'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={chat.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{chat.chatAt || '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => void handleViewDetail(chat.id)}
                                            disabled={detailLoadingId === chat.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {detailLoadingId === chat.id ? <LoaderCircle size={16} className="animate-spin" /> : <Eye size={16} />}
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && chats.length > 0 && (
                    <div className="space-y-4 p-4 lg:hidden">
                        {chats.map((chat) => (
                            <div key={chat.id} className="rounded-2xl border border-gray-100 p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <StatusBadge status={chat.status} />
                                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{chat.model || '—'}</span>
                                        </div>
                                        <h3 className="line-clamp-2 font-bold leading-6 text-gray-900">{chat.message || '—'}</h3>
                                    </div>
                                    <button type="button" onClick={() => void handleViewDetail(chat.id)} disabled={detailLoadingId === chat.id} className="shrink-0 rounded-xl bg-red-50 p-3 text-red-700 disabled:opacity-60">
                                        {detailLoadingId === chat.id ? <LoaderCircle size={18} className="animate-spin" /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-gray-500">
                                    <p className="break-all">
                                        <span className="font-medium text-gray-700">Người dùng:</span> {chat.username}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Clock3 size={15} />
                                        {chat.chatAt || '—'}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">Session: {chat.sessionId}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {loading && (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-gray-500">
                        <LoaderCircle size={30} className="animate-spin text-red-700" />
                        <p className="text-sm">Đang tải lịch sử chat...</p>
                    </div>
                )}
                {!loading && chats.length === 0 && (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center text-gray-500">
                        <MessageSquareText size={34} className="text-gray-300" />
                        <p className="text-sm">Không tìm thấy lịch sử chat phù hợp.</p>
                    </div>
                )}
                {!loading && totalElements > 0 && (
                    <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span>
                Trang <strong className="font-semibold text-gray-700">{page + 1}/{totalPages}</strong> · Tổng {totalElements.toLocaleString('vi-VN')} lịch sử chat
              </span>
                            <label className="flex items-center gap-1.5">
                                <span>Số dòng:</span>
                                <div className="relative">
                                    <select value={pageSize} onChange={(event) => handlePageSizeChange(Number(event.target.value))} className="h-7 appearance-none rounded-md border border-gray-200 bg-white pl-2.5 pr-7 text-[11px] font-semibold text-gray-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100">
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                            <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="inline-flex h-7 items-center gap-0.5 rounded-md border border-gray-200 px-2 text-[11px] font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white">
                                <ChevronLeft size={13} />
                                Trước
                            </button>
                            {visiblePages.map((pageNumber) => (
                                <button
                                    type="button"
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`h-7 min-w-7 rounded-md border px-1.5 text-[11px] font-semibold transition ${
                                        page === pageNumber
                                            ? 'border-[#b5091b] bg-[#b5091b] text-white'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
                                    }`}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="inline-flex h-7 items-center gap-0.5 rounded-md border border-gray-200 px-2 text-[11px] font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white">
                                Sau
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {detailModalOpen && <ChatDetailModal chat={selectedChat} loading={detailLoading} close={closeDetailModal} />}
        </div>
    );
}
function FilterInput({
                         label,
                         value,
                         placeholder,
                         onChange,
                     }: {
    label: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 transition focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100">
                <Search size={15} className="shrink-0 text-gray-400" />
                <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none" />
                {value && (
                    <button type="button" onClick={() => onChange('')} className="shrink-0 text-gray-400 transition hover:text-gray-700">
                        <X size={16} />
                    </button>
                )}
            </div>
        </label>
    );
}
function StatusFilter({
                          value,
                          onChange,
                      }: {
    value: '' | ChatStatus;
    onChange: (value: '' | ChatStatus) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Trạng thái</span>
            <div className="relative">
                <select value={value} onChange={(event) => onChange(event.target.value as '' | ChatStatus)} className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100">
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="DELETED">Đã xóa</option>
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        </label>
    );
}
function DateTimeFilter({
                            label,
                            value,
                            onChange,
                        }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</span>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 transition focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100">
                <CalendarDays size={15} className="shrink-0 text-gray-400" />
                <input type="datetime-local" step="1" value={value} onChange={(event) => onChange(event.target.value)} className="w-full min-w-0 bg-transparent text-xs text-gray-700 outline-none" />
            </div>
        </label>
    );
}
function StatusBadge({ status }: { status: ChatStatus }) {
    return (
        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {status === 'ACTIVE' ? 'Hoạt động' : 'Đã xóa'}
    </span>
    );
}
function formatDateTimeForApi(value: string) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return value;
    const seconds = match[6] || '00';
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}:${seconds}`;
}