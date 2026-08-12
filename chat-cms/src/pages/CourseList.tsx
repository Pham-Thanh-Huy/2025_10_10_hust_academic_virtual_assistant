import { ChevronDown, ChevronLeft, ChevronRight, Eye, LoaderCircle, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { courseService, type Course, type CourseListParams } from '../services/courseService';

interface CourseFilters {
  code: string;
  name: string;
  englishName: string;
}

const initialFilters: CourseFilters = {
  code: '',
  name: '',
  englishName: '',
};

const courseLabels: Record<keyof Course, string> = {
  id: 'ID',
  code: 'Mã học phần',
  name: 'Tên học phần',
  englishName: 'Tên tiếng Anh',
  duration: 'Khối lượng',
  credits: 'Số tín chỉ',
  creditFee: 'Hệ số học phí',
  weight: 'Trọng số',
  listCourseCondition: 'Học phần điều kiện',
  instituteManage: 'Đơn vị quản lý',
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<CourseFilters>(initialFilters);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params: CourseListParams = {
        page,
        size: pageSize,
        sort: 'id,desc',
      };

      // Chỉ thêm filter nào thực sự có dữ liệu
      if (appliedFilters.code.trim()) {
        params.code = appliedFilters.code.trim();
      }

      if (appliedFilters.name.trim()) {
        params.name = appliedFilters.name.trim();
      }

      if (appliedFilters.englishName.trim()) {
        params.englishName = appliedFilters.englishName.trim();
      }

      const data = await courseService.getCourses(params);

      setCourses(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setNumberOfElements(data.numberOfElements);
    } catch (err) {
      console.error('Không thể tải danh sách học phần:', err);
      setCourses([]);
      setTotalPages(0);
      setTotalElements(0);
      setNumberOfElements(0);
      setError('Không thể tải danh sách học phần. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize]);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

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

  const handleFilterChange = (field: keyof CourseFilters, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPage(0);
    setAppliedFilters({
      code: filters.code.trim(),
      name: filters.name.trim(),
      englishName: filters.englishName.trim(),
    });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(0);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(0);
  };

  const hasFilter =
      filters.code.trim() !== '' ||
      filters.name.trim() !== '' ||
      filters.englishName.trim() !== '';

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Danh sách học phần</h1>
          <p className="mt-2 text-sm text-gray-500">Quản lý học phần trong hệ thống HUST Assistant</p>
        </div>

        <form onSubmit={handleSearch} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FilterInput
                label="Mã học phần"
                value={filters.code}
                placeholder="Nhập mã học phần..."
                onChange={(value) => handleFilterChange('code', value)}
            />

            <FilterInput
                label="Tên học phần"
                value={filters.name}
                placeholder="Nhập tên học phần..."
                onChange={(value) => handleFilterChange('name', value)}
            />

            <FilterInput
                label="Tên tiếng Anh"
                value={filters.englishName}
                placeholder="Nhập tên tiếng Anh..."
                onChange={(value) => handleFilterChange('englishName', value)}
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {hasFilter && (
                <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Xóa bộ lọc
                </button>
            )}

            <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b5091b] px-6 text-sm font-semibold text-white transition hover:bg-[#960716] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Search size={18} />}
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50/70">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Mã học phần</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Tên học phần</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Tên tiếng Anh</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Tín chỉ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500">Đơn vị quản lý</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500">Thao tác</th>
              </tr>
              </thead>

              <tbody>
              {!loading &&
                  courses.map((course) => (
                      <tr key={course.id} className="border-t border-gray-100 transition hover:bg-red-50/40">
                        <td className="px-6 py-5">
                          <span className="whitespace-nowrap rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{course.code || '—'}</span>
                        </td>

                        <td className="px-6 py-5 font-semibold text-gray-800">{course.name || '—'}</td>
                        <td className="px-6 py-5 text-sm text-gray-600">{course.englishName || '—'}</td>
                        <td className="px-6 py-5 text-gray-700">{course.credits || '—'}</td>
                        <td className="px-6 py-5 text-gray-700">{course.instituteManage || '—'}</td>

                        <td className="px-6 py-5 text-right">
                          <button
                              type="button"
                              onClick={() => setSelectedCourse(course)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <Eye size={16} />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && courses.length > 0 && (
              <div className="space-y-4 p-4 md:hidden">
                {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-gray-100 p-5">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{course.code || '—'}</span>
                          <h3 className="mt-3 font-bold text-gray-900">{course.name || '—'}</h3>
                          <p className="mt-1 text-sm text-gray-500">{course.englishName || 'Chưa có tên tiếng Anh'}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            className="h-fit shrink-0 rounded-xl bg-red-50 p-3 text-red-700"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <InfoCard label="Tín chỉ" value={course.credits || '—'} />
                        <InfoCard label="Đơn vị quản lý" value={course.instituteManage || '—'} />
                      </div>
                    </div>
                ))}
              </div>
          )}

          {loading && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-gray-500">
                <LoaderCircle size={30} className="animate-spin text-red-700" />
                <p className="text-sm">Đang tải danh sách học phần...</p>
              </div>
          )}

          {!loading && error && (
              <div className="flex min-h-72 items-center justify-center px-4 text-center text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && courses.length === 0 && (
              <div className="flex min-h-72 items-center justify-center px-4 text-center text-sm text-gray-500">Không tìm thấy học phần phù hợp.</div>
          )}

          {!loading && !error && totalElements > 0 && (
              <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <span>
                Trang <strong className="font-semibold text-gray-700">{page + 1}/{totalPages}</strong> · Hiển thị{' '}
                <strong className="font-semibold text-gray-700">{numberOfElements}/{totalElements.toLocaleString('vi-VN')}</strong> học phần
              </span>

                  <label className="flex items-center gap-3">
                    <span>Số dòng:</span>

                    <div className="relative">
                      <select
                          value={pageSize}
                          onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                          className="h-11 appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 font-semibold text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>

                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
                      disabled={page === 0}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  >
                    <ChevronLeft size={17} />
                    Trước
                  </button>

                  {visiblePages.map((pageNumber) => (
                      <button
                          type="button"
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold transition ${
                              page === pageNumber
                                  ? 'border-[#b5091b] bg-[#b5091b] text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
                          }`}
                      >
                        {pageNumber + 1}
                      </button>
                  ))}

                  <button
                      type="button"
                      onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages - 1))}
                      disabled={page >= totalPages - 1}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  >
                    Sau
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
          )}
        </div>

        {selectedCourse && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <button
                  type="button"
                  aria-label="Đóng"
                  onClick={() => setSelectedCourse(null)}
                  className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
              />

              <div className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl scrollbar-thin scrollbar-thumb-red-300">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết học phần</h2>
                    <p className="mt-1 text-sm text-gray-500">{selectedCourse.code}</p>
                  </div>

                  <button
                      type="button"
                      onClick={() => setSelectedCourse(null)}
                      className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X size={21} />
                  </button>
                </div>

                <div className="space-y-4 p-6">
                  {(Object.keys(courseLabels) as Array<keyof Course>).map((key) => {
                    const value = selectedCourse[key];

                    return (
                        <InfoItem
                            key={key}
                            label={courseLabels[key]}
                            value={value === null || value === undefined || value === '' ? '—' : String(value)}
                        />
                    );
                  })}
                </div>
              </div>
            </div>
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
        <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>

        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-red-300 focus-within:ring-2 focus-within:ring-red-100">
          <Search size={17} className="shrink-0 text-gray-400" />

          <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />

          {value && (
              <button
                  type="button"
                  onClick={() => onChange('')}
                  className="shrink-0 text-gray-400 transition hover:text-gray-700"
                  aria-label={`Xóa ${label}`}
              >
                <X size={16} />
              </button>
          )}
        </div>
      </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
      <div className="rounded-xl bg-gray-50 p-3">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-1 break-words font-bold text-gray-800">{value}</p>
      </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
      <div className="flex justify-between gap-4 rounded-xl border border-gray-100 p-4">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-800">{value}</span>
      </div>
  );
}