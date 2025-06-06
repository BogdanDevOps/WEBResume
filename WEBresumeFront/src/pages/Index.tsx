import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Mail, Phone, MapPin, Calendar, Star, Code, Briefcase, Award, Users, Send, User, X, FileText, Upload, MessageCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import FileUpload from '../components/FileUpload';
import LiveChat from '../components/LiveChat';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ResumeData {
  personalInfo: {
    name: string;
    location: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    photo?: string;
  };
  about: string;
  languages: { language: string; level: string }[];
  skills: { category: string; items: string[] }[];
  experience: {
    period: string;
    title: string;
    company: string;
    description: string[];
  }[];
  skillsTable: { skill: string; level: string }[];
  videos: string[];
  pdfFiles: { name: string; url: string }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    status: string;
  }[];
  testimonials: {
    name: string;
    position: string;
    company: string;
    text: string;
    rating: number;
  }[];
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    name: "Загрузка...",
    location: "📍 Загрузка...",
    dateOfBirth: "📅 Загрузка...",
    phone: "📞 Загрузка...",
    email: "✉️ Загрузка..."
  },
  about: "Загрузка...",
  languages: [],
  skills: [],
  experience: [],
  skillsTable: [],
  videos: [],
  pdfFiles: [],
  projects: [],
  testimonials: []
};

const Index = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sections = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'about', title: 'About Me', icon: Award },
    { id: 'skills', title: 'Skills', icon: Code },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'projects', title: 'Projects', icon: Star },
    { id: 'skillsTable', title: 'Skill Levels', icon: Award },
    { id: 'languages', title: 'Languages', icon: Users },
    { id: 'testimonials', title: 'Testimonials', icon: Star },
    { id: 'contact', title: 'Contact', icon: Mail },
    { id: 'media', title: 'Media', icon: Download }
  ];

  useEffect(() => {
    // Функция для загрузки данных резюме
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        console.log("Загрузка данных резюме...");
        
        // Добавляем случайный параметр к URL, чтобы избежать кэширования браузером
        const timestamp = new Date().getTime();
        
        // Запрос к API бэкенда (используем новый эндпоинт latest)
        const response = await axios.get(`/api/resumes/latest/?t=${timestamp}`);
        console.log("Ответ API:", response.data);
        
        // Если получили прямой объект (не массив)
        if (response.data && response.data.id) {
          formatAndSetResumeData(response.data);
        } else {
          // Запасной вариант - получаем список всех резюме
          console.log("Переключаемся на запасной API-запрос...");
          const listResponse = await axios.get(`/api/resumes/?t=${timestamp}`);
          console.log("Ответ запасного API:", listResponse.data);
          
          // Проверка формата данных
          if (listResponse.data && Array.isArray(listResponse.data) && listResponse.data.length > 0) {
            formatAndSetResumeData(listResponse.data[0]);
          } else if (listResponse.data && listResponse.data.results && Array.isArray(listResponse.data.results) && listResponse.data.results.length > 0) {
            formatAndSetResumeData(listResponse.data.results[0]);
          } else {
            toast.error("Резюме не найдено. Создайте его в админ-панели.");
            console.error("Резюме не найдено в API");
            setLoading(false);
          }
        }
        
        // Убираем индикатор обновления, если он был включен
        if (refreshing) {
          setRefreshing(false);
          toast.success("Данные успешно обновлены!");
        }
        
      } catch (error) {
        console.error("Ошибка при загрузке резюме:", error);
        toast.error("Не удалось загрузить данные резюме. Проверьте консоль для подробностей.");
        setLoading(false);
        setRefreshing(false);
      }
    };

    // Функция для форматирования и установки данных резюме
    const formatAndSetResumeData = (resume) => {
      try {
        console.log("Форматирование данных резюме:", resume);
        
        const formattedData: ResumeData = {
          personalInfo: {
            name: resume.name || "Имя не указано",
            location: resume.location || "📍 Местоположение не указано",
            dateOfBirth: resume.date_of_birth || "📅 Дата рождения не указана",
            phone: resume.phone || "📞 Телефон не указан",
            email: resume.email || "✉️ Email не указан",
            photo: resume.photo || undefined
          },
          about: resume.about || "Информация о себе отсутствует",
          languages: Array.isArray(resume.languages) ? resume.languages : [],
          skills: Array.isArray(resume.skills) ? resume.skills : [],
          experience: Array.isArray(resume.experience) ? resume.experience : [],
          skillsTable: Array.isArray(resume.skills_table) ? resume.skills_table : [],
          videos: Array.isArray(resume.video_urls) ? resume.video_urls : [],
          pdfFiles: Array.isArray(resume.pdf_files) ? resume.pdf_files : [],
          projects: Array.isArray(resume.resume_projects) ? resume.resume_projects : [],
          testimonials: Array.isArray(resume.testimonials) ? resume.testimonials : []
        };
        
        console.log("Отформатированные данные резюме:", formattedData);
        setResumeData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при форматировании данных резюме:", err);
        toast.error("Ошибка при обработке данных резюме");
        setLoading(false);
      }
    };

    // Загрузка данных при монтировании компонента
    fetchResumeData();

    // Настройка периодического обновления данных (каждые 5 секунд)
    const interval = setInterval(fetchResumeData, 5000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, [refreshing]);

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setCurrentSection(event.detail);
    };

    window.addEventListener('changeSection', handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('changeSection', handleSectionChange as EventListener);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    const horizontalDistance = touchStart.x - touchEnd.x;
    const verticalDistance = touchStart.y - touchEnd.y;

    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance) && Math.abs(horizontalDistance) > 50) {
      if (horizontalDistance > 0) {
        if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
      } else {
        if (currentSection > 0) setCurrentSection(currentSection - 1);
      }
    }
  };

  const handleFileUpload = (file: File, type: 'photo' | 'pdf') => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post(`/api/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      if (type === 'photo') {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            photo: response.data.url
          }
        }));
      } else {
        setResumeData(prev => ({
          ...prev,
          pdfFiles: [...prev.pdfFiles, {
            name: file.name,
            url: response.data.url
          }]
        }));
      }
      setShowUploadModal(false);
    })
    .catch(error => {
      console.error('Error uploading file:', error);
    });
  };

  const removePhoto = () => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        photo: undefined
      }
    }));
  };

  const removePDF = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index)
    }));
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  const downloadPDF = (file: { name: string; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading toast
    toast.loading('Отправка сообщения...', { id: 'message-toast' });
    
    // Send message to backend API using simple_handler endpoint
    fetch('http://localhost:8000/send-message/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_name: contactForm.name,
        sender_email: contactForm.email,
        message: contactForm.message
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || 'Не удалось отправить сообщение');
        });
      }
      return res.json();
    })
    .then(data => {
      // Success notification
      toast.success(data.message || 'Сообщение успешно отправлено!', { id: 'message-toast' });
      
      // Clear form after successful submission
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
    })
    .catch(err => {
      // Error notification
      toast.error(`Ошибка: ${err.message}`, { id: 'message-toast' });
      console.error('Ошибка при отправке сообщения:', err);
    });
  };

  const getSkillLevel = (level: string) => {
    return parseInt(level) || 0;
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const renderSection = () => {
    const section = sections[currentSection];
    
    switch (section.id) {
      case 'personal':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src="/meinPhoto.jpg" 
                    alt="Profile" 
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-lg mx-auto border-4 border-white"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 mt-4">{resumeData.personalInfo.name}</h2>
                <p className="text-lg sm:text-xl text-blue-600 font-semibold mb-4 sm:mb-6">Full Stack Developer & DevOps Engineer</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-base sm:text-lg text-gray-600">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Kamianske, Ukraine</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">December 27, 1990</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">+38 097 709 3880</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base break-all">bohdan.sukharuchenko@example.com</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl">
                <p className="text-center text-gray-700 font-medium text-sm sm:text-base">
                  🚀 Available for new opportunities • 💼 Open to relocation • 🌟 Remote work preferred
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                About Me
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6">{resumeData.about}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">9+</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Years Experience</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">50+</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Projects Completed</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">5</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Team Members Led</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                Skills & Technologies
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {resumeData.skills.map((skillGroup, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 sm:mr-3"></div>
                      {skillGroup.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, idx) => (
                        <span key={idx} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:shadow-md transition-all duration-200 cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Production' ? 'bg-green-100 text-green-800' :
                          project.status === 'Active Development' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'skillsTable':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                Skill Proficiency
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {resumeData.skillsTable.map((skill, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-lg border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-800 font-medium text-sm sm:text-base">{skill.skill}</span>
                      <span className="text-blue-600 font-semibold text-sm sm:text-base">{skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getSkillLevel(skill.level)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                What Colleagues Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumeData.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-gray-700 italic">"{testimonial.text}"</p>
                      <div className="border-t pt-4">
                        <p className="font-semibold text-gray-800">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.position}</p>
                        <p className="text-sm text-blue-600">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                  Let's Work Together
                </h2>
                <button
                  onClick={() => setShowLiveChat(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg animate-pulse"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Live Chat</span>
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-semibold">Available for Live Chat</span>
                </div>
                <p className="text-green-600 text-sm">
                  Click "Live Chat" to start an instant conversation with me! Perfect for quick questions about projects, availability, or technical discussions.
                </p>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Get In Touch</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <a 
                          href="https://github.com/BogdanDevOps" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base break-all transition-colors"
                        >
                          github.com/BogdanDevOps
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <span 
                          className="text-gray-700 text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText('+38 097 709 3880');
                            toast.success('Phone number copied to clipboard!');
                          }}
                          title="Click to copy"
                        >
                          +38 097 709 3880
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <a 
                          href="https://maps.app.goo.gl/RYxwi8ccJQSWBFsm8" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-blue-600 text-sm sm:text-base transition-colors"
                        >
                          Kamianske, Ukraine
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <a 
                          href="https://t.me/Bogdan_LegacyForgeSolutions" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-blue-600 text-sm sm:text-base transition-colors"
                        >
                          @Bogdan_LegacyForgeSolutions
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Available For</h3>
                    <ul className="space-y-1 sm:space-y-2 text-gray-700">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">Full-time positions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">Contract work</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">Remote opportunities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">Technical consultations</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      
      case 'experience':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                Work Experience
              </h2>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{exp.period}</h3>
                      <h4 className="text-xl font-bold text-blue-600 mt-2">{exp.title}</h4>
                      {exp.company && <p className="text-gray-600 italic">{exp.company}</p>}
                    </div>
                    <ul className="space-y-2">
                      {exp.description.map((desc, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'languages':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                Languages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumeData.languages.map((lang, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-gray-800">{lang.language}</h3>
                    <p className="text-gray-600 mt-2">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'media':
        return (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                  <Download className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                  Media Files
                </h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </button>
              </div>
              
              {resumeData.videos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700">Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.videos.map((video, index) => (
                      <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30">
                        <video controls className="w-full h-48 object-cover rounded-lg">
                          <source src={video} type="video/mp4" />
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {resumeData.pdfFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-700">PDF Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.pdfFiles.map((file, index) => (
                      <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/30 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-red-500" />
                          <span className="text-gray-800 font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadPDF(file)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md text-sm"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => removePDF(index)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {resumeData.videos.length === 0 && resumeData.pdfFiles.length === 0 && (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No media files uploaded yet</p>
                  <p className="text-gray-400 mt-2">Click "Upload Files" to add photos and PDFs</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Функция для принудительного обновления данных
  const handleManualRefresh = () => {
    setRefreshing(true);
    toast.loading("Обновление данных...", { id: 'refresh-toast' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <Navigation />
      
      {/* Кнопка ручного обновления данных */}
      <button
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="fixed top-24 right-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-xl border border-blue-300 hover:bg-blue-50 transition-all"
        title="Обновить данные"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-blue-600 ${refreshing ? 'animate-spin' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Upload Photo</h4>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  accept="image/*"
                  type="photo"
                  label="Choose photo"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Upload PDF</h4>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  accept=".pdf"
                  type="pdf"
                  label="Choose PDF file"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Live Chat */}
      <LiveChat 
        isOpen={showLiveChat} 
        onClose={() => setShowLiveChat(false)} 
      />
      
      <div className="flex h-screen">
        <button
          onClick={prevSection}
          className="hidden sm:block fixed left-2 sm:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 sm:p-4 rounded-full shadow-xl border border-white/20 hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
        </button>
        
        <button
          onClick={nextSection}
          className="hidden sm:block fixed right-2 sm:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-2 sm:p-4 rounded-full shadow-xl border border-white/20 hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
        </button>
        
        <div 
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSection * 100}%)` }}
          >
            {sections.map((section, index) => (
              <div key={section.id} className="w-full flex-shrink-0 p-2 sm:p-4 lg:p-8 pt-24 sm:pt-28 lg:pt-36 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                  {renderSection()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-gray-300 shadow-xl">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full transition-all duration-300 border-2 relative group ${
              index === currentSection 
                ? 'bg-blue-500 border-blue-500 scale-125 shadow-lg shadow-blue-500/50' 
                : 'bg-gray-300 border-gray-400 hover:bg-blue-400 hover:border-blue-500 hover:scale-110 hover:shadow-md'
            }`}
          >
            {/* Tooltip with section name */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {section.title}
            </div>
            {/* Active indicator pulse */}
            {index === currentSection && (
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
            )}
          </button>
        ))}
      </div>

      <div className="sm:hidden fixed bottom-16 left-4 right-4 flex justify-between z-20">
        <button
          onClick={prevSection}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl border border-white/20"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={nextSection}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl border border-white/20"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Index;
