# Technical Specification

## Goal

Develop a simple RESTful API server using Nest.js that allows users to upload, stream, and manage personal video files.

## Roadmap

| Task                                                       | Status    |
| ---------------------------------------------------------- | --------- |
| Design project structure                                   | DONE      |
| Design database schema                                     | DONE      |
| Init config files                                          | DONE      |
| Add auth endpoints                                         | DONE      |
| Add video endpoints                                        | PLANNED   |

## Use Cases

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

## Project Modules

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

## Database Schema

### User

| Field      | Type                                        | Description             |
| ---------- | ------------------------------------------- | ----------------------- |
| id         | INTEGER PRIMARY KEY AUTOINCREMENT           | -                       |
| username   | VARCHAR UNIQUE                              | -                       |
| password   | VARCHAR                                     | Hashed password         |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL | -                       |

### Video

| Field           | Type                                           | Description                   |
| --------------- | ---------------------------------------------- | ----------------------------- |
| id              | INTEGER PRIMARY KEY AUTOINCREMENT              | -                             |
| uploader_id     | INTEGER REFERENCES User(id) NOT NULL           | Uploader of the video         |
| title           | VARCHAR NOT NULL                               | Video title                   |
| description     | TEXT                                           | Video description             |
| file_path       | TEXT NOT NULL                                  | Path to video file on disk    |
| mime_type       | VARCHAR NOT NULL                               | MIME type of uploaded video   |
| created_at      | DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL    | -                             |
| updated_at      | DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL    | -                             |

## Scripts

```bash
# Project setup.
$ npm install

# Run development server.
$ npm run start

# Run e2e tests.
$ npm run test:e2e
```
