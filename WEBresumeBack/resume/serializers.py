from rest_framework import serializers
from .models import Profile, Project, Message, Resume
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'user', 'telegram_username', 'resume_pdf', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class ResumeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    languages = serializers.JSONField(required=False)
    skills = serializers.JSONField(required=False)
    skills_table = serializers.JSONField(required=False)
    experience = serializers.JSONField(required=False)
    resume_projects = serializers.JSONField(required=False)
    testimonials = serializers.JSONField(required=False)
    video_urls = serializers.JSONField(required=False)
    pdf_files = serializers.JSONField(required=False)
    
    class Meta:
        model = Resume
        fields = ('id', 'user', 'name', 'location', 'date_of_birth', 'phone', 'email', 
                  'photo', 'about', 'languages', 'skills', 'skills_table', 'experience', 
                  'resume_projects', 'testimonials', 'video_urls', 'pdf_files', 
                  'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'image', 'video_url', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'sender_name', 'sender_email', 'message', 'created_at', 'is_read')
        read_only_fields = ('created_at', 'is_read') 