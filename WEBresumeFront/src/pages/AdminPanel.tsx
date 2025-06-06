import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Trash2, Plus, X, Home, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ResumeData {
  id?: number;
  user?: number;
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

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      location: "",
      dateOfBirth: "",
      phone: "",
      email: ""
    },
    about: "",
    languages: [],
    skills: [],
    experience: [],
    skillsTable: [],
    videos: [],
    pdfFiles: [],
    projects: [],
    testimonials: []
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchResumeData();
  }, [navigate]);

  const fetchResumeData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/resumes/latest/');
      console.log("Данные резюме с сервера:", response.data);

      if (response.data && response.data.id) {
        const resume = response.data;
        
        const formattedData = formatResumeDataFromBackend(resume);
        setResumeData(formattedData);
        toast.success('Данные резюме успешно загружены');
      } else {
        toast.error('Резюме не найдено. Создайте новое резюме.');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных резюме:', error);
      toast.error('Ошибка при загрузке данных резюме');
    } finally {
      setIsLoading(false);
    }
  };

  const formatResumeDataFromBackend = (resume: any): ResumeData => {
    return {
      id: resume.id,
      user: resume.user,
      personalInfo: {
        name: resume.name || '',
        location: resume.location || '',
        dateOfBirth: resume.date_of_birth || '',
        phone: resume.phone || '',
        email: resume.email || '',
        photo: resume.photo || undefined
      },
      about: resume.about || '',
      languages: Array.isArray(resume.languages) ? resume.languages : [],
      skills: Array.isArray(resume.skills) ? resume.skills : [],
      experience: Array.isArray(resume.experience) ? resume.experience : [],
      skillsTable: Array.isArray(resume.skills_table) ? resume.skills_table : [],
      videos: Array.isArray(resume.video_urls) ? resume.video_urls : [],
      pdfFiles: Array.isArray(resume.pdf_files) ? resume.pdf_files : [],
      projects: Array.isArray(resume.resume_projects) ? resume.resume_projects : [],
      testimonials: Array.isArray(resume.testimonials) ? resume.testimonials : []
    };
  };

  const formatResumeDataForBackend = (data: ResumeData) => {
    return {
      id: data.id,
      user: data.user,
      name: data.personalInfo.name,
      location: data.personalInfo.location,
      date_of_birth: data.personalInfo.dateOfBirth,
      phone: data.personalInfo.phone,
      email: data.personalInfo.email,
      photo: data.personalInfo.photo,
      about: data.about,
      languages: data.languages,
      skills: data.skills,
      skills_table: data.skillsTable,
      experience: data.experience,
      video_urls: data.videos,
      pdf_files: data.pdfFiles,
      resume_projects: data.projects,
      testimonials: data.testimonials
    };
  };

  const saveData = async () => {
    try {
      setIsSaving(true);
      const data = formatResumeDataForBackend(resumeData);
      
      console.log("Отправляем данные на сервер:", data);
      
      let response;
      
      if (resumeData.id) {
        console.log(`Отправляем PUT запрос на /api/resumes/${resumeData.id}/`);
        
        try {
          response = await axios.put(`/api/resumes/${resumeData.id}/`, data, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true
          });
          
          console.log("Успешно получен ответ:", response);
        } catch (err) {
          console.error("Ошибка при отправке PUT запроса:", err);
          throw err;
        }
        
        if (response.data.status === "error") {
          console.error('Ошибка от сервера:', response.data.message);
          toast.error(response.data.message || 'Ошибка при сохранении данных');
          return;
        }
        
        if (response.data.data) {
          const updatedData = formatResumeDataFromBackend(response.data.data);
          setResumeData(updatedData);
        }
        
        toast.success('Резюме успешно обновлено');
        
        await clearCache();
        
        setTimeout(() => {
          fetchResumeData();
        }, 1000);
      } else {
        response = await axios.post('/api/resumes/', data, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        
        if (response.data.status === "error") {
          console.error('Ошибка от сервера:', response.data.message);
          toast.error(response.data.message || 'Ошибка при сохранении данных');
          return;
        }
        
        if (response.data.data) {
          const updatedData = formatResumeDataFromBackend(response.data.data);
          setResumeData(updatedData);
        } else {
          setResumeData(prev => ({
            ...prev,
            id: response.data.id
          }));
        }
        
        toast.success('Новое резюме успешно создано');
        
        await clearCache();
      }
      
      console.log("Ответ сервера:", response.data);
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      
      let errorMessage = 'Ошибка при сохранении данных';
      
      if (axios.isAxiosError(error) && error.response) {
        const serverError = error.response.data;
        console.error('Подробная ошибка от сервера:', serverError);
        
        if (serverError.message) {
          errorMessage = serverError.message;
        } else if (serverError.errors) {
          const firstError = Object.entries(serverError.errors)[0];
          if (firstError) {
            const [field, messages] = firstError;
            errorMessage = `Ошибка в поле "${field}": ${messages}`;
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      setIsClearingCache(true);
      console.log("Отправляем запрос на очистку кеша...");
      
      const response = await axios.post('/api/resumes/clear_cache/', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      console.log("Ответ от сервера при очистке кеша:", response.data);
      
      if (response.data.status === "success") {
        toast.success('Кеш успешно очищен');
      } else {
        toast.error('Не удалось очистить кеш');
      }
    } catch (error) {
      console.error('Ошибка при очистке кеша:', error);
      toast.error('Ошибка при очистке кеша');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const videoUrl = URL.createObjectURL(file);
        setResumeData(prev => ({
          ...prev,
          videos: [...prev.videos, videoUrl]
        }));
      });
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const pdfUrl = URL.createObjectURL(file);
        setResumeData(prev => ({
          ...prev,
          pdfFiles: [...prev.pdfFiles, { name: file.name, url: pdfUrl }]
        }));
      });
    }
  };

  const removeVideo = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const removePDF = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    setResumeData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', level: '' }]
    }));
  };

  const updateLanguage = (index: number, field: 'language' | 'level', value: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addSkillCategory = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: [] }]
    }));
  };

  const updateSkillCategory = (index: number, category: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, category } : skill
      )
    }));
  };

  const updateSkillItems = (index: number, items: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, items: items.split(',').map(item => item.trim()) } : skill
      )
    }));
  };

  const removeSkillCategory = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { period: '', title: '', company: '', description: [] }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { 
          ...exp, 
          [field]: field === 'description' ? value.split('\n').filter(line => line.trim()) : value 
        } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addSkillTable = () => {
    setResumeData(prev => ({
      ...prev,
      skillsTable: [...prev.skillsTable, { skill: '', level: '' }]
    }));
  };

  const updateSkillTable = (index: number, field: 'skill' | 'level', value: string) => {
    setResumeData(prev => ({
      ...prev,
      skillsTable: prev.skillsTable.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkillTable = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skillsTable: prev.skillsTable.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b shadow-sm py-4 px-6 mb-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Панель администратора</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearCache}
              disabled={isClearingCache}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isClearingCache ? 'animate-spin' : ''}`} />
              <span>{isClearingCache ? 'Очистка кеша...' : 'Очистить кеш'}</span>
            </button>
            <button
              onClick={saveData}
              disabled={isSaving}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>На сайт</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Личная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input
                type="text"
                value={resumeData.personalInfo.name}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, name: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Местоположение</label>
              <input
                type="text"
                value={resumeData.personalInfo.location}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, location: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата рождения</label>
              <input
                type="text"
                value={resumeData.personalInfo.dateOfBirth}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input
                type="text"
                value={resumeData.personalInfo.phone}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, phone: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, email: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Обо мне</h2>
          <textarea
            value={resumeData.about}
            onChange={(e) => setResumeData(prev => ({ ...prev, about: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Расскажите о себе..."
          />
        </div>

        {/* Languages */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Языки</h2>
            <button
              onClick={addLanguage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          <div className="space-y-4">
            {resumeData.languages.map((lang, index) => (
              <div key={index} className="flex space-x-4 items-center">
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                  placeholder="Язык"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={lang.level}
                  onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                  placeholder="Уровень"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeLanguage(index)}
                  className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Media Files */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Медиа файлы</h2>
          
          {/* Video Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Видео</h3>
            <div className="mb-4">
              <label className="block">
                <span className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Загрузить видео</span>
                </span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumeData.videos.map((video, index) => (
                <div key={index} className="relative">
                  <video controls className="w-full h-48 object-cover rounded-lg">
                    <source src={video} type="video/mp4" />
                  </video>
                  <button
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">PDF файлы</h3>
            <div className="mb-4">
              <label className="block">
                <span className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors cursor-pointer inline-flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Загрузить PDF</span>
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handlePDFUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-2">
              {resumeData.pdfFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-800">{file.name}</span>
                  <button
                    onClick={() => removePDF(index)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Навыки по категориям</h2>
            <button
              onClick={addSkillCategory}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          <div className="space-y-4">
            {resumeData.skills.map((skill, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-4 items-start mb-4">
                  <input
                    type="text"
                    value={skill.category}
                    onChange={(e) => updateSkillCategory(index, e.target.value)}
                    placeholder="Категория"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeSkillCategory(index)}
                    className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={skill.items.join(', ')}
                  onChange={(e) => updateSkillItems(index, e.target.value)}
                  placeholder="Навыки (через запятую)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Опыт работы</h2>
            <button
              onClick={addExperience}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Опыт работы #{index + 1}</h3>
                  <button
                    onClick={() => removeExperience(index)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateExperience(index, 'period', e.target.value)}
                    placeholder="Период"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Компания"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  placeholder="Должность"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <textarea
                  value={exp.description.join('\n')}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Описание (каждая строка - отдельный пункт)"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Таблица навыков</h2>
            <button
              onClick={addSkillTable}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          <div className="space-y-4">
            {resumeData.skillsTable.map((skill, index) => (
              <div key={index} className="flex space-x-4 items-center">
                <input
                  type="text"
                  value={skill.skill}
                  onChange={(e) => updateSkillTable(index, 'skill', e.target.value)}
                  placeholder="Навык"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={skill.level}
                  onChange={(e) => updateSkillTable(index, 'level', e.target.value)}
                  placeholder="Уровень (например, 8/10)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeSkillTable(index)}
                  className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
