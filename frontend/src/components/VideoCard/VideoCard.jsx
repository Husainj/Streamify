import React from 'react';

const VideoCard = ({ video }) => {
  return (
    <div className="md:w-80 m-3 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <img
        className="w-full h-50 object-cover rounded-t-lg"
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        style={{ aspectRatio: '16/9' }} // Maintain a consistent aspect ratio
      />
      <div className="p-2">
        <h4 className="font-bold text-white">{video.title}</h4>
        <p className="text-gray-400">{video.creator}</p>
        <p className="text-gray-400">{video.views} • {video.timestamp}</p>
      </div>
    </div>
  );
};

export default VideoCard;
