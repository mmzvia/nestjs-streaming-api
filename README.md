# Nest.js Streaming API

## Description

A simple RESTful API that allows users to upload, stream, and manage personal video files.

## Scripts

```bash
# Project setup.
$ npm install

# Run development server.
$ npm run start

# Run e2e tests.
$ npm run test:e2e
```

## Scenarios

**Registration & Login**

1. Register a new user account.
2. Log in to an existing user account.

**Upload & Stream Videos**

1. Upload a new video file.
2. Stream a video by ID using HTTP range requests.
3. Delete a video.

**Manage Video Metadata**

1. Get all uploaded videos for a user.
2. Get video details by ID.
3. Update video title or description.

## Modules

### Authentication

- User registration.
- User login.

### Videos

- Upload a video file.
- Stream a video via HTTP range requests.
- Get all videos.
- Get a specific video.
- Update video metadata.
- Delete a video.
