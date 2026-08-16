import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Eye, LoaderCircle, Plus, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { userService, type ReportUser, type UserDetail, type UserListParams } from '../../services/userService';
import StudentModal from './StudentModal';
interface UserFilters {
  username: string;
  fullName: string;
  start: string;
  end: string;
}
type StudentModalState =
    | {
  type: 'create';
  student: null;
}
    | {
  type: 'detail';
  student: UserDetail;
}
    | null;
const initialFilters: UserFilters = {
  username: '',
  fullName: '',
  start: '',
  end: '',
};
export default function StudentList() {
  const [students, setStudents] = useState<ReportUser[]>([]);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(initialFilters);
  const [modal, setModal] = useState<StudentModalState>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [, setNumberOfElements] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailLoadingUsername, setDetailLoadingUsername] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    const params: UserListParams = {
      page,
      size: pageSize,
      sort: 'id,desc',
    };
    if (appliedFilters.username.trim()) {
      params.username = appliedFilters.username.trim();
    }
    if (appliedFilters.fullName.trim()) {
      params.fullName = appliedFilters.fullName.trim();
    }
    if (appliedFilters.start) {
      params.start = formatDateForApi(appliedFilters.start);
    }
    if (appliedFilters.end) {
      params.end = formatDateForApi(appliedFilters.end);
    }
    userService
        .getUsers(params)
        .then((data) => {
          if (cancelled) return;
          setStudents(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setNumberOfElements(data.numberOfElements);
          setError('');
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          console.error('Không thể tải danh sách sinh viên:', error);
          setStudents([]);
          setTotalPages(0);
          setTotalElements(0);
          setNumberOfElements(0);
          setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page, pageSize, reloadKey]);
  const visiblePages = useMemo(() => {
    if (totalPages <= 0) return [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
    return Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index,
    );
  }, [page, totalPages]);
  const hasFilter =
      filters.username.trim() !== '' ||
      filters.fullName.trim() !== '' ||
      filters.start !== '' ||
      filters.end !== '';
  const updateFilter = (field: keyof UserFilters, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (filters.start && filters.end && filters.start > filters.end) {
      setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }
    setLoading(true);
    setError('');
    setPage(0);
    setAppliedFilters({
      username: filters.username.trim(),
      fullName: filters.fullName.trim(),
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
  const handleViewDetail = async (username: string) => {
    setDetailLoadingUsername(username);
    setError('');
    try {
      const student = await userService.getUserByUsername(username);
      setModal({
        type: 'detail',
        student,
      });
    } catch (error) {
      console.error('Không thể tải chi tiết sinh viên:', error);
      setError('Không thể tải thông tin chi tiết sinh viên.');
    } finally {
      setDetailLoadingUsername(null);
    }
  };
  const handleUserCreated = () => {
    setLoading(true);
    setPage(0);
    setReloadKey((currentKey) => currentKey + 1);
  };
  return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Danh sách sinh viên</h1>
            <p className="mt-2 text-sm text-gray-500">Quản lý tài khoản sinh viên trong hệ thống HUST Assistant</p>
          </div>
          <button type="button" onClick={() => setModal({ type: 'create', student: null })} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#b5091b] px-4 text-xs font-semibold text-white transition hover:bg-[#960716]">
            <Plus size={15} />
            Thêm sinh viên
          </button>
        </div>
        <form onSubmit={handleSearch} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FilterInput
                label="Tên đăng nhập"
                value={filters.username}
                placeholder="Nhập email hoặc username..."
                onChange={(value) => updateFilter('username', value)}
            />
            <FilterInput
                label="Họ và tên"
                value={filters.fullName}
                placeholder="Nhập họ và tên..."
                onChange={(value) => updateFilter('fullName', value)}
            />
            <DateFilterInput
                label="Ngày sinh từ"
                value={filters.start}
                onChange={(value) => updateFilter('start', value)}
            />
            <DateFilterInput
                label="Ngày sinh đến"
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
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-xs">
              <thead>
              <tr className="bg-gray-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Sinh viên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tên đăng nhập</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Ngày sinh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tuổi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Thao tác</th>
              </tr>
              </thead>
              <tbody>
              {!loading &&
                  students.map((student) => {
                    const fullName = getFullName(student);
                    return (
                        <tr key={student.id} className="border-t border-gray-100 transition hover:bg-red-50/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">{getInitials(student)}</div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900">{fullName}</p>
                                <p className="mt-1 text-xs text-gray-400">ID: {student.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">{student.username}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{student.profile?.birthOfDate || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{student.profile?.age ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                                type="button"
                                onClick={() => void handleViewDetail(student.username)}
                                disabled={detailLoadingUsername === student.username}
                                className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {detailLoadingUsername === student.username ? <LoaderCircle size={14} className="animate-spin" /> : <Eye size={14} />}
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!loading && students.length > 0 && (
              <div className="space-y-3 p-4 md:hidden">
                {students.map((student) => (
                    <div key={student.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">{getInitials(student)}</div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-900">{getFullName(student)}</h3>
                            <p className="mt-1 break-all text-xs text-gray-500">{student.username}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => void handleViewDetail(student.username)} disabled={detailLoadingUsername === student.username} className="h-fit shrink-0 rounded-lg bg-red-50 p-2 text-red-700 disabled:opacity-60">
                          {detailLoadingUsername === student.username ? <LoaderCircle size={15} className="animate-spin" /> : <Eye size={15} />}
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <InfoCard label="Ngày sinh" value={student.profile?.birthOfDate || '—'} />
                        <InfoCard label="Tuổi" value={student.profile?.age == null ? '—' : String(student.profile.age)} />
                      </div>
                    </div>
                ))}
              </div>
          )}
          {loading && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-gray-500">
                <LoaderCircle size={30} className="animate-spin text-red-700" />
                <p className="text-sm">Đang tải danh sách sinh viên...</p>
              </div>
          )}
          {!loading && !error && students.length === 0 && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center text-gray-500">
                <UserRound size={32} className="text-gray-300" />
                <p className="text-sm">Không tìm thấy sinh viên phù hợp.</p>
              </div>
          )}
          {!loading && totalElements > 0 && (
              <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span>
                Trang <strong className="font-semibold text-gray-700">{page + 1}/{totalPages}</strong> · Tổng {totalElements.toLocaleString('vi-VN')} sinh viên
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
        {modal && (
            <StudentModal
                type={modal.type}
                student={modal.student}
                close={() => setModal(null)}
                onCreated={handleUserCreated}
            />
        )}
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
function DateFilterInput({
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
          <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-xs text-gray-700 outline-none" />
        </div>
      </label>
  );
}
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
      <div className="rounded-lg bg-gray-50 p-2.5">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-1 break-words text-xs font-bold text-gray-800">{value}</p>
      </div>
  );
}
function getFullName(student: ReportUser) {
  if (!student.profile) return 'Chưa cập nhật';
  return `${student.profile.lastName || ''} ${student.profile.firstName || ''}`.trim() || 'Chưa cập nhật';
}
function getInitials(student: ReportUser) {
  if (!student.profile) return 'SV';
  const lastName = student.profile.lastName?.trim();
  const firstName = student.profile.firstName?.trim();
  return `${lastName?.charAt(0) || ''}${firstName?.charAt(0) || ''}`.toUpperCase() || 'SV';
}
function formatDateForApi(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}