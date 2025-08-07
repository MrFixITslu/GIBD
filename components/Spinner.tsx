
import React from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <LoadingSpinner size="xl" variant="primary" />
    </div>
  );
};

export default Spinner;
