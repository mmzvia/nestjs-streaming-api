# Technical Specification

## Goal

Develop a simple RESTful API server using Nest.js that allows users to upload, stream, and manage personal video files.

## Roadmap

| Task                                                       | Status    |
| ---------------------------------------------------------- | --------- |
| Design project structure                                   | PLANNED   |
| Design database schema                                     | PLANNED   |
| Initialize project (including `.env` and setup scripts)    | PLANNED   |
| Implement auth endpoints                                   | PLANNED   |
| Implement user endpoints                                   | PLANNED   |
| Implement video endpoints                                  | PLANNED   |

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

## Scripts

```bash
# Project setup.
$ npm install

# Run development server.
$ npm run start

# Run e2e tests.
$ npm run test:e2e
```
