import { useState } from 'react'

import './App.css'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import {Route , Routes} from 'react-router-dom'
import React, { useEffect } from 'react';
import { useDispatch , useSelector } from 'react-redux';
import {setUser, clearUser} from './redux/slices/authSlice'
import api from './services/api'
import Cookies from 'js-cookie';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Make a request to a protected route
        const response = await api.get('/users/current-user');
        dispatch(setUser(response.data.data.fullname));
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
  </Routes>
   </>
  )
}

export default App
