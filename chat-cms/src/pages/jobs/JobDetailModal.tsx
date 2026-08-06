import {X, CheckCircle, AlertTriangle, Clock, Database} from "lucide-react";

interface Job {
    id:number;
    name:string;
    type:string;
    status:"SUCCESS"|"RUNNING"|"FAILED"|"WAITING";
    startTime:string;
    endTime:string;
    duration:string;
    records:number;
    error?:string;
    log:string[];
}

interface Props {
    job:Job;
    close:()=>void;
}

export default function JobDetailModal({job, close}:Props){
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Chi tiết Job
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Job ID: #{job.id}
                        </p>
                    </div>

                    <button onClick={close} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100">
                        <X size={20}/>
                    </button>
                </div>


                <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-red-300">

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoCard title="Tên Job" value={job.name}/>
                        <InfoCard title="Loại Job" value={job.type}/>
                        <InfoCard title="Bắt đầu" value={job.startTime}/>
                        <InfoCard title="Kết thúc" value={job.endTime}/>
                        <InfoCard title="Thời gian chạy" value={job.duration}/>
                        <InfoCard title="Số bản ghi" value={`${job.records} records`}/>
                    </div>


                    <div className="mt-6 rounded-2xl border p-5">

                        <div className="mb-4 flex items-center gap-2">
                            <Database size={18} className="text-red-700"/>
                            <h3 className="font-bold">
                                Execution Log
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {job.log.map((item,index)=>(
                                <div key={index} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-red-700"/>
                                    <p className="text-sm text-gray-700">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>


                    {job.error && (
                        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">

                            <div className="mb-2 flex items-center gap-2 font-semibold text-red-700">
                                <AlertTriangle size={18}/>
                                Error
                            </div>

                            <p className="text-sm text-red-600">
                                {job.error}
                            </p>

                        </div>
                    )}


                    <div className="mt-6 rounded-2xl bg-gray-50 p-5">

                        <div className="mb-3 flex items-center gap-2">
                            {job.status==="SUCCESS" ? (
                                <CheckCircle size={18} className="text-green-600"/>
                            ) : (
                                <Clock size={18} className="text-blue-600"/>
                            )}

                            <span className="font-semibold">
                                Trạng thái hiện tại
                            </span>
                        </div>

                        <span className={`
                            inline-flex rounded-full px-4 py-2 text-sm font-semibold
                            ${job.status==="SUCCESS" && "bg-green-100 text-green-700"}
                            ${job.status==="FAILED" && "bg-red-100 text-red-700"}
                            ${job.status==="RUNNING" && "bg-blue-100 text-blue-700"}
                            ${job.status==="WAITING" && "bg-orange-100 text-orange-700"}
                        `}>
                            {job.status}
                        </span>

                    </div>

                </div>


                <div className="flex justify-end border-t px-6 py-4">
                    <button onClick={close} className="rounded-xl bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-800">
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
}


function InfoCard({title,value}:{title:string;value:string}){
    return (
        <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">
                {title}
            </p>

            <p className="mt-2 font-semibold text-gray-900">
                {value}
            </p>
        </div>
    );
}