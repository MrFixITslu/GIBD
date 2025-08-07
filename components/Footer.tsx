
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span className="text-xl font-bold">Gros-Islet</span>
            </div>
            <p className="text-neutral-300 leading-relaxed max-w-md">
              Connecting visitors and locals with the best businesses in Gros-Islet, St. Lucia. 
              Discover authentic experiences and support our vibrant community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HOME} className="text-neutral-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTES.DIRECTORY} className="text-neutral-300 hover:text-white transition-colors">
                  Directory
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EVENTS} className="text-neutral-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NEWS} className="text-neutral-300 hover:text-white transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-neutral-300">
                <span className="block text-sm">Email</span>
                <a href="mailto:info@grosislet.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                  info@grosislet.com
                </a>
              </li>
              <li className="text-neutral-300">
                <span className="block text-sm">Phone</span>
                <a href="tel:+1758-123-4567" className="text-primary-400 hover:text-primary-300 transition-colors">
                  +1 (758) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} Gros-Islet Business Directory. All Rights Reserved.
            </p>
            <p className="text-sm text-neutral-400 mt-2 md:mt-0">
              Built with ❤️ for the community of Gros-Islet, St. Lucia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
