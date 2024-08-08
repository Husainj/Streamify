import React from 'react';
import VideoCard from '../VideoCard/VideoCard';
import thumbnail from "../../assets/thumbnail.jpg"
import thumbnail3 from "../../assets/thumbnail2.jpeg"
import thumbnail4 from "../../assets/thumbnail3.jpeg"
import Sidebar from '../Sidebar/Sidebar';
import thumbnail2 from "../../assets/react.svg"
const VideoFeed = () => {
  const videos = [
    {
      id: 1,
      title: 'Sample Video 1',
      description: 'This is a sample video description.',
      thumbnail: thumbnail,
      creator: 'Creator 1',
      views: '100K views',
      timestamp: '1 day ago',
    },
    {
        id: 2,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail2,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 3,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail3,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 4,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail4,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 5,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 6,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 7,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 8,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 9,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      
    // Add more video objects
  ];

  return (
    <div>
    
      <div className="flex flex-1 bg-gray-900 mt-14 md:mt-16">
        {/* Show the sidebar on larger screens */}
       <div className='md:w-16'>
          <Sidebar />
          </div>

        <div className="p-4 md:ml-11 flex flex-wrap justify-center lg:justify-start overflow-y-auto flex-1">
          {videos.map((video) => (
            <div key={video.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
              <VideoCard video={video} />
            </div>
          ))}   
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
