# 🌟 Qurious - Connect Curious Minds

> A modern, full-stack discussion platform connecting curious minds through meaningful conversations on health, education, and social topics with AI-powered features and expert insights.

[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen.svg)](https://www.mongodb.com/)
[![React Native](https://img.shields.io/badge/React%20Native-v0.81+-blue.svg)](https://reactnative.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [WebSocket Events](#websocket-events)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Qurious** is a comprehensive discussion platform designed to foster meaningful conversations around important topics. The application combines traditional social media features with AI-powered moderation, verification systems, and real-time messaging capabilities.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- ✅ **User Verification** - Expert verification system with document validation
- 💬 **Real-time Messaging** - WebSocket-powered instant messaging
- 📝 **Discussion Threads** - Nested comment system for organized discussions
- 🤖 **Smart Moderation** - Content moderation and reporting system
- 👥 **User Network** - Follow system and user discovery
- 🎨 **Cross-Platform** - React Native for iOS, Android, and Web

---

## ✨ Features

### 👤 User Management

- ✅ User Registration with profile image upload
- ✅ Email/Username login with JWT authentication
- ✅ Profile management and editing
- ✅ Password change functionality
- ✅ Expert verification with document upload
- ✅ User discovery and search
- ✅ Follow/Unfollow system

### 📝 Content & Discussions

- ✅ Create, edit, and delete posts
- ✅ Multi-level nested comments
- ✅ Vote system (upvote/downvote)
- ✅ Post and comment reports
- ✅ Rich text content support
- ✅ Image attachments via Cloudinary

### 💬 Real-time Features

- ✅ Instant messaging between users
- ✅ WebSocket-powered real-time updates
- ✅ Message history persistence

### 🛡️ Admin & Moderation

- ✅ Admin dashboard
- ✅ Content moderation tools
- ✅ User verification management
- ✅ Report handling system

### 🔒 Security

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ CORS enabled
- ✅ Environment variable protection
- ✅ Request validation

---

## 🛠 Tech Stack

### Backend

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5.2.1)
- **Database:** MongoDB with Mongoose ODM (v9.3.2)
- **Authentication:** JWT (jsonwebtoken v9.0.3)
- **Security:** bcryptjs (v3.0.3)
- **Real-time:** Socket.IO (v4.8.3)
- **File Upload:** Multer (v2.1.1) + Cloudinary
- **CORS:** Express CORS (v2.8.6)
- **Environment:** dotenv (v17.4.2)
- **Dev Tool:** Nodemon (v3.1.14)

### Frontend

- **Framework:** React Native (v0.81.5)
- **Runtime:** Expo (v54.0.33)
- **HTTP Client:** Axios (v1.16.1)
- **Navigation:** React Navigation (v7.2.2)
  - Stack Navigation
  - Bottom Tab Navigation
  - Drawer Navigation
- **UI Components:** Expo Vector Icons
- **State Management:** Async Storage
- **Animations:** React Native Reanimated (v4.1.1)

---

## 🏗 Architecture

### System Architecture Diagram
