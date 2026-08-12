import { Bot, CircleUserRound, Hash, LoaderCircle, MessageSquareText, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatDetail } from '../../services/chatHistoryService';
import './markdown.css'

interface ChatDetailModalProps {
    chat: ChatDetail | null;
    loading: boolean;
    close: () => void;
}

export default function ChatDetailModal({ chat, loading, close }: ChatDetailModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
            <button type="button" aria-label="Đóng popup" onClick={close} className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-sm" />

            <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-7 sm:py-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <MessageSquareText size={21} className="shrink-0 text-red-700" />
                            <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">Chi tiết lịch sử chat</h2>
                        </div>

                        {chat && <p className="mt-1 truncate text-xs text-gray-400 sm:text-sm">{chat.title || chat.sessionId}</p>}
                    </div>

                    <button type="button" onClick={close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
                        <X size={21} />
                    </button>
                </div>

                {loading && (
                    <div className="flex min-h-96 flex-col items-center justify-center gap-3 text-gray-500">
                        <LoaderCircle size={32} className="animate-spin text-red-700" />
                        <p className="text-sm">Đang tải nội dung hội thoại...</p>
                    </div>
                )}

                {!loading && chat && (
                    <div className="overflow-y-auto p-4 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <InformationCard icon={<CircleUserRound size={18} />} label="Người dùng" value={chat.username} />
                            <InformationCard icon={<Bot size={18} />} label="Mô hình" value={chat.model || '—'} />
                            <InformationCard icon={<Hash size={18} />} label="Session ID" value={chat.sessionId} />
                            <InformationCard icon={<MessageSquareText size={18} />} label="Trạng thái" value={chat.status === 'ACTIVE' ? 'Hoạt động' : 'Đã xóa'} status={chat.status} />
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="flex justify-end">
                                <div className="max-w-[92%] rounded-2xl rounded-br-md bg-[#b5091b] px-4 py-3 text-sm leading-6 text-white shadow-sm sm:max-w-[78%] sm:px-5">
                                    <p className="mb-1 text-xs font-semibold text-red-100">Câu hỏi của người dùng</p>
                                    <p className="whitespace-pre-wrap break-words">{chat.message || '—'}</p>
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <div className="max-w-full rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-700 shadow-sm sm:max-w-[92%] sm:px-5">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                                            <Bot size={18} />
                                        </div>
                                        Câu trả lời của trợ lý
                                    </div>

                                    <div className="chat-markdown break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.answer || 'Không có câu trả lời.'}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <DetailItem label="ID tin nhắn" value={chat.id} />
                            <DetailItem label="Tiêu đề hội thoại" value={chat.title || '—'} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InformationCard({
                             icon,
                             label,
                             value,
                             status,
                         }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    status?: ChatDetail['status'];
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
            <div className="flex items-center gap-2 text-gray-400">
                {icon}
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>

            {status ? (
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {value}
        </span>
            ) : (
                <p title={value} className="mt-2 truncate text-sm font-semibold text-gray-800">
                    {value}
                </p>
            )}
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-400">{label}</p>
            <p className="mt-1 break-all text-sm font-semibold text-gray-800">{value}</p>
        </div>
    );
}