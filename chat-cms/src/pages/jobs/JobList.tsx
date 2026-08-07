import { Activity, CheckCircle, Clock, Eye, RefreshCcw, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import JobDetailModal from './JobDetailModal';

export interface Job {
  id: number;
  name: string;
  type: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'WAITING';
  startTime: string;
  duration: string;
  records: number;
  log: string[];
  error?: string;
}

const jobs: Job[] = [
  {
    id: 1,
    name: 'Thu thập dữ liệu học phần',
    type: 'COURSE_SYNC',
    status: 'SUCCESS',
    startTime: '06/08/2026 02:00',
    duration: '3 phút 20 giây',
    records: 356,
    log: ['Connect HUST source', 'Collect courses', 'Save database', 'Completed'],
  },
  {
    id: 2,
    name: 'Đồng bộ thông tin học phần',
    type: 'COURSE_DETAIL',
    status: 'RUNNING',
    startTime: '06/08/2026 09:00',
    duration: 'Đang chạy',
    records: 120,
    log: ['Processing data', 'Fetching detail'],
  },
  {
    id: 3,
    name: 'Cập nhật syllabus',
    type: 'SYLLABUS_SYNC',
    status: 'FAILED',
    startTime: '05/08/2026 02:00',
    duration: '1 phút',
    records: 0,
    error: 'Connection timeout',
    log: ['Start job', 'API timeout'],
  },
];

export default function JobList() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

    // TODO:
    // Sau này gọi API:
    //
    // jobService.getJobs(params);
  };

  const handleRefresh = () => {
    console.log('Refresh jobs');

    // TODO:
    // Sau này gọi lại API.
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thu thập dữ liệu học phần</h1>

          <p className="mt-2 text-gray-500">Quản lý các task thu thập dữ liệu học phần</p>
        </div>

        <button type="button" onClick={handleRefresh} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng Job" value="125" icon={Activity} />

        <StatCard title="Thành công" value="110" icon={CheckCircle} />

        <StatCard title="Đang chạy" value="5" icon={Clock} />

        <StatCard title="Thất bại" value="10" icon={XCircle} />
      </div>

      {/* SEARCH */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* KEYWORD */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Tìm kiếm</label>

            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Tên job, loại job..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 outline-none transition focus:border-red-700"
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Trạng thái</label>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-red-700">
              <option value="ALL">Tất cả trạng thái</option>

              <option value="SUCCESS">Thành công</option>

              <option value="RUNNING">Đang chạy</option>

              <option value="FAILED">Thất bại</option>

              <option value="WAITING">Chờ chạy</option>
            </select>
          </div>

          {/* FROM DATE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Từ ngày</label>

            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-red-700" />
          </div>

          {/* TO DATE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Đến ngày</label>

            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-red-700" />
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
          <button type="button" onClick={handleSearch} className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-red-700 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-red-800">
            <Search size={18} />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[27%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Job</th>

                <th className="w-[17%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Type</th>

                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Status</th>

                <th className="w-[21%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Thời gian</th>

                <th className="w-[10%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Records</th>

                <th className="w-[10%] px-6 py-4 text-center text-sm font-semibold text-gray-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-gray-100 transition hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-900">{job.name}</p>
                  </td>

                  <td className="px-6 py-5">
                    <span className="whitespace-nowrap text-sm text-gray-500">{job.type}</span>
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={job.status} />
                  </td>

                  <td className="px-6 py-5 text-sm">
                    <p className="whitespace-nowrap text-gray-700">{job.startTime}</p>

                    <p className="mt-1 whitespace-nowrap text-gray-400">{job.duration}</p>
                  </td>

                  <td className="px-6 py-5 font-semibold text-gray-700">{job.records}</td>

                  <td className="px-6 py-5 text-center">
                    <button type="button" onClick={() => setSelectedJob(job)} title="Xem chi tiết" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && <JobDetailModal job={selectedJob} close={() => setSelectedJob(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const config = {
    SUCCESS: {
      text: 'Success',
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700',
    },

    RUNNING: {
      text: 'Running',
      icon: Activity,
      className: 'bg-blue-50 text-blue-700',
    },

    FAILED: {
      text: 'Failed',
      icon: XCircle,
      className: 'bg-red-50 text-red-700',
    },

    WAITING: {
      text: 'Waiting',
      icon: Clock,
      className: 'bg-orange-50 text-orange-700',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
      </div>

      <div className="rounded-xl bg-red-50 p-3 text-red-700">
        <Icon size={24} />
      </div>
    </div>
  );
}
