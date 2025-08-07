
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-gray text-white mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-sm font-noto-sans">&copy; {new Date().getFullYear()} Gros-Islet Business Directory. All Rights Reserved.</p>
          <p className="text-xs text-gray-400 mt-2">
            Built with ❤️ for the community of Gros-Islet, St. Lucia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
