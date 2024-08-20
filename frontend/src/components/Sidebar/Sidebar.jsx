// Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
const navigateToHome = () =>{
  navigate('/')
}

const handleDashboardClick =()=>{
  navigate('/dashboard')
}
  return (
    <div className="fixed left-0 h-full w-fit bg-gray-800 text-white p-4 border-r border-gray-700 hidden md:block">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="mt-2">Subscriptions</span>
          </li>
          <li className="flex flex-col items-center py-2 hover:bg-gray-700 rounded-md" onClick={handleDashboardClick} >
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
    </div>
  );
};

export default Sidebar;