import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, Github, Linkedin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Profile {
  resume_pdf: string;
}

const Home = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setCurrentSection(event.detail);
    };

    window.addEventListener('changeSection', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('changeSection', handleSectionChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profiles/1/');
        setProfile(response.data);
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const sections = [
    {
      title: 'Personal Info',
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bohdan Sukharuchenko
            </h1>
            <p className="text-xl text-gray-600 mb-6">Full Stack Developer</p>
            <div className="flex justify-center space-x-4">
              <a
                href="#"
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: 'About Me',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <p className="text-gray-600 mb-4">
            I'm a full-stack developer with expertise in modern web technologies.
            I love creating beautiful and functional applications that solve real-world problems.
          </p>
          {profile?.resume_pdf && (
            <a
              href={profile.resume_pdf}
              download
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Resume
            </a>
          )}
        </div>
      ),
    },
    {
      title: 'Skills',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Skills</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['React', 'TypeScript', 'Python', 'Django', 'Node.js', 'PostgreSQL'].map((skill) => (
              <div
                key={skill}
                className="bg-white p-4 rounded-lg shadow-md text-center"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Get in Touch',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            Interested in working together? Feel free to reach out through the contact form.
          </p>
          <a
            href="/contact"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Contact Me
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {sections[currentSection]?.content}
      </div>
    </div>
  );
};

export default Home; 