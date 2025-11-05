import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import UploadPage from './pages/UploadPage';
import UploadsPage from './pages/UploadsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaylistsPage from './pages/PlaylistsPage';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch/:id" element={<VideoPlayerPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                <UploadsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
