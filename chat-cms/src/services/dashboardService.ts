import { authService } from '../utils/auth';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    'https://hust-trolyao-gateway.io.vn/report-service/api/v1';

export type ChartType = '24-hours' | '7-days' | '12-months';

export interface Summary {
    totalUser: number;
    totalQuestion: number;
    totalCourse: number;
    totalQuestionToday: number;
    totalQuestionThisWeek: number;
    totalQuestionThisMonth: number;
}

export interface ChartItem {
    field: string;
    value: number;
}

export interface RecentQuestion {
    messageId: string;
    sessionId: string;
    sessionTitle: string;
    message: string;
    answer: string;
    model: string;
    username: string;
    firstName: string;
    lastName: string;
    chatAt: string;
}

interface ApiResponse<T> {
    data: T;
    message: {
        message: string;
        status: number;
    };
}

async function request<T>(endpoint: string): Promise<T> {
    const token = authService.getToken();

    if (!token) {
        throw new Error('Không tìm thấy access token');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });

    if (response.status === 401 || response.status === 403) {
        authService.removeToken();
        throw new Error('Phiên đăng nhập đã hết hạn');
    }

    if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu: ${response.status}`);
    }

    const result = (await response.json()) as ApiResponse<T>;
    return result.data;
}

export const dashboardService = {
    getSummary(): Promise<Summary> {
        return request<Summary>('/statistic/summary');
    },

    getChart(type: ChartType): Promise<ChartItem[]> {
        return request<ChartItem[]>(
            `/statistic/chart?type=${encodeURIComponent(type)}`,
        );
    },

    getRecentQuestions(): Promise<RecentQuestion[]> {
        return request<RecentQuestion[]>('/recent-questions');
    },
};