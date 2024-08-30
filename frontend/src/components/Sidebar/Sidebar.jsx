import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSelector } from 'react-redux';
const Sidebar = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
const user = useSelector((state)=>state.auth.user)
const isLoggedIn = useSelector((state)=>state.auth.isLoggedIn)
  // Function to fetch subscribed channels
  const fetchSubscribedChannels = async () => {
    try {
      const response = await api.get(`/subscriptions/u/${user._id}`); // Replace with your actual API endpoint
      console.log(" Subscribed channels fetched :" , response.data.data)
      setSubscriptions(response.data.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, [user._id , isLoggedIn]); // Empty dependency array ensures this runs once on mount

  const navigateToHome = () => {
    navigate('/');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleChannelClick = (username) => {
    navigate(`/channel/${username}`);
  };

  return (
    <div className="fixed left-0 h-full w-fit bg-gray-800 text-white p-4 border-r border-gray-700 hidden md:block overflow-y-auto">
      <div className="mb-4">
        <ul>
          <li className="flex flex-col items-center py-2 hover:bg-gray-700 rounded-md" onClick={navigateToHome}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="mt-2">Home</span>
          </li>
          <li className="flex flex-col items-center py-2 hover:bg-gray-700 rounded-md">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 2.286m0 0l.858.858M11.5 4L16 8.5m-1.5 4.72V19M4 11h5"
              />
            </svg>
            <span className="mt-2">Convo</span>
          </li>
          <li className="flex flex-col items-center py-2 hover:bg-gray-700 rounded-md" onClick={handleDashboardClick}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="mt-2">You</span>
          </li>
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="text-lg mb-2 border-b-2 border-gray-500 ">Subscriptions</h2>
        <ul>
          {subscriptions.length > 0 ? (
            subscriptions.map((channel) => (
              <li key={channel.channels.id} onClick={() => handleChannelClick(channel.channels.username)} className="flex items-center py-2 hover:bg-gray-700 rounded-md cursor-pointer">
                <img
                  src={channel.channels.avatar}
                  alt={channel.channels.username}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className='truncate max-w-[59px]'>{channel.channels.username}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-center">!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
