import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../utils/auth';
import { showErrorMessage, showSuccessMessage } from '../utils/toast.util.ts';

interface LoginResponse {
  data: {
    token: string;
  } | null;
  message: {
    message: string;
    status: number;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      showErrorMessage('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
          'https://hust-trolyao-gateway.io.vn/user-service/api/v1/login-cms',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.trim(),
              password,
            }),
          },
      );

      const result: LoginResponse = await response.json();

      if (
          !response.ok ||
          result.message.status !== 200 ||
          !result.data?.token
      ) {
        throw new Error(
            result.message.message || 'Đăng nhập không thành công',
        );
      }

      authService.setToken(result.data.token);
      showSuccessMessage(result.message.message || 'Đăng nhập thành công');

      const destination =
          (location.state as { from?: string } | null)?.from || '/';

      navigate(destination, { replace: true });
    } catch (error) {
      showErrorMessage(
          error instanceof Error
              ? error.message
              : 'Không thể kết nối đến máy chủ',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4 py-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9a001f] text-sm font-bold text-white">
              HUST
            </div>

            <div className="border-l border-slate-300 pl-3">
              <h1 className="text-xl font-bold leading-6 text-slate-900">
                HUST CMS
              </h1>

              <p className="text-xs text-slate-500">
                Quản trị hệ thống hỏi đáp học phần HUST
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white px-7 py-8 shadow-sm sm:px-9">
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Đăng nhập
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Nhập tài khoản quản trị để truy cập hệ thống
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Tài khoản
                </label>

                <div className="relative">
                  <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                      id="username"
                      type="email"
                      autoComplete="username"
                      value={username}
                      disabled={isLoading}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="admin@hust.edu.vn"
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#9a001f] focus:ring-2 focus:ring-[#9a001f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      disabled={isLoading}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#9a001f] focus:ring-2 focus:ring-[#9a001f]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                          setShowPassword((currentValue) => !currentValue)
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                      }
                  >
                    {showPassword ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#9a001f] text-sm font-semibold text-white transition hover:bg-[#780019] focus:outline-none focus:ring-2 focus:ring-[#9a001f]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading && (
                    <LoaderCircle size={18} className="animate-spin" />
                )}

                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <p className="text-center text-xs leading-5 text-slate-400">
                Chỉ tài khoản được cấp quyền quản trị mới có thể truy cập.
              </p>
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Hanoi University of Science and Technology
          </p>
        </div>
      </main>
  );
}