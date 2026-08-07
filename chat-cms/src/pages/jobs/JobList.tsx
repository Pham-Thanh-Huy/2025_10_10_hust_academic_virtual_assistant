import { Activity, CheckCircle, Clock, Eye, RefreshCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import JobDetailModal from './JobDetailModal';

interface Job {
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
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleSearch = () => {
    // TODO:
    // Sau này gọi API JobRunr
    // GET /jobs?status=&fromDate=&toDate=

    console.log({
      status,
      fromDate,
      toDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thu thập dữ liệu học phần</h1>

          <p className="mt-2 text-gray-500">Quản lý các task thu thập dữ liệu học phần</p>
        </div>

        <button className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-gray-50">
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Tổng Job" value="125" icon={Activity} />
        <StatCard title="Thành công" value="110" icon={CheckCircle} />
        <StatCard title="Đang chạy" value="5" icon={Clock} />
        <StatCard title="Thất bại" value="10" icon={XCircle} />
      </div>

      <div className="rounded-3xl border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Trạng thái</label>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-red-700">
              <option value="ALL">Tất cả</option>

              <option value="SUCCESS">Thành công</option>

              <option value="RUNNING">Đang chạy</option>

              <option value="FAILED">Thất bại</option>

              <option value="WAITING">Chờ chạy</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Từ ngày</label>

            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-red-700" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Đến ngày</label>

            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-red-700" />
          </div>

          <div className="flex items-end">
            <button onClick={handleSearch} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800">
              <RefreshCcw size={18} />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-500">Job</th>

                <th className="px-6 py-4 text-left text-sm text-gray-500">Type</th>

                <th className="px-6 py-4 text-left text-sm text-gray-500">Status</th>

                <th className="px-6 py-4 text-left text-sm text-gray-500">Thời gian</th>

                <th className="px-6 py-4 text-left text-sm text-gray-500">Records</th>

                <th className="px-6 py-4 text-right text-sm text-gray-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t transition hover:bg-gray-50">
                  <td className="px-6 py-5 font-semibold text-gray-900">{job.name}</td>

                  <td className="px-6 py-5 text-gray-500">{job.type}</td>

                  <td className="px-6 py-5">
                    <StatusBadge status={job.status} />
                  </td>

                  <td className="px-6 py-5 text-sm">
                    <p>{job.startTime}</p>

                    <p className="text-gray-400">{job.duration}</p>
                  </td>

                  <td className="px-6 py-5 font-semibold">{job.records}</td>

                  <td className="px-6 py-5 text-right">
                    <button onClick={() => setSelectedJob(job)} className="rounded-xl bg-blue-50 p-2 text-blue-700 hover:bg-blue-100">
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
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>

          <h2 className="mt-2 text-3xl font-bold">{value}</h2>
        </div>

        <div className="rounded-xl bg-red-50 p-3 text-red-700">
          <Icon />
        </div>
      </div>
    </div>
  );
}
