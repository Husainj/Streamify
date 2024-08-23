
import './App.css'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import {Route , Routes} from 'react-router-dom'
import React, { useEffect } from 'react';
import { useDispatch , useSelector } from 'react-redux';
import {setUser, clearUser} from './redux/slices/authSlice'
import api from './services/api'
import Studio from './pages/Studio';
import VideoDetail from './components/VideoDetail/VideoDetail';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Make a request to a protected route
        const response = await api.get('/users/current-user');
        console.log("After refreshing data : ", response.data )
        const {  data } = response.data;
        const { fullname, username, email, avatar, coverImage , _id} = data;
        dispatch(setUser({ fullname, username, email, avatar, coverImage  , _id}));
      } catch (error) {
        // If the request fails, the user is not authenticated
        console.error('Authentication check failed', error);
      }
    };

    checkAuthStatus();
  }, [dispatch]);



  const isItLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  console.log("State of logged In user after refreshing: " , isItLoggedIn )

  return (
   <>
   {/* <LandingPage /> */}
  <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/videos/:id" element={<VideoDetail />} />
  </Routes>
   </>
  )
}

export default App
