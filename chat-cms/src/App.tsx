import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import Layout from "./components/Layout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CourseList from './pages/CourseList.tsx';
import StudentList from "./pages/account/StudentList.tsx";
import JobList from "./pages/jobs/JobList.tsx";

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/courses" element={<Layout><CourseList /></Layout>} />
                    <Route path="/students" element={<Layout><StudentList /></Layout>} />
                    <Route path="/jobs" element={<Layout><JobList /></Layout>} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
