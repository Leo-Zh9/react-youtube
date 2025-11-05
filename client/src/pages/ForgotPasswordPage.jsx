import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-950 border border-gray-900 p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-3">Check Your Email</h2>
            <p className="text-gray-400 mb-6 text-sm">
              If an account exists with <strong className="text-white">{email}</strong>, we've sent password reset instructions.
            </p>
            <p className="text-gray-600 text-xs mb-8">
              The link will expire in 15 minutes. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 transition-all shadow-lg hover:shadow-xl"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-white mb-2">Forgot Password</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="bg-gray-900 border-l-4 border-white px-4 py-3 mb-6">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;

