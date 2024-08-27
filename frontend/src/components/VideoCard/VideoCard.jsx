import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
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
          { (video.duration?.toFixed(2)) }
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
