import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  message: string;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github_url: string;
  live_url: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'messages') {
        const response = await axios.get('/api/messages/');
        setMessages(response.data);
      } else if (activeTab === 'projects') {
        const response = await axios.get('/api/projects/');
        setProjects(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await axios.delete(`/api/messages/${id}/`);
      setMessages((prev) => prev.filter((message) => message.id !== id));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Delete error:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await axios.delete(`/api/projects/${id}/`);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Delete error:', error);
    }
  };

  const tabs = [
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'messages' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Messages
                      </h2>
                      <span className="text-sm text-gray-500">
                        {messages.length} messages
                      </span>
                    </div>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {message.sender_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {message.sender_email}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="mt-2 text-gray-600">{message.message}</p>
                          <p className="mt-2 text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Projects
                      </h2>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                        <Plus className="w-5 h-5" />
                        <span>Add Project</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="relative h-48">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <button className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900">
                              {project.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {project.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {project.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Profile settings coming soon...</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">General settings coming soon...</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 