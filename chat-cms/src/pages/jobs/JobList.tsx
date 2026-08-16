import type { ElementType, ReactNode } from 'react';
import { Activity, Ban, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, LoaderCircle, Play, RefreshCcw, Search, Square, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import JobDetailModal from './JobDetailModal';
import { deleteJob, formatDate, formatDuration, getJobDetail, getJobs, getJobSummary, stopJob, triggerCourseCrawler, type Job, type JobFilter, type JobStatus, type JobSummary, type JobTrigger } from '../../services/jobService.ts';
import { showErrorMessage, showSuccessMessage } from '../../utils/toast.util.ts';
type ConfirmAction = {
  type: 'STOP' | 'DELETE';
  job: Job;
};
const EMPTY_SUMMARY: JobSummary = {
  totalJobs: 0,
  totalSuccess: 0,
  totalRunning: 0,
  totalFailed: 0,
  totalQueued: 0,
  totalCancelled: 0,
};
export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobName, setJobName] = useState('');
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [trigger, setTrigger] = useState<JobTrigger | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilter, setAppliedFilter] = useState<JobFilter>({});
  const [summary, setSummary] = useState<JobSummary>(EMPTY_SUMMARY);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [listReloadKey, setListReloadKey] = useState(0);
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTriggerConfirm, setShowTriggerConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  useEffect(() => {
    let cancelled = false;
    getJobs({ ...appliedFilter, page, size: pageSize })
        .then((result) => {
          if (cancelled) return;
          setJobs(result.content);
          setTotalPages(result.totalPages);
          setTotalElements(result.totalElements);
        })
        .catch((error) => {
          if (!cancelled) showErrorMessage(getErrorMessage(error, 'Không thể tải danh sách Job'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, appliedFilter, listReloadKey]);
  useEffect(() => {
    let cancelled = false;
    getJobSummary()
        .then((result) => {
          if (!cancelled) setSummary(result);
        })
        .catch((error) => {
          if (!cancelled) showErrorMessage(getErrorMessage(error, 'Không thể tải thống kê Job'));
        });
    return () => {
      cancelled = true;
    };
  }, [summaryReloadKey]);

  const reloadList = () => {
    setLoading(true);
    setListReloadKey((value) => value + 1);
  };
  const reloadAll = () => {
    setLoading(true);
    setListReloadKey((value) => value + 1);
    setSummaryReloadKey((value) => value + 1);
  };
  const handleSearch = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      showErrorMessage('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      showErrorMessage('Ngày bắt đầu không được lớn hơn ngày kết thúc');
      return;
    }
    setAppliedFilter({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      jobName: jobName.trim() || undefined,
      status: status || undefined,
      trigger: trigger || undefined,
    });
    setPage(0);
    reloadList();
  };
  const handleRefresh = () => {
    setJobName('');
    setStatus('');
    setTrigger('');
    setStartDate('');
    setEndDate('');
    setAppliedFilter({});
    setPage(0);
    reloadAll();
  };
  const handleChangePage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || newPage === page) return;
    setLoading(true);
    setPage(newPage);
  };
  const handlePageSizeChange = (newPageSize: number) => {
    setLoading(true);
    setPageSize(newPageSize);
    setPage(0);
  };
  const handleTrigger = async () => {
    try {
      setTriggering(true);
      await triggerCourseCrawler();
      showSuccessMessage('Đã đưa Job crawler vào hàng đợi');
      setShowTriggerConfirm(false);
      setPage(0);
      reloadAll();
    } catch (error) {
      showErrorMessage(getErrorMessage(error, 'Không thể chạy Job crawler'));
    } finally {
      setTriggering(false);
    }
  };
  const handleJobAction = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(true);
      if (confirmAction.type === 'STOP') {
        await stopJob(confirmAction.job.id);
        showSuccessMessage('Đã dừng Job thành công');
      } else {
        await deleteJob(confirmAction.job.id);
        showSuccessMessage('Đã xóa Job thành công');
      }
      setConfirmAction(null);
      if (confirmAction.type === 'DELETE' && jobs.length === 1 && page > 0) {
        setLoading(true);
        setPage((value) => value - 1);
        setSummaryReloadKey((value) => value + 1);
      } else {
        reloadAll();
      }
    } catch (error) {
      showErrorMessage(getErrorMessage(
          error,
          confirmAction.type === 'STOP' ? 'Không thể dừng Job' : 'Không thể xóa Job',
      ));
    } finally {
      setActionLoading(false);
    }
  };
  const handleViewDetail = async (id: string) => {
    try {
      setDetailLoadingId(id);
      const detail = await getJobDetail(id);
      setSelectedJob(detail);
    } catch (error) {
      showErrorMessage(getErrorMessage(error, 'Không thể lấy chi tiết Job'));
    } finally {
      setDetailLoadingId(null);
    }
  };
  return (
      <div className="min-h-screen space-y-5 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thu thập dữ liệu học phần</h1>
            <p className="mt-2 text-sm text-slate-500">Quản lý các Job thu thập và đồng bộ dữ liệu học phần</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowTriggerConfirm(true)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[rgb(154,0,31)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[rgb(120,0,25)] active:scale-[0.98]">
              <Play size={15} />
              Chạy Job
            </button>
            <button type="button" disabled={loading} onClick={handleRefresh} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[rgb(154,0,31)] disabled:cursor-not-allowed disabled:opacity-60">
              <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Tổng Job" value={summary.totalJobs} icon={Activity} color="red" />
          <StatCard title="Thành công" value={summary.totalSuccess} icon={CheckCircle} color="green" />
          <StatCard title="Đang chạy" value={summary.totalRunning} icon={Clock} color="blue" />
          <StatCard title="Đang chờ" value={summary.totalQueued} icon={Clock} color="amber" />
          <StatCard title="Thất bại" value={summary.totalFailed} icon={XCircle} color="red" />
          <StatCard title="Đã hủy" value={summary.totalCancelled} icon={Ban} color="slate" />
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Tên Job">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={jobName} placeholder="Tìm kiếm học phần" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-[rgb(154,0,31)] focus:ring-2 focus:ring-red-50" onChange={(event) => setJobName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSearch()} />
              </div>
            </FilterField>
            <FilterField label="Trạng thái">
              <select value={status} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[rgb(154,0,31)] focus:ring-2 focus:ring-red-50" onChange={(event) => setStatus(event.target.value as JobStatus | '')}>
                <option value="">Tất cả trạng thái</option>
                <option value="QUEUED">Đang chờ</option>
                <option value="RUNNING">Đang chạy</option>
                <option value="SUCCESS">Thành công</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </FilterField>
            <FilterField label="Loại trigger">
              <select value={trigger} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[rgb(154,0,31)] focus:ring-2 focus:ring-red-50" onChange={(event) => setTrigger(event.target.value as JobTrigger | '')}>
                <option value="">Tất cả trigger</option>
                <option value="MANUAL">Thủ công</option>
                <option value="SCHEDULED">Tự động</option>
              </select>
            </FilterField>
            <FilterField label="Từ ngày">
              <input type="date" value={startDate} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[rgb(154,0,31)] focus:ring-2 focus:ring-red-50" onChange={(event) => setStartDate(event.target.value)} />
            </FilterField>
            <FilterField label="Đến ngày">
              <input type="date" value={endDate} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[rgb(154,0,31)] focus:ring-2 focus:ring-red-50" onChange={(event) => setEndDate(event.target.value)} />
            </FilterField>
          </div>
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <button type="button" disabled={loading} onClick={handleSearch} className="inline-flex h-9 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-[rgb(154,0,31)] px-4 text-xs font-semibold text-white transition hover:bg-[rgb(120,0,25)] disabled:opacity-60">
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />}
              Tìm kiếm
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] table-fixed text-xs">
              <thead className="bg-slate-50">
              <tr>
                <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-slate-500">Job</th>
                <th className="w-[13%] px-4 py-3 text-left text-xs font-semibold text-slate-500">Trigger</th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-slate-500">Trạng thái</th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-slate-500">Thời gian</th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold text-slate-500">Bản ghi</th>
                <th className="w-[17%] px-4 py-3 text-center text-xs font-semibold text-slate-500">Thao tác</th>
              </tr>
              </thead>
              <tbody>
              {jobs.map((job) => {
                const canStop = job.status === 'QUEUED' || job.status === 'RUNNING';
                return (
                    <tr key={job.id} className="border-t border-slate-100 transition hover:bg-red-50/30">
                      <td className="px-4 py-3">
                        <p className="truncate text-xs font-semibold text-slate-900">{job.jobName}</p>
                        <p className="mt-1 truncate text-xs text-slate-400" title={job.id}>#{job.id}</p>
                      </td>
                      <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {job.trigger === 'MANUAL' ? 'Thủ công' : 'Tự động'}
                      </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="whitespace-nowrap text-slate-700">{formatDate(job.startedAt || job.queuedAt)}</p>
                        <p className="mt-1 whitespace-nowrap text-slate-400">{formatDuration(job.durationMs, job.status)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {job.totalRecords.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton title="Xem chi tiết" disabled={detailLoadingId === job.id} onClick={() => void handleViewDetail(job.id)} className="bg-red-50 text-[rgb(154,0,31)] hover:bg-red-100">
                            {detailLoadingId === job.id ? <LoaderCircle size={14} className="animate-spin" /> : <Eye size={14} />}
                          </ActionButton>
                          {canStop && (
                              <ActionButton title="Dừng Job" onClick={() => setConfirmAction({ type: 'STOP', job })} className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                                <Square size={14} />
                              </ActionButton>
                          )}
                          <ActionButton title="Xóa Job" onClick={() => setConfirmAction({ type: 'DELETE', job })} className="bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700">
                            <Trash2 size={14} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
          {!loading && jobs.length === 0 && (
              <div className="px-6 py-14 text-center">
                <Search size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">Không tìm thấy Job</p>
                <p className="mt-1 text-sm text-slate-400">Hãy thay đổi điều kiện tìm kiếm</p>
              </div>
          )}
          <Pagination
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalElements={totalElements}
              currentElements={jobs.length}
              loading={loading}
              changePage={handleChangePage}
              changePageSize={handlePageSizeChange}
          />
        </div>
        {selectedJob && <JobDetailModal job={selectedJob} close={() => setSelectedJob(null)} />}
        {showTriggerConfirm && (
            <ConfirmModal
                type="TRIGGER"
                loading={triggering}
                close={() => setShowTriggerConfirm(false)}
                confirm={() => void handleTrigger()}
            />
        )}
        {confirmAction && (
            <ConfirmModal
                type={confirmAction.type}
                loading={actionLoading}
                job={confirmAction.job}
                close={() => setConfirmAction(null)}
                confirm={() => void handleJobAction()}
            />
        )}
      </div>
  );
}
function ConfirmModal({ type, loading, job, close, confirm }: {
  type: 'TRIGGER' | 'STOP' | 'DELETE';
  loading: boolean;
  job?: Job;
  close: () => void;
  confirm: () => void;
}) {
  const content = {
    TRIGGER: {
      title: 'Xác nhận chạy Job',
      message: 'Bạn có chắc chắn muốn chạy Job thu thập dữ liệu học phần không?',
      button: 'Chạy Job',
      icon: Play,
      iconClass: 'bg-green-100 text-green-700',
      buttonClass: 'bg-[rgb(154,0,31)] hover:bg-[rgb(120,0,25)]',
    },
    STOP: {
      title: 'Xác nhận dừng Job',
      message: `Bạn có chắc chắn muốn dừng Job ${job?.jobName ?? ''} không?`,
      button: 'Dừng Job',
      icon: Square,
      iconClass: 'bg-amber-100 text-amber-700',
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
    },
    DELETE: {
      title: 'Xác nhận xóa Job',
      message: `Bạn có chắc chắn muốn xóa Job ${job?.jobName ?? ''}? Dữ liệu đã xóa không thể khôi phục.`,
      button: 'Xóa Job',
      icon: Trash2,
      iconClass: 'bg-red-100 text-red-700',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
  }[type];
  const Icon = content.icon;
  return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={loading ? undefined : close}>
        <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.3)]" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${content.iconClass}`}>
              <Icon size={19} />
            </div>
            <button type="button" disabled={loading} onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50">
              <X size={16} />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{content.title}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">{content.message}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" disabled={loading} onClick={close} className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Không
            </button>
            <button type="button" disabled={loading} onClick={confirm} className={`inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white disabled:opacity-60 ${content.buttonClass}`}>
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Icon size={14} />}
              {loading ? 'Đang xử lý...' : content.button}
            </button>
          </div>
        </div>
      </div>
  );
}
function Pagination({ page, pageSize, totalPages, totalElements, loading, changePage, changePageSize }: {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  currentElements: number;
  loading: boolean;
  changePage: (page: number) => void;
  changePageSize: (size: number) => void;
}) {
  const visiblePages = getVisiblePages(page, totalPages);
  return (
      <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] text-slate-500">
            Trang {totalPages === 0 ? 0 : page + 1}/{totalPages} · Tổng {totalElements.toLocaleString('vi-VN')} Job
          </p>
          <div className="flex items-center gap-1.5">
            <label htmlFor="job-page-size" className="text-[11px] text-slate-500">Số dòng:</label>
            <select id="job-page-size" value={pageSize} disabled={loading} onChange={(event) => changePageSize(Number(event.target.value))} className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 outline-none focus:border-[rgb(154,0,31)] disabled:opacity-50">
              {[5, 10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>
        {totalPages > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <PageButton disabled={page === 0 || loading} onClick={() => changePage(page - 1)}>
                <ChevronLeft size={13} />
                Trước
              </PageButton>
              {visiblePages.map((pageNumber) => (
                  <button type="button" key={pageNumber} disabled={loading} onClick={() => changePage(pageNumber)} className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-semibold ${page === pageNumber ? 'border-[rgb(154,0,31)] bg-[rgb(154,0,31)] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50'}`}>
                    {pageNumber + 1}
                  </button>
              ))}
              <PageButton disabled={page + 1 >= totalPages || loading} onClick={() => changePage(page + 1)}>
                Sau
                <ChevronRight size={13} />
              </PageButton>
            </div>
        )}
      </div>
  );
}
function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
      <button type="button" disabled={disabled} onClick={onClick} className="inline-flex h-7 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
        {children}
      </button>
  );
}
function ActionButton({ title, disabled, onClick, className, children }: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
      <button type="button" title={title} disabled={disabled} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-50 ${className}`}>
        {children}
      </button>
  );
}
function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
        {children}
      </div>
  );
}
function StatusBadge({ status }: { status: JobStatus }) {
  const config = {
    QUEUED: { text: 'Đang chờ', icon: Clock, className: 'border-amber-200 bg-amber-50 text-amber-700' },
    RUNNING: { text: 'Đang chạy', icon: Activity, className: 'border-blue-200 bg-blue-50 text-blue-700' },
    SUCCESS: { text: 'Thành công', icon: CheckCircle, className: 'border-green-200 bg-green-50 text-green-700' },
    FAILED: { text: 'Thất bại', icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700' },
    CANCELLED: { text: 'Đã hủy', icon: Ban, className: 'border-slate-200 bg-slate-100 text-slate-600' },
  }[status];
  const Icon = config.icon;
  return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      <Icon size={12} className={status === 'RUNNING' ? 'animate-pulse' : ''} />
        {config.text}
    </span>
  );
}
function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: ElementType;
  color: 'red' | 'green' | 'blue' | 'amber' | 'slate';
}) {
  const colors = {
    red: 'bg-red-50 text-[rgb(154,0,31)]',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h2 className="mt-1.5 text-2xl font-bold text-slate-900">{value}</h2>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon size={19} />
        </div>
      </div>
  );
}
function getVisiblePages(currentPage: number, totalPages: number) {
  let startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 5);
  startPage = Math.max(0, endPage - 5);
  return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
}
function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}