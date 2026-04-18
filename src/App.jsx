import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Subjects from './pages/admin/Subjects';
import Questions from './pages/admin/Questions';
import FreeTrial from './pages/admin/FreeTrial';
import Announcements from './pages/admin/Announcements';
import QuestionTypes from './pages/admin/QuestionTypes';
import Payments from './pages/admin/Payments';   // <-- NEW

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import FreeTrialQuiz from './pages/student/FreeTrialQuiz';
import TakeQuiz from './pages/student/TakeQuiz';
import Results from './pages/student/Results';

const App = () => {
  const { loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes with Sidebar */}
      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <AdminDashboard />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/students" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <Students />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/subjects" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <Subjects />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/questions" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <Questions />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/question-types" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <QuestionTypes />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/free-trial" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <FreeTrial />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/announcements" element={
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <Announcements />
            </div>
          </div>
        </PrivateRoute>
      } />
      <Route path="/admin/payments" element={   // <-- NEW
        <PrivateRoute adminOnly>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
              <Payments />
            </div>
          </div>
        </PrivateRoute>
      } />

      {/* Student Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <StudentDashboard />
        </PrivateRoute>
      } />
      <Route path="/free-trial" element={
        <PrivateRoute>
          <FreeTrialQuiz />
        </PrivateRoute>
      } />
      <Route path="/take-quiz/:typeId" element={
        <PrivateRoute>
          <TakeQuiz />
        </PrivateRoute>
      } />
      <Route path="/results" element={
        <PrivateRoute>
          <Results />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default App;