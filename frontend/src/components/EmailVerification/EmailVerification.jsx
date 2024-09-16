import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import api from '../../services/api';

const EmailVerification = () => {
  const [status, setStatus] = useState('Verifying...');
  const { token } = useParams();
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        const response = await api.get(`/users/verify-email/${token}`);
        console.log('API verification Response:', response);
        
        if (response.data && response.data.statusCode === 200) {
          setStatus('Email verified successfully!');
          toast.success('Email verified successfully , Please Login Now !!');
          setTimeout(() => navigate('/'), 2500); // Redirect to login after 3 seconds
        } else {
          throw new Error('Unexpected response structure');
        }
      } catch (error) {
        console.error('Verification Error:', error);
        setStatus('Verification failed.');
        if (error.response) {
          toast.error(error.response.data.message || 'Verification failed. Please try again or contact support.');
        } else if (error.request) {
          toast.error('No response received from the server. Please try again later.');
        } else {
          toast.error('An unexpected error occurred. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">{status}</h2>
        <div className="flex justify-center">
          {status === 'Verifying...' ? (
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          ) : status === 'Email verified successfully!' ? (
            <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        {status === 'Email verified successfully!' && (
          <p className="mt-4 text-center text-gray-300">
            Redirecting to login page...
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;