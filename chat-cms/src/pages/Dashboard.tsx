import {BarChart3, BookOpen, CalendarDays, MessageSquare, TrendingUp, Users} from "lucide-react";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const overviewCards = [
    {title: "Sinh viên", value: "12,540", icon: Users, change: "+12%"},
    {title: "Tổng câu hỏi", value: "45,231", icon: MessageSquare, change: "+24%"},
    {title: "Học phần", value: "356", icon: BookOpen, change: "+5%"}
];

const questionStats = [
    {title: "Hôm nay", value: "1,245", icon: CalendarDays},
    {title: "Tuần này", value: "8,932", icon: TrendingUp},
    {title: "Tháng này", value: "35,820", icon: MessageSquare}
];

const chartData = [
    { day: "Thứ 2", total: 420 },
    { day: "Thứ 3", total: 680 },
    { day: "Thứ 4", total: 520 },
    { day: "Thứ 5", total: 950 },
    { day: "Thứ 6", total: 780 },
    { day: "Thứ 7", total: 1100 },
    { day: "Chủ nhật", total: 860 }
];

const recentQuestions = [
    {id: 1, user: "Nguyễn Văn An", question: "Điều kiện đăng ký học phần CNTT là gì?", time: "2 phút trước"},
    {id: 2, user: "Trần Minh Huy", question: "Lịch thi môn Giải tích 1 khi nào?", time: "8 phút trước"},
    {id: 3, user: "Lê Hoàng Nam", question: "Có thể học cải thiện điểm không?", time: "15 phút trước"},
    {id: 4, user: "Phạm Thu Hà", question: "Cho em tài liệu Cấu trúc dữ liệu.", time: "28 phút trước"}
];

export default function Dashboard() {
    return (
        <div className="space-y-6 lg:space-y-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        Dashboard
                    </h1>
                </div>


            </div>


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
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">
                                        {card.value}
                                    </h2>

                                    <p className="mt-2 text-xs font-medium text-green-600">
                                        {card.change} so với tháng trước
                                    </p>
                                </div>

                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                    <Icon size={22}/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
                {questionStats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                    <Icon size={21}/>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Câu hỏi {item.title.toLowerCase()}
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold">
                                        {item.value}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold">
                            Lượt sử dụng chatbot
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Thống kê câu hỏi 7 ngày gần nhất
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        <BarChart3 size={18}/>

                        <select className="bg-transparent outline-none cursor-pointer">
                            <option>24 giờ</option>
                            <option selected>7 ngày</option>
                            <option>12 tháng</option>
                        </select>
                    </div>
                </div>


                <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4"/>
                            <XAxis dataKey="day"/>
                            <YAxis/>
                            <Tooltip
                                formatter={(value) => [`${value} lượt`, "Tổng số lượt hỏi đáp"]}
                            />

                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Tổng số lượt hỏi đáp"
                                stroke="#9A001F"
                                strokeWidth={3}
                                dot={{fill: "#9A001F"}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>


            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-lg font-bold">
                            Câu hỏi gần đây
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Các câu hỏi mới nhất từ sinh viên
                        </p>
                    </div>


                </div>


                <div className="overflow-x-auto">

                    <table className="min-w-[650px] w-full">

                        <thead className="bg-gray-50 text-sm text-gray-500">
                        <tr>
                            <th className="px-5 py-4 text-left">
                                Sinh viên
                            </th>

                            <th className="px-5 py-4 text-left">
                                Email
                            </th>

                            <th className="px-5 py-4 text-left">
                                Câu hỏi
                            </th>

                            <th className="px-5 py-4 text-left">
                                Thời gian
                            </th>
                        </tr>
                        </thead>


                        <tbody>

                        {recentQuestions.map((item) => (
                            <tr
                                key={item.id}
                                className="group border-b border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                            >
                                {/* User */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                            {item.user?.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {item.user}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-6 py-5">
            <span
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                huy.pt210154P@sis.hust.edu.vn
            </span>
                                </td>

                                {/* Question */}
                                <td className="px-6 py-5">
                                    <div
                                        className="max-w-md rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm transition group-hover:bg-red-100">
                <span className="line-clamp-2">
                    {item.question}
                </span>
                                    </div>
                                </td>

                                {/* Time */}
                                <td className="px-6 py-5">
            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
                {item.time}
            </span>
                                </td>
                            </tr>
                        ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}