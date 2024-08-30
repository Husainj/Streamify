import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import api from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import VideoSearchBar from '../components/VideoSearchBar/VideoSearchBar';
const SearchResultsPage = () => {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const query = new URLSearchParams(location.search).get('query');

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/', {
        params: {
          page,
          query,
          limit: 10,
          sortBy: 'createdAt',
          sortType: 'desc',
        },
      });

      const { videos, pagination } = response.data.data;
      console.log(response.data.data)
      setVideos(videos);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, query]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar /> {/* Include the Sidebar component */}
      <div className="flex-1 p-4 md:ml-[9rem] "> {/* Adjusted for the sidebar width */}
        <VideoSearchBar />
        <h2 className="text-3xl font-bold mb-6 text-center">
          Search Results for "{query}"
        </h2>
        <div className="space-y-4 ">
          {videos ? videos.map((video) => (
            <div
              key={video._id}
              className="flex bg-gray-800 rounded-lg overflow-hidden shadow-lg  "
              onClick={() => window.location.href = `/channel/${video.owner.username}`}
            >
              <img
                src={video.thumbnail || 'https://via.placeholder.com/300'} // Replace with actual thumbnail logic
                alt={video.title}
                className="w-48 h-auto object-cover"
                style={{ aspectRatio: '16/9' }}
              />
              <div className="p-4 flex flex-col justify-center">
                <h3 className="text-xl font-semibold truncate">{video.title}</h3>
                <p className="text-gray-400 mt-2 line-clamp-2">{video.description}</p>
                <p className="text-gray-500 text-sm mt-4">
                  {video.owner.username}  
                </p>
              </div>
            </div>
          )) : <p className=' text-center '>No videos found</p>}
        </div>
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`${
              page === 1 ? 'bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-2 px-4 rounded-full transition-colors duration-300`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`${
              page === totalPages ? 'bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-2 px-4 rounded-full transition-colors duration-300`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
