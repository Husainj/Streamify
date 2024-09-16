
import './App.css'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import {Route , Routes , Navigate , useLocation} from 'react-router-dom'
import React, { useEffect } from 'react';
import { useDispatch , useSelector } from 'react-redux';
import {setUser, clearUser} from './redux/slices/authSlice'
import api from './services/api'
import Studio from './pages/Studio';
import VideoDetail from './components/VideoDetail/VideoDetail';
import ChannelPage from './pages/ChannelPage';
import Subscriptions from './pages/Subscriptions';
import SearchResultsPage from './pages/SearchResultsPage';
import { toast ,ToastContainer } from 'react-toastify';
import EmailVerification from './components/EmailVerification/EmailVerification';
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to access this page");
    }
  }, [isLoggedIn, location]);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
       <ToastContainer />
 <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path="/videos/:id" element={<VideoDetail />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/verify-email/:token" element={<EmailVerification />}/>
        {/* Protected Routes */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/studio" element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        } />
        <Route path="/m/subscriptions" element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        } />
      </Routes>

   </>
  )
}

export default App
