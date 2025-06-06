from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
import json
from .models import Profile, Project, Message, Resume

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'telegram_username', 'created_at', 'updated_at')
    search_fields = ('user__username', 'telegram_username')

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name', 'email', 'about')
    readonly_fields = ('display_languages', 'display_skills', 'display_skills_table', 
                       'display_experience', 'display_resume_projects', 'display_testimonials')
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'name', 'location', 'date_of_birth', 'phone', 'email', 'photo')
        }),
        ('Описание', {
            'fields': ('about',)
        }),
        ('Языки', {
            'fields': ('languages', 'display_languages')
        }),
        ('Навыки', {
            'fields': ('skills', 'display_skills', 'skills_table', 'display_skills_table')
        }),
        ('Опыт работы', {
            'fields': ('experience', 'display_experience')
        }),
        ('Проекты резюме', {
            'fields': ('resume_projects', 'display_resume_projects')
        }),
        ('Отзывы', {
            'fields': ('testimonials', 'display_testimonials')
        }),
        ('Дополнительные файлы', {
            'fields': ('video_urls', 'pdf_files')
        }),
    )

    def display_languages(self, obj):
        if not obj.languages:
            return "-"
        html = '<table class="table"><thead><tr><th>Язык</th><th>Уровень</th></tr></thead><tbody>'
        for lang in obj.languages:
            html += f'<tr><td>{lang.get("language", "")}</td><td>{lang.get("level", "")}</td></tr>'
        html += '</tbody></table>'
        return mark_safe(html)
    display_languages.short_description = "Языки (отображение)"

    def display_skills(self, obj):
        if not obj.skills:
            return "-"
        html = '<table class="table"><thead><tr><th>Категория</th><th>Навыки</th></tr></thead><tbody>'
        for skill in obj.skills:
            items = ", ".join(skill.get("items", []))
            html += f'<tr><td><strong>{skill.get("category", "")}</strong></td><td>{items}</td></tr>'
        html += '</tbody></table>'
        return mark_safe(html)
    display_skills.short_description = "Навыки (отображение)"
    
    def display_skills_table(self, obj):
        if not obj.skills_table:
            return "-"
        html = '<table class="table"><thead><tr><th>Навык</th><th>Уровень</th></tr></thead><tbody>'
        for skill in obj.skills_table:
            html += f'<tr><td>{skill.get("skill", "")}</td><td>{skill.get("level", "")}</td></tr>'
        html += '</tbody></table>'
        return mark_safe(html)
    display_skills_table.short_description = "Таблица навыков (отображение)"
    
    def display_experience(self, obj):
        if not obj.experience:
            return "-"
        html = '<div class="experience-list">'
        for exp in obj.experience:
            html += f'<div class="experience-item" style="margin-bottom: 20px;">'
            html += f'<h3>{exp.get("title", "")}</h3>'
            html += f'<p><strong>Период:</strong> {exp.get("period", "")}</p>'
            html += f'<p><strong>Компания:</strong> {exp.get("company", "")}</p>'
            html += '<p><strong>Описание:</strong></p><ul>'
            for item in exp.get("description", []):
                html += f'<li>{item}</li>'
            html += '</ul></div>'
        html += '</div>'
        return mark_safe(html)
    display_experience.short_description = "Опыт работы (отображение)"
    
    def display_resume_projects(self, obj):
        if not obj.resume_projects:
            return "-"
        html = '<div class="projects-list">'
        for project in obj.resume_projects:
            html += f'<div class="project-item" style="margin-bottom: 20px;">'
            html += f'<h3>{project.get("name", "")}</h3>'
            html += f'<p><strong>Описание:</strong> {project.get("description", "")}</p>'
            html += f'<p><strong>Статус:</strong> {project.get("status", "")}</p>'
            html += '<p><strong>Технологии:</strong> ' + ', '.join(project.get("technologies", [])) + '</p>'
            html += '</div>'
        html += '</div>'
        return mark_safe(html)
    display_resume_projects.short_description = "Проекты резюме (отображение)"
    
    def display_testimonials(self, obj):
        if not obj.testimonials:
            return "-"
        html = '<div class="testimonials-list">'
        for testimonial in obj.testimonials:
            stars = '★' * int(testimonial.get("rating", 0)) + '☆' * (5 - int(testimonial.get("rating", 0)))
            html += f'<div class="testimonial-item" style="margin-bottom: 20px;">'
            html += f'<blockquote>"{testimonial.get("text", "")}"</blockquote>'
            html += f'<p><strong>{testimonial.get("name", "")}</strong>, {testimonial.get("position", "")}'
            if testimonial.get("company"):
                html += f', {testimonial.get("company", "")}'
            html += '</p>'
            html += f'<p style="color: gold;">{stars}</p>'
            html += '</div>'
        html += '</div>'
        return mark_safe(html)
    display_testimonials.short_description = "Отзывы (отображение)"

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    search_fields = ('title', 'description')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'sender_email', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender_name', 'sender_email', 'message')
