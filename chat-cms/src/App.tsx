import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CourseList from './pages/CourseList';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import StudentList from './pages/account/StudentList';
import JobList from './pages/jobs/JobList';
import Profile from "./pages/Profile.tsx";
import ChatHistoryList from "./pages/chat-history/ChatHistoryList.tsx";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout><Dashboard /></Layout>} />
                        <Route path="/courses" element={<Layout><CourseList /></Layout>} />
                        <Route path="/students" element={<Layout><StudentList /></Layout>} />
                        <Route path="/jobs" element={<Layout><JobList /></Layout>} />
                        <Route path="/chat-history" element={<Layout><ChatHistoryList /></Layout>} />
                        <Route path="/profile" element={<Layout><Profile /></Layout>} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <ToastContainer newestOnTop />
        </>
    );
}

export default App;