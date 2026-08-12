import axios from 'axios';
import { authService } from '../utils/auth';

const REPORT_USER_API_URL = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/user/report-list';
const USER_DETAIL_API_URL = 'https://hust-trolyao-gateway.io.vn/user-service/api/v1/get-user-by-username';
const REGISTER_USER_API_URL = 'https://hust-trolyao-gateway.io.vn/user-service/api/v1/register';

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    birthOfDate: string;
}

export interface ReportUser {
    id: number;
    username: string;
    profile: UserProfile | null;
}

export interface UserDetail {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    birthOfDate: string;
    roleName: string[];
}

export interface UserPage {
    content: ReportUser[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface UserListParams {
    username?: string;
    fullName?: string;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface RegisterUserRequest {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    birthOfDate: string;
    age: number;
}

export interface RegisterUserResponse {
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    birthOfDate: string;
    roleName: string[];
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

const getUsers = async ({
                            username,
                            fullName,
                            start,
                            end,
                            page = 0,
                            size = 10,
                            sort = 'id,desc',
                        }: UserListParams): Promise<UserPage> => {
    const params: Record<string, string | number> = {
        page,
        size,
        sort,
    };

    if (username?.trim()) params.username = username.trim();
    if (fullName?.trim()) params.fullName = fullName.trim();
    if (start?.trim()) params.start = start.trim();
    if (end?.trim()) params.end = end.trim();

    const response = await axios.get<BaseResponse<UserPage>>(REPORT_USER_API_URL, {
        params,
        headers: getAuthorizationHeader(),
    });

    return response.data.data;
};

const getUserByUsername = async (username: string): Promise<UserDetail> => {
    const response = await axios.get<BaseResponse<UserDetail>>(USER_DETAIL_API_URL, {
        params: {
            username,
        },
        headers: getAuthorizationHeader(),
    });

    return response.data.data;
};

const registerUser = async (request: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const response = await axios.post<BaseResponse<RegisterUserResponse>>(REGISTER_USER_API_URL, request, {
        headers: {
            ...getAuthorizationHeader(),
            'Content-Type': 'application/json',
        },
    });

    return response.data.data;
};

export const userService = {
    getUsers,
    getUserByUsername,
    registerUser,
};