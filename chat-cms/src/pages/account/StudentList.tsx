import {Edit, Eye, Filter, Plus, Search, Trash2} from "lucide-react";
import {useMemo, useState} from "react";
import StudentModal from "./StudentModal.tsx";


interface Student {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    className: string;
    status: "ACTIVE" | "LOCKED";
}


const studentsData: Student[] = [
    {
        id: 1,
        code: "20210001",
        name: "Nguyễn Văn An",
        email: "an.nguyen@hust.edu.vn",
        phone: "0988888888",
        department: "Công nghệ thông tin",
        className: "IT1-K66",
        status: "ACTIVE"
    },
    {
        id: 2,
        code: "20210002",
        name: "Trần Minh Đức",
        email: "duc.tran@hust.edu.vn",
        phone: "0977777777",
        department: "Điện tử viễn thông",
        className: "DT2-K66",
        status: "LOCKED"
    },
    {
        id: 3,
        code: "20210003",
        name: "Phạm Minh Tuấn",
        email: "tuan.pham@hust.edu.vn",
        phone: "0966666666",
        department: "Cơ khí",
        className: "CK1-K66",
        status: "ACTIVE"
    }
];


type ModalType = "create" | "edit" | "detail" | "delete" | null;


export default function StudentList() {

    const [students] = useState<Student[]>(studentsData);

    const [keyword, setKeyword] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [studentName, setStudentName] = useState("");
    const [status, setStatus] = useState("ALL");

    const [modal, setModal] = useState<ModalType>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);


    const filteredStudents = useMemo(() => {

        return students.filter(student => {

            const searchAll =
                `${student.code} ${student.name} ${student.email}`
                    .toLowerCase()
                    .includes(keyword.toLowerCase());

            const matchCode =
                student.code
                    .toLowerCase()
                    .includes(studentCode.toLowerCase());

            const matchName =
                student.name
                    .toLowerCase()
                    .includes(studentName.toLowerCase());

            const matchStatus =
                status === "ALL" ||
                student.status === status;


            return searchAll &&
                matchCode &&
                matchName &&
                matchStatus;

        });

    }, [
        students,
        keyword,
        studentCode,
        studentName,
        status
    ]);


    const openModal = (
        type: ModalType,
        student?: Student
    ) => {

        setModal(type);
        setSelectedStudent(student || null);

    };


    const closeModal = () => {

        setModal(null);
        setSelectedStudent(null);

    };


    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý sinh viên
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Quản lý tài khoản sinh viên trong hệ thống HUST Assistant
                    </p>
                </div>


                <button
                    onClick={() => openModal("create")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white shadow-lg shadow-red-700/20 hover:bg-red-800">
                    <Plus size={20}/>
                    Thêm sinh viên
                </button>

            </div>


            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-4">

                    <div className="
                        flex items-center gap-3
                        rounded-xl border px-4
                    ">

                        <Search size={18} className="text-gray-400"/>

                        <input
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            placeholder="Tìm kiếm tổng..."
                            className="w-full py-3 outline-none"
                        />

                    </div>


                    <input
                        value={studentCode}
                        onChange={e => setStudentCode(e.target.value)}
                        placeholder="Tìm theo MSSV"
                        className="
                            rounded-xl border px-4 py-3
                            outline-none focus:border-red-700
                        "
                    />


                    <input
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Tìm theo tên sinh viên"
                        className="
                            rounded-xl border px-4 py-3
                            outline-none focus:border-red-700
                        "
                    />


                    <div className="flex items-center gap-3">

                        <Filter size={18} className="text-gray-400"/>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="
                                w-full rounded-xl border px-4 py-3
                            "
                        >
                            <option value="ALL">
                                Tất cả trạng thái
                            </option>

                            <option value="ACTIVE">
                                Đang hoạt động
                            </option>

                            <option value="LOCKED">
                                Đã khóa
                            </option>

                        </select>

                    </div>

                </div>

            </div>


            <div className="
                overflow-hidden rounded-3xl
                border border-gray-100
                bg-white shadow-sm
            ">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                        <thead className="bg-gray-50">

                        <tr>

                            <th className="px-6 py-4 text-left text-sm text-gray-500">
                                MSSV
                            </th>

                            <th className="px-6 py-4 text-left text-sm text-gray-500">
                                Sinh viên
                            </th>

                            <th className="px-6 py-4 text-left text-sm text-gray-500">
                                Khoa
                            </th>

                            <th className="px-6 py-4 text-left text-sm text-gray-500">
                                Trạng thái
                            </th>

                            <th className="px-6 py-4 text-right text-sm text-gray-500">
                                Thao tác
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {
                            filteredStudents.map(student => (

                                <tr
                                    key={student.id}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="px-6 py-5 font-semibold">
                                        {student.code}
                                    </td>


                                    <td className="px-6 py-5">

                                        <p className="font-semibold text-gray-900">
                                            {student.name}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            {student.email}
                                        </p>

                                    </td>


                                    <td className="px-6 py-5 text-gray-600">
                                        {student.department}
                                    </td>


                                    <td className="px-6 py-5">

                                        <span className={`
                                            rounded-full px-3 py-1
                                            text-xs font-semibold
                                            ${
                                            student.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                        }
                                        `}>
                                            {
                                                student.status === "ACTIVE"
                                                    ? "Hoạt động"
                                                    : "Đã khóa"
                                            }
                                        </span>

                                    </td>


                                    <td className="px-6 py-5">

                                        <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() => openModal("detail", student)}
                                                className="rounded-xl bg-blue-50 p-2 text-blue-600"
                                            >
                                                <Eye size={18}/>
                                            </button>

                                            <button
                                                onClick={() => openModal("edit", student)}
                                                className="rounded-xl bg-orange-50 p-2 text-orange-600"
                                            >
                                                <Edit size={18}/>
                                            </button>

                                            <button
                                                onClick={() => openModal("delete", student)}
                                                className="rounded-xl bg-red-50 p-2 text-red-600"
                                            >
                                                <Trash2 size={18}/>
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))
                        }

                        </tbody>

                    </table>

                </div>

            </div>


            {
                modal && (
                    <StudentModal
                        type={modal}
                        student={selectedStudent}
                        close={closeModal}
                    />
                )
            }

        </div>
    );
}