import React, { useEffect, useState } from 'react';
import {Upload , Video} from 'lucide-react' // Import the upload icon
import VideoCard from '../VideoCard/VideoCard';
import Sidebar from '../Sidebar/Sidebar';
import api from '../../services/api'; 
import Loading from '../Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isItLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  useEffect(() => {
    // Fetch videos from the backend
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos/'); 
        console.log('Fetched Videos:', response.data.data.videos);
        setVideos(response.data.data.videos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handlePlusClick = () => {
    navigate('/studio');
  };

  return (
    <div>
      <div className="flex flex-1 bg-gray-900 mt-14 md:mt-16">
        <div className="md:w-16">
          <Sidebar />
        </div>

        <div className="p-4 md:ml-11 md:mt-0 mt-20 flex flex-wrap justify-center lg:justify-start overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center w-full h-full">
              <Loading />
            </div>
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <div key={video._id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
                <VideoCard video={video} />
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <p className="text-white text-lg">No videos available</p>
            </div>
          )}
        </div>

        {/* Floating Plus Button */}
        {isItLoggedIn &&  <div className="fixed bottom-6 right-6">
          <button className="bg-red-500 hover:bg-red-400 text-white font-bold p-6 rounded-full shadow-lg border-1 border-white" onClick={handlePlusClick}>
            <Video size={24} />
          </button>
        </div>
        }
    
      </div>
    </div>
  );
};

export default VideoFeed;
