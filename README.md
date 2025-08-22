# Video Streaming API

A simple RESTful API that allows users to **upload**, **stream**, and **manage personal video files**.  

⚠️ **Disclaimer**: This project is intended as a **learning/demo application** and is **not production-ready**. For production use, significant refactoring, optimization, and security hardening would be required.

## Features

### 🔐 Auth
- User registration  
- User login  

### 🎥 Videos
- Upload video files  
- Stream videos via HTTP range requests  
- Fetch all videos for a user  
- Retrieve details of a specific video  
- Update video metadata (title, description)  
- Delete a video  

## Example Scenarios

### Registration & Login
1. Register a new user account  
2. Log in with an existing account  

### Upload & Stream Videos
1. Upload a video file  
2. Stream a video by ID (using HTTP range requests)  
3. Delete a video  

### Manage Video Metadata
1. Get all uploaded videos for a user  
2. Retrieve video details by ID  
3. Update video title or description  

## Getting Started

```bash
# Install dependencies
npm install

# Run end-to-end tests
$ npm run test:e2e

# Run the development server
$ npm run start
```
