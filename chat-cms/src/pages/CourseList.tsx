import {ChevronDown, Eye, Filter, Search, X} from 'lucide-react';
import { useState } from 'react';

const courses = [
  {
    id: 1,
    code: 'IT3080',
    name: 'Cơ sở dữ liệu',
    credits: 3,
    students: 420,
    status: 'Đang hoạt động',
    department: 'Trường CNTT&TT',
    type: 'Bắt buộc',
    semester: '2025.1',
    teacher: 'Nguyễn Văn A',
    room: 'TC-201',
    schedule: 'Thứ 3 - Tiết 1-3',
    description: 'Học phần cung cấp kiến thức về mô hình dữ liệu, thiết kế cơ sở dữ liệu, SQL và quản trị hệ quản trị cơ sở dữ liệu.',
    createdAt: '06/08/2026',
  },
  {
    id: 2,
    code: 'MI1111',
    name: 'Giải tích I',
    credits: 4,
    students: 850,
    status: 'Đang hoạt động',
    department: 'Viện Toán ứng dụng và Tin học',
    type: 'Bắt buộc',
    semester: '2025.1',
    teacher: 'Trần Văn B',
    room: 'D3-301',
    schedule: 'Thứ 5 - Tiết 4-6',
    description: 'Học phần cung cấp kiến thức nền tảng về giới hạn, đạo hàm, tích phân và ứng dụng trong kỹ thuật.',
    createdAt: '06/08/2026',
  },
  {
    id: 3,
    code: 'IT4060',
    name: 'Trí tuệ nhân tạo',
    credits: 3,
    students: 260,
    status: 'Đang hoạt động',
    department: 'Trường CNTT&TT',
    type: 'Tự chọn',
    semester: '2025.2',
    teacher: 'Lê Văn C',
    room: 'B1-402',
    schedule: 'Thứ 6 - Tiết 7-9',
    description: 'Học phần giới thiệu machine learning, biểu diễn tri thức và các ứng dụng AI.',
    createdAt: '06/08/2026',
  },
];

export default function CourseList() {
  const [keyword, setKeyword] = useState('');

  const [filterType, setFilterType] = useState<'name' | 'code'>('name');

  const [selectedCourse, setSelectedCourse] = useState<(typeof courses)[0] | null>(null);

  const filteredCourses = courses.filter((course) => {
    const value = filterType === 'name' ? course.name : course.code;

    return value.toLowerCase().includes(keyword.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Danh sách học phần</h1>

          <p className="mt-2 text-sm text-gray-500">Quản lý học phần trong hệ thống HUST Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 shadow-sm transition focus-within:border-red-200 focus-within:ring-2 focus-within:ring-red-100">
          <Search size={18} className="text-gray-400" />

          <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={filterType === 'name' ? 'Tìm kiếm theo tên học phần...' : 'Tìm kiếm theo mã học phần...'}
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="relative flex h-12 items-center rounded-xl border border-gray-100 bg-white shadow-sm transition focus-within:border-red-200 focus-within:ring-2 focus-within:ring-red-100">
          <Filter size={17} className="ml-4 text-gray-400" />

          <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'name' | 'code')} className="h-full appearance-none bg-transparent px-3 pr-10 text-sm text-gray-700 outline-none">
            <option value="name">Tên học phần</option>
            <option value="code">Mã học phần</option>
          </select>

          <ChevronDown size={16} className="pointer-events-none absolute right-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Mã học phần</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Tên học phần</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Tín chỉ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Sinh viên</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Trạng thái</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Thao tác</th>
            </tr>
            </thead>

            <tbody>
            {filteredCourses.map((course) => (
                <tr key={course.id} className="border-t border-gray-100 transition hover:bg-red-50/40">
                  <td className="px-6 py-5">
                    <span className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{course.code}</span>
                  </td>

                  <td className="px-6 py-5 font-semibold">{course.name}</td>

                  <td className="px-6 py-5">{course.credits}</td>

                  <td className="px-6 py-5">{course.students}</td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{course.status}</span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button onClick={() => setSelectedCourse(course)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
                      <Eye size={16} />
                      Chi tiết
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 p-4 md:hidden">
          {filteredCourses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between">
                <div>
                  <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{course.code}</span>

                  <h3 className="mt-3 font-bold">{course.name}</h3>
                </div>

                <button onClick={() => setSelectedCourse(course)} className="rounded-xl bg-red-50 p-3 text-red-700">
                  <Eye size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoCard label="Tín chỉ" value={String(course.credits)} />

                <InfoCard label="Sinh viên" value={String(course.students)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setSelectedCourse(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl scrollbar-thin scrollbar-thumb-red-300">
            <div className="sticky top-0 flex justify-between bg-white px-6 py-5">
              <h2 className="font-bold text-xl">Chi tiết học phần</h2>

              <button onClick={() => setSelectedCourse(null)}>
                <X />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {Object.entries(selectedCourse).map(([key, value]) => (
                <InfoItem key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-xl border border-gray-100 p-4">
      <span className="text-sm text-gray-400">{label}</span>

      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}
