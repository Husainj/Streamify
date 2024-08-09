import React, { useState } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';
const Login = ({ toggleLogin, switchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);  // Reset error state before each request
    setLoading(true);

    try {
  
      const response = await axios.post('http://localhost:8000/api/v1/users/login', {
        username,
        password
      });

      console.log(response.data)
      if (response.data.status === 200) {
        alert('User LoggedIn successfully');
        toggleLogin();
        
      } else {
        setError(response.data.message);
      }

    } catch (error) {
      setError('An error occurred while Login the user' , error);
    }
    finally {
      setLoading(false);  // Set loading to false when the request completes
    }


   
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading ? (
          <Loading />  // Display the loading component when loading
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
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
