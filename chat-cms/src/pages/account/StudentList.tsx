import {ChevronDown, Edit, Eye, Plus, Search, Trash2} from 'lucide-react';
import { useState } from 'react';
import StudentModal from './StudentModal.tsx';

export interface Student {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  className: string;
  status: 'ACTIVE' | 'LOCKED';
}

const studentsData: Student[] = [
  {
    id: 1,
    code: '20210001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@hust.edu.vn',
    phone: '0988888888',
    department: 'Công nghệ thông tin',
    className: 'IT1-K66',
    status: 'ACTIVE',
  },
  {
    id: 2,
    code: '20210002',
    name: 'Trần Minh Đức',
    email: 'duc.tran@hust.edu.vn',
    phone: '0977777777',
    department: 'Điện tử viễn thông',
    className: 'DT2-K66',
    status: 'LOCKED',
  },
  {
    id: 3,
    code: '20210003',
    name: 'Phạm Minh Tuấn',
    email: 'tuan.pham@hust.edu.vn',
    phone: '0966666666',
    department: 'Cơ khí',
    className: 'CK1-K66',
    status: 'ACTIVE',
  },
];

type ModalType = 'create' | 'edit' | 'detail' | 'delete' | null;

export default function StudentList() {
  const [students] = useState<Student[]>(studentsData);

  const [keyword, setKeyword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [status, setStatus] = useState('ALL');

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleSearch = () => {
    const params: Record<string, string> = {};

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (studentCode.trim()) {
      params.studentCode = studentCode.trim();
    }

    if (studentName.trim()) {
      params.studentName = studentName.trim();
    }

    if (status !== 'ALL') {
      params.status = status;
    }

    console.log('Student search params:', params);

    // TODO:
    // Sau này gọi API tại đây.
    //
    // Ví dụ:
    //
    // const response =
    //   await studentService.getStudents(params);
    //
    // GET /students
    //   ?keyword=
    //   &studentCode=
    //   &studentName=
    //   &status=
    //
    // Field nào không có value thì không gửi.
  };

  const openModal = (type: ModalType, student?: Student) => {
    setModal(type);
    setSelectedStudent(student ?? null);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sinh viên</h1>

          <p className="mt-2 text-gray-500">Quản lý tài khoản sinh viên trong hệ thống HUST Assistant</p>
        </div>

        <button type="button" onClick={() => openModal('create')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800">
          <Plus size={20} />
          Thêm sinh viên
        </button>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* FILTERS */}
        <div className="grid grid-cols-4 gap-5">
          {/* KEYWORD */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Tìm kiếm tổng</label>

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
                  placeholder="MSSV, tên, email..."
                  className="h-12 w-full rounded-xl border border-gray-100 bg-white pl-11 pr-4 text-sm text-gray-700 shadow-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          {/* STUDENT CODE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">MSSV</label>

            <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Tìm theo MSSV"
                className="h-12 w-full rounded-xl border border-gray-100 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* STUDENT NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Tên sinh viên</label>

            <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Tìm theo tên sinh viên"
                className="h-12 w-full rounded-xl border border-gray-100 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">Trạng thái</label>

            <div className="relative">
              <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 pr-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="LOCKED">Đã khóa</option>
              </select>

              <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
          <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-red-700 px-7 font-semibold text-white shadow-sm transition hover:bg-red-800"
          >
            <Search size={18} />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr>
              <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-500">MSSV</th>
              <th className="w-[27%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Sinh viên</th>
              <th className="w-[25%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Khoa</th>
              <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-500">Trạng thái</th>
              <th className="w-[18%] px-6 py-4 text-center text-sm font-semibold text-gray-500">Thao tác</th>
            </tr>
            </thead>

            <tbody>
            {students.map((student) => (
                <tr key={student.id} className="border-t border-gray-100 transition hover:bg-gray-50">
                  {/* MSSV */}
                  <td className="px-6 py-5 font-semibold text-gray-900">{student.code}</td>

                  {/* STUDENT */}
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="mt-1 truncate text-sm text-gray-400">{student.email}</p>
                  </td>

                  {/* DEPARTMENT */}
                  <td className="px-6 py-5 text-gray-600">{student.department}</td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <StatusBadge status={student.status} />
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button type="button" onClick={() => openModal('detail', student)} title="Xem chi tiết" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100">
                        <Eye size={18} />
                      </button>

                      <button type="button" onClick={() => openModal('edit', student)} title="Chỉnh sửa" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100">
                        <Edit size={18} />
                      </button>

                      <button type="button" onClick={() => openModal('delete', student)} title="Xóa sinh viên" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modal && <StudentModal type={modal} student={selectedStudent} close={closeModal} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Student['status'] }) {
  const isActive = status === 'ACTIVE';

  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{isActive ? 'Hoạt động' : 'Đã khóa'}</span>;
}
