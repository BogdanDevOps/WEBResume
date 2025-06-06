from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Profile, Project, Message
from django.core.files.uploadedfile import SimpleUploadedFile
import os

class ProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            telegram_username='@testuser'
        )

    def test_profile_creation(self):
        self.assertEqual(self.profile.user.username, 'testuser')
        self.assertEqual(self.profile.telegram_username, '@testuser')

class ProjectModelTest(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title='Test Project',
            description='Test Description',
            video_url='https://example.com/video'
        )

    def test_project_creation(self):
        self.assertEqual(self.project.title, 'Test Project')
        self.assertEqual(self.project.description, 'Test Description')
        self.assertEqual(self.project.video_url, 'https://example.com/video')

class MessageModelTest(TestCase):
    def setUp(self):
        self.message = Message.objects.create(
            sender_name='Test Sender',
            sender_email='test@example.com',
            message='Test Message'
        )

    def test_message_creation(self):
        self.assertEqual(self.message.sender_name, 'Test Sender')
        self.assertEqual(self.message.sender_email, 'test@example.com')
        self.assertEqual(self.message.message, 'Test Message')
        self.assertFalse(self.message.is_read)

class APITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            is_staff=True
        )
        self.client.force_authenticate(user=self.user)
        self.profile = Profile.objects.create(
            user=self.user,
            telegram_username='@testuser'
        )

    def test_get_projects(self):
        response = self.client.get('/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_message(self):
        data = {
            'sender_name': 'Test Sender',
            'sender_email': 'test@example.com',
            'message': 'Test Message'
        }
        response = self.client.post('/messages/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_mark_message_as_read(self):
        message = Message.objects.create(
            sender_name='Test Sender',
            sender_email='test@example.com',
            message='Test Message'
        )
        response = self.client.post(f'/messages/{message.id}/mark_as_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message.refresh_from_db()
        self.assertTrue(message.is_read)
