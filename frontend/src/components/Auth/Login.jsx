import React, { useState } from 'react';
import Loading from '../Loading/Loading';
import api from "../../services/api"
import { useNavigate} from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
// import {toggleIsLogin} from '../../redux/slices/authSlice'
import { ToastContainer , toast } from 'react-toastify';
import {setUser , clearUser} from '../../redux/slices/authSlice'



const Login = ({ toggleLogin, switchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);  // Reset error state before each request
    setLoading(true);

    try {
  
      // const response = await axios.post('http://localhost:8000/api/v1/users/login', {
      //   username,
      //   password
      // });

      const response = await api.post('/users/login' , {
        username,
        password
      })
      
      console.log("This is the data recieved :: ")
      console.log( "Data recieved",response)
      console.log("Response.data : " , response.data)
      console.log("response.data.data.user : " , response.data.data.user)

      const { accessToken, refreshToken, user } = response.data.data;
      console.log("Access token : " , accessToken)
      console.log("Refresh token : " , refreshToken)
      console.log("STATUS" , response.status)

      if (response.status === 200) {
       setError("User login successful in frontend")
       const { fullname, username, email, avatar, coverImage , _id} = user;
      //  dispatch(toggleIsLogin())
      dispatch(setUser({ fullname, username, email, avatar, coverImage , _id }));
      //  dispatch(login())
      //  setIsLoggedIn(true);
        toggleLogin();
    
      }

    } catch (error) {
     
      console.log("Error" , error)
      console.log("Error.response" , error.response)
      console.log("Errro.response.data" , error.response.data)
      toast.error(error.response.data)
      setError('An error occurred while Login the user in frontend' , error);
    }
    finally {
      setLoading(false); 
    }


   
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <ToastContainer />
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
