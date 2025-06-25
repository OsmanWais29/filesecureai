
import React from 'react';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  // Redirect to trustee dashboard as the main homepage
  return <Navigate to="/trustee/dashboard" replace />;
};

export default HomePage;
