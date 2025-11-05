import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, formData.newPassword);
      
      // Navigate to login with success message
      navigate('/login', {
        state: {
          message: 'Password reset successful! Please login with your new password.',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to Login</span>
        </button>

        <div className="bg-gray-950 border border-gray-900 p-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your new password below.
          </p>

          {error && (
            <div className="bg-gray-900 border-l-4 border-white px-4 py-3 mb-6">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-3">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full bg-black border border-gray-800 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:bg-gray-950 transition-all"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-600 mt-2">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full bg-black border border-gray-800 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:bg-gray-950 transition-all"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold py-3 transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center pt-4">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Remember your password? <span className="font-medium">Sign in</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

