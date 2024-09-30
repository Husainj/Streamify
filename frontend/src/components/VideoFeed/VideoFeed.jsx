import React, { useEffect, useState } from 'react';
import VideoCard from '../VideoCard/VideoCard';
import Sidebar from '../Sidebar/Sidebar';
import api from '../../services/api'; 
import Loading from '../Loading/Loading';

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      </div>
    </div>
  );
};

export default VideoFeed;