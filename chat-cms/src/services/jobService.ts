const REPORT_API = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/jobs';
const SUMMARY_API = 'https://hust-trolyao-gateway.io.vn/report-service/api/v1/jobs/summary';
const CRAWLER_JOB_API = 'https://hust-trolyao-gateway.io.vn/crawler-service/api/v1/crawler-jobs';
const TRIGGER_API = `${CRAWLER_JOB_API}/course/trigger`;

export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type JobTrigger = 'MANUAL' | 'SCHEDULED';

export interface Job {
    id: string;
    jobRunrId: string | null;
    jobName: string;
    status: JobStatus;
    trigger: JobTrigger;
    queuedAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    durationMs: number | null;
    totalRecords: number;
    savedRecords: number;
    currentPage: number;
    errorMessage: string | null;
    logs: string[];
}

export interface JobFilter {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    jobName?: string;
    status?: JobStatus;
    trigger?: JobTrigger;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface JobSummary {
    totalJobs: number;
    totalSuccess: number;
    totalRunning: number;
    totalFailed: number;
    totalQueued: number;
    totalCancelled: number;
}

interface BaseResponse<T> {
    data: T;
    message: {
        message: string;
        status: number;
    };
}

function getHeaders() {
    const token = localStorage.getItem('cms_access_token');

    if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn');
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

async function parseResponse(response: Response) {
    const text = await response.text();

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    const body = await parseResponse(response);

    if (!response.ok) {
        const message = typeof body === 'string'
            ? body
            : body?.message?.message || body?.message || 'Không thể thực hiện yêu cầu';

        throw new Error(message);
    }

    return body as T;
}

export async function getJobs(filter: JobFilter): Promise<PageResponse<Job>> {
    const params = new URLSearchParams();

    params.set('page', String(filter.page ?? 0));
    params.set('size', String(filter.size ?? 10));

    if (filter.startDate) params.set('startDate', filter.startDate);
    if (filter.endDate) params.set('endDate', filter.endDate);
    if (filter.jobName?.trim()) params.set('jobName', filter.jobName.trim());
    if (filter.status) params.set('status', filter.status);
    if (filter.trigger) params.set('trigger', filter.trigger);

    const response = await fetch(`${REPORT_API}?${params.toString()}`, {
        headers: getHeaders(),
    });

    const body = await handleResponse<BaseResponse<PageResponse<Job>>>(response);
    return body.data;
}

export async function getJobSummary(): Promise<JobSummary> {
    const response = await fetch(SUMMARY_API, {
        headers: getHeaders(),
    });

    const body = await handleResponse<BaseResponse<JobSummary>>(response);
    return body.data;
}

export async function getJobDetail(id: string): Promise<Job> {
    const response = await fetch(`${REPORT_API}/${id}`, {
        headers: getHeaders(),
    });

    const body = await handleResponse<BaseResponse<Job>>(response);
    return body.data;
}

export async function triggerCourseCrawler(): Promise<Job> {
    const response = await fetch(TRIGGER_API, {
        method: 'POST',
        headers: getHeaders(),
    });

    return handleResponse<Job>(response);
}

export async function stopJob(id: string): Promise<Job> {
    const response = await fetch(`${CRAWLER_JOB_API}/${id}/stop`, {
        method: 'POST',
        headers: getHeaders(),
    });

    return handleResponse<Job>(response);
}

export async function deleteJob(id: string): Promise<void> {
    const response = await fetch(`${CRAWLER_JOB_API}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}

export function formatDate(value: string | null) {
    if (!value) return 'Chưa có';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(value));
}

export function formatDuration(durationMs: number | null, status?: JobStatus) {
    if (durationMs == null) {
        if (status === 'QUEUED') return 'Chưa bắt đầu';
        if (status === 'RUNNING') return 'Đang chạy';
        return 'Chưa có';
    }

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours > 0 ? `${hours} giờ` : '',
        minutes > 0 ? `${minutes} phút` : '',
        `${seconds} giây`,
    ].filter(Boolean).join(' ');
}