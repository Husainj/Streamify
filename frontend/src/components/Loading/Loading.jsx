// Loading.js
import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
