import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";
const VideoSearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state)=>state.auth.user)
const isItLoggedIn = useSelector((state)=>state.auth.isLoggedIn)
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    navigate(`/search?query=${query}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <div className="hidden md:flex items-center flex-grow mx-4">
        <input
          type="text"
          placeholder="Search videos..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2 bg-gray-800 rounded-l-full focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-gray-700 px-4 py-2.5 rounded-r-full"
        >
          <Search size={20} />
        </button>
      </div>



      <div className="mt-4 md:hidden flex-col ">
        <div className='items-center text-center font-bold mb-1'>
          Hiii, {user.fullname} 👋
        </div>
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
    </div>
  );
};

export default VideoSearchBar;
