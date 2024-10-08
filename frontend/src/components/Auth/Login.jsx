import React, { useState } from 'react';
import Loading from '../Loading/Loading';
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { setUser } from '../../redux/slices/authSlice';
import { extractErrorMessage } from '../../services/extractError';

const Login = ({ toggleLogin, switchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null); // State for unverified email
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUnverifiedEmail(null);

    try {
      const response = await api.post('/users/login', {
        username,
        password
      });

      const { accessToken, refreshToken, user } = response.data.data;

      if (response.status === 200) {
        const { fullname, username, email, avatar, coverImage, _id } = user;
        dispatch(setUser({ fullname, username, email, avatar, coverImage, _id }));
        toggleLogin();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error.response.data);
      if (error.response.status === 410) {
        setUnverifiedEmail(username); // Set unverified email for resending the verification
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    try {
      await api.post('/users/resend-verification', { username });
      toast.success("Verification email has been resent. Please check your inbox.");
    } catch (error) {
      const errorMessage = extractErrorMessage(error.response.data);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <ToastContainer />
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Channel Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600">
              Login
            </button>
          </form>
        )}

        {/* Show Resend Verification Email Button if the email is unverified */}
        {unverifiedEmail && (
          <div className="mt-4 text-center">
            <p className="text-yellow-400">Email not verified. Check your inbox or resend the verification email.</p>
            <button
              className="mt-2 bg-blue-500 py-2 px-4 rounded-lg hover:bg-blue-600"
              onClick={resendVerificationEmail}
            >
              Resend Verification Email
            </button>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button className="text-blue-500" onClick={switchToRegister}>
            Register
          </button>
          <button className="text-red-500" onClick={toggleLogin}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
