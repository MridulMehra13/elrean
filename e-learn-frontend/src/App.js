import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute"; // ✅ Import PrivateRoute
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Leaderboard from "./pages/Leaderboard";
import Courses from "./pages/Courses";
import { SidebarProvider } from "./context/SidebarContext";
import ChatbotTeacherPage from './pages/ChatbotTeacherPage';
import CourseDetails from "./pages/CourseDetails";
import UploadCourse from "./pages/UploadCourse";
import QuizList from './pages/QuizList';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import MyQuizHistory from './pages/MyQuizHistory';
import SmartQuestionGenerator from './pages/SmartQuestionGenerator';
import Recommendations from "./pages/Recommendations";

function App() {
  return (
    <AuthProvider>
      <Router>
        <SidebarProvider> {/* Wrap inside Router, so hooks like useLocation work properly */}
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <div className="p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/course/:id" element={<CourseDetails />} />
                    <Route path="/upload-course" element={<UploadCourse />} />
                    {/* ✅ Quiz Routes */}
                    <Route path="/quiz" element={<QuizList />} />
                    <Route path="/quiz/attempt/:id" element={<QuizAttempt />} />
                    <Route path="/quiz/result" element={<QuizResult />} />
                    <Route path="/my-quiz-history" element={<MyQuizHistory />} />
                    <Route path="/smart-question-generator" element={<SmartQuestionGenerator />} />
                    <Route path="/chatbot-teacher" element={<ChatbotTeacherPage />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
