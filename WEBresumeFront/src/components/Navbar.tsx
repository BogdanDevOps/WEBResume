import React, { useState } from 'react';
import { User, Settings, LogOut, LogIn, Home, FileText, Code, Briefcase, Languages, Video, Award, Star, Mail, Download, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { icon: User, label: 'Personal', section: 0 },
    { icon: Award, label: 'About', section: 1 },
    { icon: Code, label: 'Skills', section: 2 },
    { icon: Briefcase, label: 'Experience', section: 3 },
    { icon: Star, label: 'Projects', section: 4 },
    { icon: Award, label: 'Levels', section: 5 },
    { icon: Languages, label: 'Languages', section: 6 },
    { icon: Star, label: 'Testimonials', section: 7 },
    { icon: Mail, label: 'Contact', section: 8 },
    { icon: Download, label: 'Media', section: 9 },
  ];

  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleAdminPanel = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionIndex: number) => {
    window.dispatchEvent(new CustomEvent('changeSection', { detail: sectionIndex }));
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Resume</span>
              <span className="text-xs text-gray-500 hidden sm:block">Bohdan Sukharuchenko</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.section)}
                className="flex items-center space-x-1 px-2 xl:px-3 py-2 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200 group"
                title={item.label}
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs xl:text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Navigation Icons (Tablet) */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {navigationItems.slice(0, 5).map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.section)}
                className="p-2 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200"
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button (Phone) */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Resume</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.section)}
                  className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 