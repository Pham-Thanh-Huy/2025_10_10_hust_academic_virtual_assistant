import axios from 'axios';
import { authService } from '../utils/auth';

const COURSE_API_URL = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/course/list';

export interface Course {
    id: number;
    name: string;
    englishName: string | null;
    code: string;
    duration: string | null;
    credits: string | null;
    creditFee: string | null;
    weight: string | null;
    listCourseCondition: string | null;
    instituteManage: string | null;
    isSync: boolean | null;
}

export interface CoursePage {
    content: Course[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

interface CourseListResponse {
    data: CoursePage;
    message: {
        message: string;
        status: number;
    };
}

export interface CourseListParams {
    code?: string;
    name?: string;
    englishName?: string;
    page?: number;
    size?: number;
    sort?: string;
}

const getCourses = async ({
                              code,
                              name,
                              englishName,
                              page = 0,
                              size = 10,
                              sort = 'id,desc',
                          }: CourseListParams): Promise<CoursePage> => {
    const params: Record<string, string | number> = {
        page,
        size,
        sort,
    };

    // Các filter không bắt buộc, chỉ gửi lên API khi có giá trị
    if (code?.trim()) params.code = code.trim();
    if (name?.trim()) params.name = name.trim();
    if (englishName?.trim()) params.englishName = englishName.trim();

    const token = authService.getToken();

    const response = await axios.get<CourseListResponse>(COURSE_API_URL, {
        params,
        headers: token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : undefined,
    });

    return response.data.data;
};

export const courseService = {
    getCourses,
};