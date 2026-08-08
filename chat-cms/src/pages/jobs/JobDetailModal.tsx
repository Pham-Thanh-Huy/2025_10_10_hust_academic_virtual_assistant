import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Database, FileText, Hash, LoaderCircle, PlayCircle, Rows3, Tag, Terminal, Timer, X, XCircle } from 'lucide-react';
import type { Job } from './JobList';

interface Props {
  job: Job;
  close: () => void;
}

const statusConfig = {
  SUCCESS: {
    label: 'Thành công',
    icon: CheckCircle2,
    badgeClass: 'border-green-200 bg-green-50 text-green-700',
    iconClass: 'text-green-600',
  },
  RUNNING: {
    label: 'Đang chạy',
    icon: LoaderCircle,
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    iconClass: 'animate-spin text-blue-600',
  },
  FAILED: {
    label: 'Thất bại',
    icon: XCircle,
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    iconClass: 'text-red-600',
  },
  WAITING: {
    label: 'Đang chờ',
    icon: Clock3,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    iconClass: 'text-amber-600',
  },
};

export default function JobDetailModal({ job, close }: Props) {
  const currentStatus = statusConfig[job.status];
  const StatusIcon = currentStatus.icon;
  const logContent = typeof job.log === 'string' ? job.log : '';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[3px]" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="job-detail-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[rgb(154,0,31)] ring-4 ring-red-50/50">
              <Database size={22} />
            </div>

            <div className="min-w-0">
              <h2 id="job-detail-title" className="text-xl font-bold tracking-tight text-slate-900">
                Chi tiết Job
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Hash size={13} />
                <span>Job ID: {job.id}</span>
              </div>
            </div>
          </div>

          <button type="button" aria-label="Đóng popup" onClick={close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-[rgb(154,0,31)] active:scale-95">
            <X size={19} />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Trạng thái */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái hiện tại</p>

              <p className="mt-1 truncate text-base font-bold text-slate-800" title={job.name}>
                {job.name}
              </p>
            </div>

            <div className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${currentStatus.badgeClass}`}>
              <StatusIcon size={16} className={currentStatus.iconClass} />

              {currentStatus.label}
            </div>
          </div>

          {/* Thông tin Job */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[rgb(154,0,31)]" />

              <h3 className="font-bold text-slate-900">Thông tin Job</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon={<FileText size={17} />} title="Tên Job" value={job.name} />

              <InfoCard icon={<Tag size={17} />} title="Loại Job" value={job.type} />

              <InfoCard icon={<PlayCircle size={17} />} title="Bắt đầu" value={job.startTime || 'Chưa có'} />

              <InfoCard icon={<CheckCircle2 size={17} />} title="Kết thúc" value={job.endTime || 'Chưa kết thúc'} />

              <InfoCard icon={<Timer size={17} />} title="Thời gian chạy" value={job.duration || 'Đang tính'} />

              <InfoCard icon={<Rows3 size={17} />} title="Số bản ghi" value={`${job.records.toLocaleString('vi-VN')} bản ghi`} />
            </div>
          </section>

          {/* Shell log */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1117] shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700 bg-[#161b22] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Terminal size={14} />
                  <span>execution-log</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Database size={13} />
                <span>Job #{job.id}</span>
              </div>
            </div>

            <div className="h-[300px] overflow-y-auto p-5 font-mono text-sm">
              {logContent.trim().length > 0 ? (
                <pre className="m-0 whitespace-pre-wrap break-words font-mono leading-6 text-slate-300">
                  <span className="select-none text-green-400">$&nbsp;</span>

                  {logContent}

                  {job.status === 'RUNNING' && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-green-400 align-middle" />}
                </pre>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Terminal size={28} className="mx-auto text-slate-600" />

                    <p className="mt-3 font-mono text-sm text-slate-500">$ Chưa có nhật ký thực thi...</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Lỗi */}
          {job.error && (
            <section className="mt-6 rounded-2xl border border-red-200 bg-gradient-to-br from-white to-red-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <AlertTriangle size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-red-800">Lỗi thực thi</h3>

                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-red-700">{job.error}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button type="button" onClick={close} className="rounded-xl bg-[rgb(154,0,31)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/20 transition hover:bg-[rgb(120,0,25)] active:scale-[0.98]">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[rgb(154,0,31)]">{icon}</span>

        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-slate-800" title={value}>
        {value}
      </p>
    </div>
  );
}
