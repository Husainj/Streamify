import React from 'react';
import VideoCard from '../VideoCard/VideoCard';
import thumbnail from "../../assets/thumbnail.jpg"

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
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 3,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
        creator: 'Creator 1',
        views: '100K views',
        timestamp: '1 day ago',
      },
      {
        id: 4,
        title: 'Sample Video 1',
        description: 'This is a sample video description.',
        thumbnail: thumbnail,
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
    <div className="flex flex-wrap justify-center md:justify-start p-4 flex-1 bg-gray-900">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      
      ))}
    </div>
  );
};

export default VideoFeed;
