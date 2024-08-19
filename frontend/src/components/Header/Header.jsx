import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, PlusCircle, LogIn } from 'lucide-react';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import { useDispatch, useSelector } from 'react-redux';
import {  clearUser} from '../../redux/slices/authSlice'// Import your logout action
import api from '../../services/api';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();

  const toggleLogin = () => setShowLoginModal(!showLoginModal);
  const toggleRegister = () => setShowRegisterModal(!showRegisterModal);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const isItLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async() => {

  
    try {
      const response = await api.post('/users/logout')
      dispatch(clearUser());
          
      console.log(response)
         } catch (error) {
          console.log(error)
         }
         setShowDropdown(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-black text-white p-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and menu button */}
        <div className="flex items-center">
          <button className="mr-4 lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center md:mr-40">
            <span className="text-xl font-bold">Vidflix {isItLoggedIn ? 'Logged In' : 'Logged Out'} {user.fullname}</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center flex-grow mx-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 bg-gray-800 rounded-l-full focus:outline-none"
          />
          <button className="bg-gray-700 px-4 py-2.5 rounded-r-full">
            <Search size={20} />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center md:ml-40 relative">
          {isItLoggedIn ? (
            <div className="flex items-center">
              <button className="p-2">
                <PlusCircle size={24} />
              </button>
              <button className="p-2 relative" onClick={toggleDropdown}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                )}
              </button>
              {showDropdown && (
                <div ref={dropdownRef} className="absolute right-0 mt-20 w-30 bg-gray-800 text-white rounded-md shadow-lg">
                  <button
                    className="block px-4 py-2 text-sm w-full text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="p-2 flex items-center" onClick={toggleLogin}>
              <LogIn size={24} className="mr-2" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mt-4 md:hidden">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 bg-gray-800 rounded-l-full focus:outline-none"
          />
          <button className="bg-gray-700 px-4 py-2.5 rounded-r-full">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mt-4 lg:hidden">
          <nav>
            <a href="#" className="block py-2">Home</a>
            <a href="#" className="block py-2">Convo</a>
            <a href="#" className="block py-2">Subscriptions</a>
            <a href="#" className="block py-2">You</a>
          </nav>
        </div>
      )}

      {/* For login and register Modal */}
      {showLoginModal && (
        <Login toggleLogin={toggleLogin} switchToRegister={switchToRegister} />
      )}

      {showRegisterModal && (
        <Register toggleRegister={toggleRegister} switchToLogin={switchToLogin} />
      )}
    </header>
  );
};

export default Header;
