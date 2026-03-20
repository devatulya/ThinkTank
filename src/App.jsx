import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddIdeaPage from './pages/AddIdeaPage';
import LibraryPage from './pages/LibraryPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddIdeaPage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#000',
                border: '2.4px solid #000',
                borderRadius: '0px',
                boxShadow: '4px 4px 0px 0px #000',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '700'
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
