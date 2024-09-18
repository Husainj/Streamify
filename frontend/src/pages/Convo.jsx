import React from 'react';

function Convo() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-900'>
      <div className='bg-black p-8 rounded-lg shadow-lg text-center m-5'>
        <h1 className='text-3xl font-bold text-white mb-4'>
          Convo Coming Soon!
        </h1>
        <p className='text-gray-500 text-lg mb-6'>
          Till then, follow me on LinkedIn to get regular updates.
        </p>
        <a 
          href='https://www.linkedin.com/in/husain-jhalodwala' 
          target='_blank' 
          rel='noopener noreferrer'
          className='inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition duration-300'
        >
          Follow on LinkedIn
        </a>
      </div>
    </div>
  );
}

export default Convo;
