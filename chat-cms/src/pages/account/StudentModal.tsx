import { X } from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  className: string;
  status: 'ACTIVE' | 'LOCKED';
}

type ModalType = 'create' | 'edit' | 'detail' | 'delete';

interface Props {
  type: ModalType;
  student: Student | null;
  close: () => void;
}

export default function StudentModal({ type, student, close }: Props) {
  const [form, setForm] = useState<Student>({
    id: student?.id || 0,
    code: student?.code || '',
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    department: student?.department || '',
    className: student?.className || '',
    status: student?.status || 'ACTIVE',
  });

  const updateField = (key: keyof Student, value: string) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl scrollbar-thin scrollbar-thumb-red-300"
      >
        <div
          className="mb-6 flex items-center justify-between"
        >
          <h2
            className="text-xl font-bold text-gray-900"
          >
            {type === 'create' ? 'Thêm sinh viên' : type === 'edit' ? 'Cập nhật sinh viên' : type === 'delete' ? 'Xóa sinh viên' : 'Thông tin sinh viên'}
          </h2>

          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {type === 'detail' && student && (
          <div className="space-y-3">
            {Object.entries(student).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between rounded-xl bg-gray-50 p-4"
              >
                <span className="text-gray-400">{key}</span>

                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}

        {(type === 'create' || type === 'edit') && (
          <div
            className="grid gap-4 md:grid-cols-2"
          >
            <Input label="MSSV" value={form.code} onChange={(v) => updateField('code', v)} />

            <Input label="Họ tên" value={form.name} onChange={(v) => updateField('name', v)} />

            <Input label="Email" value={form.email} onChange={(v) => updateField('email', v)} />

            <Input label="Số điện thoại" value={form.phone} onChange={(v) => updateField('phone', v)} />

            <Input label="Khoa" value={form.department} onChange={(v) => updateField('department', v)} />

            <Input label="Lớp" value={form.className} onChange={(v) => updateField('className', v)} />

            <div>
              <label
                className="mb-2 block text-sm font-medium"
              >
                Trạng thái
              </label>

              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="ACTIVE">Hoạt động</option>

                <option value="LOCKED">Đã khóa</option>
              </select>
            </div>
          </div>
        )}

        {type === 'delete' && student && (
          <div
            className="rounded-xl bg-red-50 p-5 text-gray-700"
          >
            Bạn có chắc muốn xóa
            <b
              className="mx-1 text-red-700"
            >
              {student.name}
            </b>
            ?
          </div>
        )}

        {type !== 'detail' && (
          <div
            className="mt-8 flex justify-end gap-3"
          >
            <button
              onClick={close}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Hủy
            </button>

            <button
              className="rounded-xl bg-red-700 px-5 py-3 font-semibold text-white"
            >
              {type === 'delete' ? 'Xóa' : 'Lưu'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-red-700"
      />
    </div>
  );
}
