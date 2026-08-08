import {
  BarChart3,
  BookOpen,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  type ChartItem,
  type ChartType,
  dashboardService,
  type RecentQuestion,
  type Summary,
} from '../services/dashboardService';

const initialSummary: Summary = {
  totalUser: 0,
  totalQuestion: 0,
  totalCourse: 0,
  totalQuestionToday: 0,
  totalQuestionThisWeek: 0,
  totalQuestionThisMonth: 0,
};

const chartDescriptions: Record<ChartType, string> = {
  '24-hours': 'Thống kê câu hỏi trong 24 giờ qua',
  '7-days': 'Thống kê câu hỏi từ thứ Hai đến Chủ nhật',
  '12-months': 'Thống kê câu hỏi trong 12 tháng của năm',
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function getFullName(item: RecentQuestion): string {
  const fullName = [item.lastName, item.firstName]
      .filter(Boolean)
      .join(' ')
      .trim();

  return fullName || 'Không xác định';
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [chartType, setChartType] = useState<ChartType>('7-days');
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setError('');

        const [summaryResponse, recentQuestionsResponse] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getRecentQuestions(),
        ]);

        setSummary(summaryResponse);
        setRecentQuestions(recentQuestionsResponse);
      } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'Không thể tải dữ liệu dashboard',
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setChartLoading(true);
        setError('');

        const response = await dashboardService.getChart(chartType);
        setChartData(response);
      } catch (err) {
        setError(
            err instanceof Error ? err.message : 'Không thể tải dữ liệu biểu đồ',
        );
      } finally {
        setChartLoading(false);
      }
    };

    void loadChartData();
  }, [chartType]);

  const overviewCards = [
    {
      title: 'Sinh viên',
      value: summary.totalUser,
      icon: Users,
    },
    {
      title: 'Tổng câu hỏi',
      value: summary.totalQuestion,
      icon: MessageSquare,
    },
    {
      title: 'Học phần',
      value: summary.totalCourse,
      icon: BookOpen,
    },
  ];

  const questionStats = [
    {
      title: 'Hôm nay',
      value: summary.totalQuestionToday,
      icon: CalendarDays,
    },
    {
      title: 'Tuần này',
      value: summary.totalQuestionThisWeek,
      icon: TrendingUp,
    },
    {
      title: 'Tháng này',
      value: summary.totalQuestionThisMonth,
      icon: MessageSquare,
    },
  ];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng quan hoạt động của hệ thống trợ lý ảo
          </p>
        </div>

        {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
        )}

        {/* Tổng quan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
                <div
                    key={card.title}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-lg md:p-6"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{card.title}</p>

                      <h2 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">
                        {dashboardLoading ? '...' : formatNumber(card.value)}
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Thống kê câu hỏi */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {questionStats.map((item) => {
            const Icon = item.icon;

            return (
                <div
                    key={item.title}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Câu hỏi {item.title.toLowerCase()}
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-gray-900">
                        {dashboardLoading ? '...' : formatNumber(item.value)}
                      </h3>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Biểu đồ */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Lượt sử dụng chatbot</h2>

              <p className="mt-1 text-sm text-gray-400">
                {chartDescriptions[chartType]}
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <BarChart3 size={18} />

              <select
                  value={chartType}
                  onChange={(event) =>
                      setChartType(event.target.value as ChartType)
                  }
                  className="cursor-pointer bg-transparent outline-none"
              >
                <option value="24-hours">24 giờ</option>
                <option value="7-days">7 ngày</option>
                <option value="12-months">12 tháng</option>
              </select>
            </div>
          </div>

          <div className="h-64 md:h-80">
            {chartLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Đang tải biểu đồ...
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Chưa có dữ liệu thống kê
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        bottom: 5,
                        left: 0,
                      }}
                  >
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />

                    <XAxis
                        dataKey="field"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip
                        formatter={(value: number | string | undefined) => [
                          `${formatNumber(Number(value ?? 0))} lượt`,
                          'Tổng số lượt hỏi đáp',
                        ]}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                    />

                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Tổng số lượt hỏi đáp"
                        stroke="#9A001F"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        dot={{
                          r: 4,
                          fill: '#9A001F',
                          stroke: '#ffffff',
                          strokeWidth: 2,
                        }}
                    />
                  </LineChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Câu hỏi gần đây */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Câu hỏi gần đây</h2>

            <p className="mt-1 text-sm text-gray-400">
              Các câu hỏi mới nhất từ sinh viên
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="px-5 py-4 text-left">Sinh viên</th>
                <th className="px-5 py-4 text-left">Email</th>
                <th className="px-5 py-4 text-left">Câu hỏi</th>
                <th className="px-5 py-4 text-left">Thời gian</th>
              </tr>
              </thead>

              <tbody>
              {dashboardLoading && (
                  <tr>
                    <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      Đang tải câu hỏi gần đây...
                    </td>
                  </tr>
              )}

              {!dashboardLoading &&
                  recentQuestions.map((item) => {
                    const fullName = getFullName(item);

                    return (
                        <tr
                            key={item.messageId}
                            className="group border-b border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                        >
                          {/* Sinh viên */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                {fullName.charAt(0).toUpperCase()}
                              </div>

                              <p className="font-semibold text-gray-800">
                                {fullName}
                              </p>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          {item.username}
                        </span>
                          </td>

                          {/* Câu hỏi */}
                          <td className="px-6 py-5">
                            <div
                                title={item.message}
                                className="max-w-md rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm transition group-hover:bg-red-100"
                            >
                          <span className="line-clamp-2">
                            {item.message || 'Không có nội dung'}
                          </span>
                            </div>
                          </td>

                          {/* Thời gian */}
                          <td className="px-6 py-5">
                        <span className="whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                          {item.chatAt}
                        </span>
                          </td>
                        </tr>
                    );
                  })}

              {!dashboardLoading && recentQuestions.length === 0 && (
                  <tr>
                    <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      Chưa có câu hỏi gần đây
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}