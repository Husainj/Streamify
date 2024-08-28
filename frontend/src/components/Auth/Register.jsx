import React, { useState } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';

const Register = ({ toggleRegister, switchToLogin }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);  // Reset error state before each request
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);
      if (coverImage) formData.append('coverImage', coverImage);

      const response = await axios.post('http://localhost:8000/api/v1/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(response.data)
      

      if (response.data.status === 200) {
        alert('User registered successfully');
        toggleRegister();
        
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred while registering the user');
    }
    finally {
      setLoading(false);  // Set loading to false when the request completes
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <Loading />  // Display the loading component when loading
        ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          
          <input
            type="file"
            placeholder="Avatar"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          Upload Avatar
          
          <input
            type="file"
            placeholder="coverimage"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          Upload Coverimage
          <button type="submit" className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600">
            Register
          </button>
        </form>
        )}
        <div className="flex justify-between mt-4">
          <button className="text-blue-500" onClick={switchToLogin}>
            Login
          </button>
          <button className="text-red-500" onClick={toggleRegister}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
