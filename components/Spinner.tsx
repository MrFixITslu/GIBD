
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tropical-green"></div>
    </div>
  );
};

export default Spinner;
