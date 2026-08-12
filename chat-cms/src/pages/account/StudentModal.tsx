import axios from 'axios';
import { LoaderCircle, X } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { userService, type RegisterUserRequest, type UserDetail } from '../../services/userService';

type ModalType = 'create' | 'detail';

interface Props {
  type: ModalType;
  student: UserDetail | null;
  close: () => void;
  onCreated: () => void;
}

interface CreateUserForm {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthOfDate: string;
}

const initialForm: CreateUserForm = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  birthOfDate: '',
};

const userDetailLabels: Record<keyof UserDetail, string> = {
  id: 'ID',
  username: 'Tên đăng nhập',
  firstName: 'Tên',
  lastName: 'Họ và tên đệm',
  age: 'Tuổi',
  birthOfDate: 'Ngày sinh',
  roleName: 'Vai trò',
};

export default function StudentModal({ type, student, close, onCreated }: Props) {
  const [form, setForm] = useState<CreateUserForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const age = useMemo(() => calculateAge(form.birthOfDate), [form.birthOfDate]);

  const updateField = (field: keyof CreateUserForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!form.password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (!form.firstName.trim()) {
      setError('Vui lòng nhập tên.');
      return;
    }

    if (!form.lastName.trim()) {
      setError('Vui lòng nhập họ và tên đệm.');
      return;
    }

    if (!form.birthOfDate) {
      setError('Vui lòng chọn ngày sinh.');
      return;
    }

    if (age < 0) {
      setError('Ngày sinh không hợp lệ.');
      return;
    }

    const request: RegisterUserRequest = {
      username: form.username.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthOfDate: form.birthOfDate,
      age,
    };

    setSubmitting(true);
    setError('');

    try {
      await userService.registerUser(request);
      onCreated();
      close();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không thể thêm sinh viên. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <button type="button" aria-label="Đóng" onClick={close} className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm" />

        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl scrollbar-thin scrollbar-thumb-red-300">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{type === 'create' ? 'Thêm sinh viên' : 'Thông tin sinh viên'}</h2>

              {type === 'detail' && student && <p className="mt-1 text-sm text-gray-500">{student.username}</p>}
            </div>

            <button type="button" onClick={close} className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>

          {type === 'detail' && student && (
              <div className="space-y-3 p-6">
                {(Object.keys(userDetailLabels) as Array<keyof UserDetail>).map((key) => {
                  const value = student[key];

                  return <DetailItem key={key} label={userDetailLabels[key]} value={formatDetailValue(key, value)} />;
                })}
              </div>
          )}

          {type === 'create' && (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                      label="Tên đăng nhập"
                      value={form.username}
                      placeholder="Ví dụ: student@hust.edu.vn"
                      onChange={(value) => updateField('username', value)}
                      required
                  />

                  <Input
                      label="Mật khẩu"
                      type="password"
                      value={form.password}
                      placeholder="Nhập mật khẩu"
                      onChange={(value) => updateField('password', value)}
                      required
                  />

                  <Input
                      label="Họ và tên đệm"
                      value={form.lastName}
                      placeholder="Ví dụ: Phạm Thành"
                      onChange={(value) => updateField('lastName', value)}
                      required
                  />

                  <Input
                      label="Tên"
                      value={form.firstName}
                      placeholder="Ví dụ: Huy"
                      onChange={(value) => updateField('firstName', value)}
                      required
                  />

                  <Input
                      label="Ngày sinh"
                      type="date"
                      value={form.birthOfDate}
                      onChange={(value) => updateField('birthOfDate', value)}
                      required
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Tuổi</label>
                    <input value={form.birthOfDate ? String(age) : ''} readOnly placeholder="Tự động tính theo ngày sinh" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-600 outline-none" />
                  </div>
                </div>

                {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <div className="mt-8 flex justify-end gap-3">
                  <button type="button" onClick={close} disabled={submitting} className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                    Hủy
                  </button>

                  <button type="submit" disabled={submitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b5091b] px-6 text-sm font-semibold text-white transition hover:bg-[#960716] disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting && <LoaderCircle size={18} className="animate-spin" />}
                    Thêm sinh viên
                  </button>
                </div>
              </form>
          )}
        </div>
      </div>
  );
}

function Input({
                 label,
                 type = 'text',
                 value,
                 placeholder,
                 required = false,
                 onChange,
               }: {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>

        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
      </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
      <div className="flex justify-between gap-4 rounded-xl border border-gray-100 p-4">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="max-w-[65%] break-words text-right text-sm font-semibold text-gray-800">{value}</span>
      </div>
  );
}

function formatDetailValue(key: keyof UserDetail, value: UserDetail[keyof UserDetail]) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'roleName' && Array.isArray(value)) return value.join(', ');
  if (key === 'birthOfDate' && typeof value === 'string') return formatDateFromApi(value);

  return String(value);
}

function calculateAge(birthOfDate: string) {
  if (!birthOfDate) return 0;

  const birthDate = new Date(`${birthOfDate}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) return -1;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function formatDateFromApi(value: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) return fallbackMessage;

  const responseData = error.response?.data as
      | {
    message?: {
      message?: string;
    };
  }
      | undefined;

  return responseData?.message?.message || fallbackMessage;
}