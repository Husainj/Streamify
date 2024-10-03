import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';
import { extractErrorMessage } from '../../services/extractError';
import { toast, ToastContainer } from 'react-toastify';
import { UploadIcon } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Register = ({ toggleRegister, switchToLogin }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  useEffect(() => {
    validateUsername(username);
  }, [username]);

  const validateUsername = (value) => {
    const isValid = !/[A-Z\s]/.test(value);
    setIsUsernameValid(isValid);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!avatar) {
      toast.error('Please upload an avatar before registering.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);
      if (coverImage) formData.append('coverImage', coverImage);

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Registration response: ', response);

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        setRegistered(true);
      } else {
        setError(response.data.message || 'An error occurred during registration');
      }
    } catch (error) {
      if (error.response.status === 430) {
        toast.error('Avatar Must be uploaded!');
      } else {
        const errorMessage = extractErrorMessage(error.response.data);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/resend-verification`, { email });
      alert('Verification email resent. Please check your inbox.');
    } catch (error) {
      const errorMessage = extractErrorMessage(error.response.data);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar').click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  if (registered) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Registration Successful</h2>
          <p className="text-center mb-4">
            Thank you for registering! Please check your email to verify your account. If you didn't receive the email, you can request to resend it.
          </p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            onClick={handleResendVerification}
            className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 mb-4 flex items-center justify-center"
            disabled={resendLoading}
          >
            {resendLoading ? <Loading /> : 'Resend Verification Email'}
          </button>
          <button onClick={switchToLogin} className="w-full bg-green-500 py-2 rounded-lg hover:bg-green-600">
            Proceed to Login
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex justify-center mb-4">
              <div
                className="relative w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-600 overflow-hidden"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="object-cover w-full h-full" />
                ) : (
                  <UploadIcon className="text-white text-2xl" />
                )}
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  required
                />
              </div>
            </div>
            {!avatar && <p className="text-red-500 text-sm text-center">Avatar is required</p>}

            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Channel Name */}
            <input
              type="text"
              placeholder="Channel Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg border ${
                isUsernameValid ? 'border-gray-600' : 'border-red-500'
              } focus:outline-none focus:ring-2 ${
                isUsernameValid ? 'focus:ring-blue-500' : 'focus:ring-red-500'
              }`}
              required
            />
            {!isUsernameValid && (
              <p className="text-red-500 text-sm">Channel Name must be lowercase without spaces</p>
            )}
            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Cover Image */}
            <div>
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
              <label htmlFor="coverImage" className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer inline-block">
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Cover Preview" className="object-cover w-full h-24" />
                ) : (
                  'Upload Cover Image'
                )}
              </label>
            </div>
            {/* Register Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isUsernameValid || !avatar}
            >
              Register
            </button>
          </form>
        )}
        <div className="flex justify-between mt-4">
          <button className="text-blue-500" onClick={switchToLogin}>
            Login
          </button>
          <button className="text-gray-400" onClick={toggleRegister}>
            Cancel
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;