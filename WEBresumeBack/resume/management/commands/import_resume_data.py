import os
import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from resume.models import Resume

class Command(BaseCommand):
    help = 'Импортирует существующие данные резюме из JSON файла или использует стандартные значения'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            help='Путь к JSON файлу с данными резюме',
            required=False
        )

    def handle(self, *args, **kwargs):
        file_path = kwargs.get('file')
        
        # Проверяем, существует ли уже резюме в базе данных
        if Resume.objects.exists():
            self.stdout.write(self.style.WARNING('Резюме уже существует в базе данных. Пропускаем импорт.'))
            return
        
        # Получаем или создаем пользователя
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            user.set_password('admin')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Создан пользователь admin с паролем admin'))
        
        # Загружаем данные из файла, если он указан
        if file_path and os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                resume_data = json.load(f)
                self.stdout.write(self.style.SUCCESS(f'Данные загружены из файла {file_path}'))
        else:
            # Используем стандартные данные
            resume_data = {
                "name": "Sukharuchenko Bohdan Anatoliiovych",
                "location": "📍 Kamianske, Dnipropetrovsk region, Ukraine",
                "date_of_birth": "📅 Date of Birth: December 27, 1990",
                "phone": "📞 Phone: +38 097 709 3880",
                "email": "bohdan.sukharuchenko@example.com",
                "about": "Responsible, punctual, communicative, and a fast learner. I'm a perfectionist with strong logical thinking skills. I easily connect with people and enjoy teamwork. I'm open to learning new technologies and enthusiastic about participating in innovative and meaningful projects. I value respectful communication, a healthy team atmosphere, and appreciation for a job well done.",
                "languages": [
                    {"language": "Ukrainian", "level": "Native"},
                    {"language": "English", "level": "Intermediate (needs practice)"}
                ],
                "skills": [
                    {"category": "Programming", "items": ["Java", "Python", "PHP", "C++", "Bash"]},
                    {"category": "Frontend", "items": ["JavaScript", "CSS", "HTML", "React"]},
                    {"category": "Databases", "items": ["PostgreSQL", "MySQL"]},
                    {"category": "Systems", "items": ["UNIX (Debian-based)", "Networking", "Virtual Machines"]},
                    {"category": "DevOps", "items": ["Docker", "Kubernetes", "Proxmox", "Cloud Storage", "VPN"]},
                    {"category": "Other", "items": ["Android Development", "IP Telephony", "Video Surveillance", "AI Integration"]},
                    {"category": "Leadership", "items": ["Team Lead", "Mentorship", "Project Management"]}
                ],
                "skills_table": [
                    {"skill": "Java", "level": "8/10"},
                    {"skill": "Python", "level": "7/10"},
                    {"skill": "Bash", "level": "9/10"},
                    {"skill": "PHP", "level": "6/10"},
                    {"skill": "C++", "level": "5/10"},
                    {"skill": "Databases", "level": "8/10"},
                    {"skill": "Frontend (JS, CSS, HTML, React)", "level": "7/10"},
                    {"skill": "UNIX (Debian-based systems)", "level": "9/10"},
                    {"skill": "Networking", "level": "6/10"},
                    {"skill": "Virtualization (Proxmox, etc.)", "level": "6/10"},
                    {"skill": "IP Telephony", "level": "7/10"}
                ],
                "experience": [
                    {
                        "period": "🔧 2024 – Present",
                        "title": "System Administrator / DevOps Engineer / Full Stack Developer / Project Manager",
                        "company": "[Company, Kamianske]",
                        "description": [
                            "Server administration (Hetzner, AWS, local)",
                            "Website development and process automation",
                            "Docker, Kubernetes, Proxmox",
                            "Development on Raspberry Pi (MDVR system)",
                            '"Media Control" project for passenger transport monitoring',
                            "IP telephony, video surveillance",
                            "Team lead and mentoring (5 developers)",
                            "Full-cycle development (Java, Python, C++, PHP, JS, React, Bash, YAML)",
                            "AI integration and model training",
                            "VPN configuration and technical support"
                        ]
                    },
                    {
                        "period": "🧩 2023 – 2024",
                        "title": "Database System Administrator, Technical Support",
                        "company": "[Company, Kamianske]",
                        "description": [
                            "Server management (Hetzner, AWS, local)",
                            "Process automation and cloud storage",
                            "Docker, Kubernetes, Proxmox",
                            "UNIX-based system administration",
                            "VPN setup and support"
                        ]
                    },
                    {
                        "period": "💻 2022 – 2023",
                        "title": "System Administrator (RRO + IT Support)",
                        "company": "[Company, Kamianske]",
                        "description": [
                            "Work with RRO fiscal systems and databases",
                            "General technical support and troubleshooting"
                        ]
                    },
                    {
                        "period": "🌐 2018 – 2022",
                        "title": "Freelancer / UpWork – Java Developer",
                        "company": "",
                        "description": [
                            "Backend development for websites",
                            "Mobile application development",
                            "Database design and integration"
                        ]
                    },
                    {
                        "period": "🏭 2015 – 2017",
                        "title": "Metallurgical Plant (Access Control Project)",
                        "company": "",
                        "description": [
                            "Junior Java Developer (2 years)",
                            "Android Developer (1 year)",
                            "JavaFX full-stack development",
                            "Mobile apps and database support",
                            "Technical maintenance"
                        ]
                    }
                ],
                "resume_projects": [
                    {
                        "name": "Media Control System",
                        "description": "Comprehensive passenger transport monitoring system with real-time tracking and analytics",
                        "technologies": ["Java", "Python", "Docker", "PostgreSQL", "React"],
                        "status": "Production"
                    },
                    {
                        "name": "MDVR System",
                        "description": "Mobile Digital Video Recorder system for Raspberry Pi with cloud synchronization",
                        "technologies": ["C++", "Python", "Raspberry Pi", "Cloud Storage"],
                        "status": "Active Development"
                    },
                    {
                        "name": "Access Control Platform",
                        "description": "Enterprise access control system with mobile integration and real-time monitoring",
                        "technologies": ["JavaFX", "Android", "MySQL", "Mobile Apps"],
                        "status": "Completed"
                    }
                ],
                "testimonials": [
                    {
                        "name": "Alex Johnson",
                        "position": "CTO",
                        "company": "Tech Solutions Inc.",
                        "text": "Bohdan is an exceptional developer with strong leadership skills. His ability to handle complex projects and mentor team members is outstanding.",
                        "rating": 5
                    },
                    {
                        "name": "Maria Rodriguez",
                        "position": "Project Manager",
                        "company": "Innovation Labs",
                        "text": "Working with Bohdan was a pleasure. He consistently delivered high-quality solutions and was always ready to tackle new challenges.",
                        "rating": 5
                    },
                    {
                        "name": "David Chen",
                        "position": "Senior Developer",
                        "company": "CloudTech",
                        "text": "Bohdan's expertise in DevOps and system administration is impressive. He transformed our infrastructure and improved our deployment processes significantly.",
                        "rating": 5
                    }
                ]
            }
            self.stdout.write(self.style.SUCCESS('Используются стандартные данные резюме'))
        
        # Создаем запись в базе данных
        resume = Resume.objects.create(
            user=user,
            name=resume_data.get('name', ''),
            location=resume_data.get('location', ''),
            date_of_birth=resume_data.get('date_of_birth', ''),
            phone=resume_data.get('phone', ''),
            email=resume_data.get('email', ''),
            about=resume_data.get('about', ''),
            languages=resume_data.get('languages', []),
            skills=resume_data.get('skills', []),
            skills_table=resume_data.get('skills_table', []),
            experience=resume_data.get('experience', []),
            resume_projects=resume_data.get('resume_projects', []),
            testimonials=resume_data.get('testimonials', []),
            video_urls=resume_data.get('video_urls', []),
            pdf_files=resume_data.get('pdf_files', [])
        )
        
        self.stdout.write(self.style.SUCCESS(f'Успешно создано резюме для {resume.name}')) 