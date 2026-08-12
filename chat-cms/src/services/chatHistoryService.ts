import axios from 'axios';
import { authService } from '../utils/auth';

const CHAT_LIST_API_URL = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/chat/report-list';
const CHAT_DETAIL_API_URL = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/chat/report-detail';

export type ChatStatus = 'ACTIVE' | 'DELETED';

export interface ChatHistory {
    id: string;
    sessionId: string;
    message: string;
    model: string;
    status: ChatStatus;
    username: string;
    chatAt: string;
}

export interface ChatDetail {
    id: string;
    sessionId: string;
    message: string;
    title: string;
    answer: string;
    model: string;
    status: ChatStatus;
    username: string;
}

export interface ChatHistoryPage {
    content: ChatHistory[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ChatHistoryListParams {
    username?: string;
    model?: string;
    status?: ChatStatus;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string;
}

interface BaseResponse<T> {
    data: T;
    message: {
        message: string;
        status: number;
    };
}

const getAuthorizationHeader = () => {
    const token = authService.getToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};

const getChatHistories = async ({
                                    username,
                                    model,
                                    status,
                                    start,
                                    end,
                                    page = 0,
                                    size = 10,
                                    sort = 'id,desc',
                                }: ChatHistoryListParams): Promise<ChatHistoryPage> => {
    const params: Record<string, string | number> = {
        page,
        size,
        sort,
    };

    // Filter nào có giá trị mới được gửi lên API
    if (username?.trim()) params.username = username.trim();
    if (model?.trim()) params.model = model.trim();
    if (status) params.status = status;
    if (start?.trim()) params.start = start.trim();
    if (end?.trim()) params.end = end.trim();

    const response = await axios.get<BaseResponse<ChatHistoryPage>>(CHAT_LIST_API_URL, {
        params,
        headers: getAuthorizationHeader(),
    });

    return response.data.data;
};

const getChatDetail = async (id: string): Promise<ChatDetail> => {
    const response = await axios.get<BaseResponse<ChatDetail>>(CHAT_DETAIL_API_URL, {
        params: {
            id,
        },
        headers: getAuthorizationHeader(),
    });

    return response.data.data;
};

export const chatHistoryService = {
    getChatHistories,
    getChatDetail,
};