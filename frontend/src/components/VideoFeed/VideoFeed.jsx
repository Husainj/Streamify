import React, { useEffect, useState } from 'react';
import VideoCard from '../VideoCard/VideoCard';
import Sidebar from '../Sidebar/Sidebar';
import api from '../../services/api'; // Use your existing API service

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch videos from the backend
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos/'); // Adjust the endpoint to match your backend
        console.log('Fetched Videos:', response.data.data.videos);
        setVideos(response.data.data.videos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <div className="flex flex-1 bg-gray-900 mt-14 md:mt-16">
        {/* Show the sidebar on larger screens */}
        <div className="md:w-16">
          <Sidebar />
        </div>

        <div className="p-4 md:ml-11 md:mt-0 mt-20 flex flex-wrap justify-center lg:justify-start overflow-y-auto flex-1">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div key={video._id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
                <VideoCard video={video} />
              </div>
            ))
          ) : (
            <p className="text-white">No videos found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
