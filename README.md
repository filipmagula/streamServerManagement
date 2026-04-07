# Stream Server Management

Manage RTSP/WebRTC streams from video files.
The system allows users to upload videos, schedule streams, and monitor stream status through a web-based dashboard.

## Architecture

The project consists of the following services:

- **MediaMTX**: A high-performance media server that handles RTSP, WebRTC, and HLS streaming.
- **Eclipse Mosquitto**: An MQTT broker used for real-time communication between the backend and frontend.
- **Backend**: A Node.js application built with TypeScript that manages video files, schedules streams, and controls FFmpeg instances for streaming.
- **Frontend**: A Vue 3 application that provides a dashboard for stream management, video library, and MQTT console.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd streamServerManagement
    ```

2. **Start the services**:

    ```bash
    docker-compose up -d --build
    ```

3. **Access the application**:
    - Frontend: `http://localhost:8080`
    - Backend API: `http://localhost:3000`
    - MediaMTX API: `http://localhost:9997`

## Project Structure

- `backend/`: Node.js/TypeScript backend service.
- `frontend/`: Vue 3/TypeScript frontend service.
- `config/`: Configuration files for MediaMTX and Mosquitto.
- `videos/`: Local storage for uploaded video files.
- `data/`: SQLite database and persistence.

## Backlog

- [ ] Controls on dashboard stream cards (play, pause, stop, edit stream)
- [ ] Add option to set RTSP stream with credentials
- [ ] Set scheduled streams from the "add stream" modal
- [ ] Add option to stream: number of loops
- [ ] Add option to stream: restart after reboot
