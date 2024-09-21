import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '00:00';
  
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
  
    // If duration is more than or equal to 1 hour, show HH:MM:SS
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    // Otherwise, show MM:SS
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };
  
  return (
    <Link to={`/videos/${video._id}`}> 
    <div className="md:w-80 m-3 bg-gray-800 rounded-lg overflow-hidden shadow-lg relative">
      {/* Thumbnail with duration overlay */}
      <div className="relative">
        <img
          className="w-full h-50 object-cover rounded-t-lg"
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          style={{ aspectRatio: '16/9' }} // Maintain a consistent aspect ratio
        />
        {/* Duration overlay */}
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-1.5 py-0.5 rounded">
        {formatDuration(video.duration)}
        </span>
      </div>
      <div className="p-2">
        <h4 className="font-bold text-white">{video.title}</h4>
        <p className="text-gray-400">{video.owner?.username || 'Unknown Creator'}</p>
        <p className="text-gray-400">Views : {video.views}</p>
      </div>
    </div>
    </Link>
  );
};

export default VideoCard;
