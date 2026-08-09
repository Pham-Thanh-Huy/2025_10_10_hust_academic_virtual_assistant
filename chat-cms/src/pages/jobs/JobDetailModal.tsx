import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Hash,
  Layers3,
  LoaderCircle,
  PlayCircle,
  Rows3,
  Tag,
  Terminal,
  Timer,
  X,
  XCircle,
} from 'lucide-react';
import { formatDate, formatDuration, type Job } from '../../services/jobService.ts';

interface Props {
  job: Job;
  close: () => void;
}

const statusConfig = {
  SUCCESS: { label: 'Thành công', icon: CheckCircle2, badgeClass: 'border-green-200 bg-green-50 text-green-700', iconClass: 'text-green-600' },
  RUNNING: { label: 'Đang chạy', icon: LoaderCircle, badgeClass: 'border-blue-200 bg-blue-50 text-blue-700', iconClass: 'animate-spin text-blue-600' },
  FAILED: { label: 'Thất bại', icon: XCircle, badgeClass: 'border-red-200 bg-red-50 text-red-700', iconClass: 'text-red-600' },
  QUEUED: { label: 'Đang chờ', icon: Clock3, badgeClass: 'border-amber-200 bg-amber-50 text-amber-700', iconClass: 'text-amber-600' },
  CANCELLED: { label: 'Đã hủy', icon: Ban, badgeClass: 'border-slate-200 bg-slate-100 text-slate-600', iconClass: 'text-slate-500' },
};

export default function JobDetailModal({ job, close }: Props) {
  const currentStatus = statusConfig[job.status];
  const StatusIcon = currentStatus.icon;
  const logContent = job.logs?.join('\n') || '';

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={close}>
        <div role="dialog" aria-modal="true" aria-labelledby="job-detail-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="min-w-0">
              <h2 id="job-detail-title" className="text-xl font-bold text-slate-900">Chi tiết Job</h2>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Hash size={13} />
                <span className="truncate">Job ID: {job.id}</span>
              </div>
            </div>

            <button type="button" onClick={close} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-[rgb(154,0,31)]">
              <X size={19} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái hiện tại</p>
                <p className="mt-1 truncate text-base font-bold text-slate-800">{job.jobName}</p>
              </div>

              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${currentStatus.badgeClass}`}>
                <StatusIcon size={16} className={currentStatus.iconClass} />
                {currentStatus.label}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon={<FileText size={17} />} title="Tên Job" value={job.jobName} />
              <InfoCard icon={<Tag size={17} />} title="Trigger" value={job.trigger === 'MANUAL' ? 'Thủ công' : 'Tự động'} />
              <InfoCard icon={<Clock3 size={17} />} title="Xếp hàng" value={formatDate(job.queuedAt)} />
              <InfoCard icon={<PlayCircle size={17} />} title="Bắt đầu" value={formatDate(job.startedAt)} />
              <InfoCard icon={<CheckCircle2 size={17} />} title="Kết thúc" value={formatDate(job.finishedAt)} />
              <InfoCard icon={<Timer size={17} />} title="Thời gian chạy" value={formatDuration(job.durationMs, job.status)} />
              <InfoCard icon={<Rows3 size={17} />} title="Đã thu thập" value={`${job.totalRecords.toLocaleString('vi-VN')} bản ghi`} />
              <InfoCard icon={<Database size={17} />} title="Đã lưu" value={`${job.savedRecords.toLocaleString('vi-VN')} bản ghi`} />
              <InfoCard icon={<Layers3 size={17} />} title="Trang hiện tại" value={String(job.currentPage)} />
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117]">
              <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Terminal size={14} />
                  <span>execution-log</span>
                </div>

                <span className="text-xs text-slate-500">Page {job.currentPage}</span>
              </div>

              <div className="h-[300px] overflow-y-auto p-5 font-mono text-sm">
                {logContent ? (
                    <pre className="m-0 whitespace-pre-wrap break-words font-mono leading-6 text-slate-300">
                  {logContent}
                </pre>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      $ Chưa có nhật ký thực thi...
                    </div>
                )}
              </div>
            </section>

            {job.errorMessage && (
                <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-700" />

                    <div>
                      <h3 className="font-bold text-red-800">Lỗi thực thi</h3>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-red-700">{job.errorMessage}</p>
                    </div>
                  </div>
                </section>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button type="button" onClick={close} className="rounded-xl bg-[rgb(154,0,31)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[rgb(120,0,25)]">
              Đóng
            </button>
          </div>
        </div>
      </div>
  );
}

function InfoCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-slate-400">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
        </div>

        <p className="mt-3 truncate text-sm font-semibold text-slate-800" title={value}>{value}</p>
      </div>
  );
}