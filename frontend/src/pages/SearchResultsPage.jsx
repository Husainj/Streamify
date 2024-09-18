import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import VideoSearchBar from '../components/VideoSearchBar/VideoSearchBar';
import Loading from '../components/Loading/Loading';
import { Menu } from "lucide-react";
import MobileMenu from '../components/MobileMenu/MobileMenu';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const query = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/videos/', {
          params: { page, query, limit: 10, sortBy: 'createdAt', sortType: 'desc' },
        });
        const { videos, pagination } = response.data.data;
        setVideos(videos || []);
        setTotalPages(pagination?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to fetch videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [page, query]);

  if (isLoading) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center"><Loading /></div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{error}</div>;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="fixed top-0 left-0 right-0 bg-black z-50 p-4 flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none mr-4"
        >
          <Menu size={24} />
        </button>
        <div className="flex-grow">
          <VideoSearchBar />
        </div>
      </div>

      <div className="flex flex-1 mt-20">
        <Sidebar />
        {isMobileMenuOpen && (
          <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
            onNavigate={handleNavigation}
          />
        )}
        <div className="flex-1 p-4 md:ml-[9rem]">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Search Results for "{query}"
          </h2>
          <div className="space-y-4">
            {videos.length > 0 ? videos.map((video) => (
              <div
                key={video._id}
                className="flex bg-gray-800 rounded-lg overflow-hidden shadow-lg flex-col md:flex-row"
                onClick={() => video?.owner?.username && (window.location.href = `/videos/${video._id}`)}
              >
                <img
                  src={video.thumbnail || 'https://via.placeholder.com/300'}
                  alt={video.title}
                  className="w-full md:w-48 h-auto object-cover"
                  style={{ aspectRatio: '16/9' }}
                />
                <div className="p-4 flex flex-col justify-center flex-grow">
                  <h3 className="text-xl font-semibold truncate md:whitespace-nowrap md:overflow-hidden">{video.title}</h3>
                  <p className="text-gray-400 mt-2 line-clamp-2">{video.description}</p>
                  <p className="text-gray-500 text-sm mt-4">
                    {video?.owner?.username || 'Unknown User'}
                  </p>
                </div>
              </div>
            )) : <p className='text-center'>No videos found</p>}
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
    </div>
  );
};

export default SearchResultsPage;
