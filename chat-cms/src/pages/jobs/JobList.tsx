import type { ElementType } from 'react';
import { Activity, CheckCircle, Clock, Eye, RefreshCcw, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import JobDetailModal from './JobDetailModal';

export interface Job {
  id: number;
  name: string;
  type: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'WAITING';
  startTime: string;
  endTime?: string;
  duration: string;
  records: number;
  log: string;
  error?: string;
}

const jobs: Job[] = [
  {
    id: 1,
    name: 'Thu thập dữ liệu học phần',
    type: 'COURSE_SYNC',
    status: 'SUCCESS',
    startTime: '06/08/2026 02:00',
    endTime: '06/08/2026 02:03',
    duration: '3 phút 20 giây',
    records: 356,
    log: `[02:00:01] Khởi tạo quá trình thu thập dữ liệu
[02:00:03] Kết nối tới website học phần HUST
[02:00:05] Kết nối thành công
[02:00:10] Bắt đầu thu thập danh sách học phần
[02:01:15] Đã thu thập 120 học phần
[02:01:47] Đã thu thập 240 học phần
[02:02:25] Đã thu thập 356 học phần
[02:02:31] Chuẩn hóa dữ liệu học phần
[02:02:50] Lưu dữ liệu vào cơ sở dữ liệu
[02:03:20] Hoàn thành quá trình thu thập dữ liệu`,
  },
  {
    id: 2,
    name: 'Đồng bộ thông tin học phần',
    type: 'COURSE_DETAIL',
    status: 'RUNNING',
    startTime: '06/08/2026 09:00',
    duration: 'Đang chạy',
    records: 120,
    log: `[09:00:01] Khởi tạo quá trình đồng bộ
[09:00:03] Đang tải danh sách học phần
[09:00:08] Bắt đầu lấy thông tin chi tiết
[09:01:12] Đã đồng bộ 50 học phần
[09:02:30] Đã đồng bộ 120 học phần
[09:02:31] Tiếp tục xử lý dữ liệu...`,
  },
  {
    id: 3,
    name: 'Cập nhật syllabus',
    type: 'SYLLABUS_SYNC',
    status: 'FAILED',
    startTime: '05/08/2026 02:00',
    endTime: '05/08/2026 02:01',
    duration: '1 phút',
    records: 0,
    error: 'Không thể kết nối tới syllabus API: Connection timeout',
    log: `[02:00:01] Khởi tạo Job
[02:00:03] Kết nối tới syllabus API
[02:00:20] Đang chờ phản hồi từ máy chủ
[02:00:45] Không nhận được phản hồi
[02:01:00] ERROR: API connection timeout
[02:01:01] Job thực thi thất bại`,
  },
  {
    id: 4,
    name: 'Tạo embedding học phần',
    type: 'COURSE_EMBEDDING',
    status: 'WAITING',
    startTime: 'Chưa bắt đầu',
    duration: 'Chưa bắt đầu',
    records: 0,
    log: '',
  },
];

export default function JobList() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<Job['status'] | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesKeyword = !normalizedKeyword || job.name.toLowerCase().includes(normalizedKeyword) || job.type.toLowerCase().includes(normalizedKeyword);

      const matchesStatus = status === 'ALL' || job.status === status;

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, status]);

  const statistics = useMemo(() => {
    return {
      total: jobs.length,
      success: jobs.filter((job) => job.status === 'SUCCESS').length,
      running: jobs.filter((job) => job.status === 'RUNNING').length,
      failed: jobs.filter((job) => job.status === 'FAILED').length,
    };
  }, []);

  const handleSearch = () => {
    const params: Record<string, string> = {};

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (status !== 'ALL') {
      params.status = status;
    }

    if (fromDate) {
      params.fromDate = fromDate;
    }

    if (toDate) {
      params.toDate = toDate;
    }

    console.log('Search params:', params);
  };

  const handleRefresh = () => {
    setKeyword('');
    setStatus('ALL');
    setFromDate('');
    setToDate('');

    console.log('Refresh jobs');
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thu thập dữ liệu học phần</h1>

          <p className="mt-2 text-sm text-slate-500">Quản lý các Job thu thập và đồng bộ dữ liệu học phần</p>
        </div>

        <button type="button" onClick={handleRefresh} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[rgb(154,0,31)] active:scale-[0.98]">
          <RefreshCcw size={17} />
          Làm mới
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng Job" value={statistics.total} icon={Activity} color="red" />

        <StatCard title="Thành công" value={statistics.success} icon={CheckCircle} color="green" />

        <StatCard title="Đang chạy" value={statistics.running} icon={Clock} color="blue" />

        <StatCard title="Thất bại" value={statistics.failed} icon={XCircle} color="red" />
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">Tìm kiếm</label>

            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={keyword}
                placeholder="Tên Job, loại Job..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[rgb(154,0,31)] focus:ring-4 focus:ring-red-50"
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">Trạng thái</label>

            <select
              value={status}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[rgb(154,0,31)] focus:ring-4 focus:ring-red-50"
              onChange={(event) => {
                setStatus(event.target.value as Job['status'] | 'ALL');
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="RUNNING">Đang chạy</option>
              <option value="FAILED">Thất bại</option>
              <option value="WAITING">Chờ chạy</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">Từ ngày</label>

            <input type="date" value={fromDate} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[rgb(154,0,31)] focus:ring-4 focus:ring-red-50" onChange={(event) => setFromDate(event.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600">Đến ngày</label>

            <input type="date" value={toDate} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[rgb(154,0,31)] focus:ring-4 focus:ring-red-50" onChange={(event) => setToDate(event.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <button type="button" onClick={handleSearch} className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[rgb(154,0,31)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/15 transition hover:bg-[rgb(120,0,25)] active:scale-[0.98]">
            <Search size={17} />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[27%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Job</th>

                <th className="w-[17%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Loại</th>

                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>

                <th className="w-[21%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian</th>

                <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Bản ghi</th>

                <th className="w-[10%] px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-t border-slate-100 transition hover:bg-red-50/30">
                  <td className="px-6 py-5">
                    <p className="truncate font-semibold text-slate-900">{job.name}</p>

                    <p className="mt-1 text-xs text-slate-400">Job #{job.id}</p>
                  </td>

                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-600">{job.type}</span>
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={job.status} />
                  </td>

                  <td className="px-6 py-5 text-sm">
                    <p className="whitespace-nowrap text-slate-700">{job.startTime}</p>

                    <p className="mt-1 whitespace-nowrap text-slate-400">{job.duration}</p>
                  </td>

                  <td className="px-6 py-5 font-semibold text-slate-700">{job.records.toLocaleString('vi-VN')}</td>

                  <td className="px-6 py-5 text-center">
                    <button type="button" title="Xem chi tiết" aria-label={`Xem chi tiết ${job.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[rgb(154,0,31)] transition hover:bg-red-100 active:scale-95" onClick={() => setSelectedJob(job)}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Search size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">Không tìm thấy Job</p>

            <p className="mt-1 text-sm text-slate-400">Hãy thay đổi điều kiện tìm kiếm</p>
          </div>
        )}
      </div>

      {selectedJob && <JobDetailModal job={selectedJob} close={() => setSelectedJob(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const config = {
    SUCCESS: {
      text: 'Thành công',
      icon: CheckCircle,
      className: 'border-green-200 bg-green-50 text-green-700',
    },
    RUNNING: {
      text: 'Đang chạy',
      icon: Activity,
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    FAILED: {
      text: 'Thất bại',
      icon: XCircle,
      className: 'border-red-200 bg-red-50 text-red-700',
    },
    WAITING: {
      text: 'Đang chờ',
      icon: Clock,
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}>
      <Icon size={13} className={status === 'RUNNING' ? 'animate-pulse' : ''} />

      {config.text}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: ElementType; color: 'red' | 'green' | 'blue' }) {
  const colorClasses = {
    red: 'bg-red-50 text-[rgb(154,0,31)]',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
      </div>

      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
        <Icon size={23} />
      </div>
    </div>
  );
}
