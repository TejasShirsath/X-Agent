# X-Agent

A Flutter-based AI agent application that can connect to any MCP (Model Context Protocol) server. Once connected, it can use the tools available on that server to complete different tasks. It's like giving the AI access to a set of tools so it can actually do things — not just give answers.

## Overview

X-Agent is a cross-platform application that works as an interface between users and AI models through the Model Context Protocol (MCP). This allows AI models to interact with tools and external systems, significantly expanding their capabilities beyond simple question answering.

## Features

- **WebSocket Communication**: Connect to MCP servers via secure WebSocket connections
- **Interactive Chat Interface**: Simple, intuitive chat UI for sending and receiving messages
- **MCP Server Configuration**: Configure and connect to any compatible MCP server
- **Cross-Platform Support**: Run on iOS, Android, Web, Windows, macOS, and Linux

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher (for backend servers)
- Flutter SDK 3.4.3 or higher
- Dart SDK 3.0.0 or higher
- An IDE (VS Code, Android Studio, etc.)

### Installation
#### 1. Clone the repository:
   ```
   git clone https://github.com/TejasShirsath/X-Agent.git
   cd X-Agent
   ```


#### 2. Configure and Start the Client Server

The client server handles WebSocket connections from the Flutter app and forwards them to the MCP server.

1. Create a `.env` file in the `backend/client_server` directory:
   ```bash
   cd backend/client_server
   cp .env.example .env
   ```

2. Open the `.env` file and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Install dependencies and start the server:
   ```bash
   npm install
   node client.js
   ```

The client server will start on port 8080 by default.

#### 3. Configure and Start the MCP Server

The MCP server provides tools for the AI model to use.

1. Create a `.env` file in the `backend/mcp_server` directory:
   ```bash
   cd backend/mcp_server
   cp .env.example .env
   ```

2. Open the `.env` file and add your X API credentials:
   ```bash
   X_API_KEY="YOUR_X_API_KEY_FORMERLY_KNOWN_AS_TWITTER"
   X_API_SECRET="your_x_api_secret_here"
   X_ACCESS_TOKEN="your_x_access_token_here"
   X_ACCESS_SECRET="your_x_access_secret_here"
   ```

3. Install dependencies and start the server:
   ```bash
   npm install
   node index.js
   ```

The MCP server will start on port 3000 by default.

#### 4. Installing and Running the Flutter App



1. Install dependencies:
   ```
   flutter pub get
   ```

2. Create a `.env` file in the root of your app directory (`X-Agent/app/`):
   ```bash
   cd app
   cp .env.example .env
   ```
   
   Edit the `.env` file with the appropriate WebSocket URL:
   ```
   WEBSOCKET_URL=ws://localhost:8080  # For local development
   # Or use WEBSOCKET_URL=wss://your-production-websocket-server-url for production
   ```

3. Run the application:
   ```
   flutter run
   ```

## Project Structure

- `/app` - Flutter application
- `/backend` - Backend services
  - `/client_server` - WebSocket client server
  - `/mcp_server` - MCP server implementation

## Configuration

The app connects to a WebSocket server defined in the `.env.example` file. You can also configure the MCP server URL at runtime using the settings icon in the app's interface.

## How it Works

1. The app establishes a WebSocket connection to the client server
2. The client server connects to an MCP server
3. User messages are sent to the AI model through these connections
4. The AI model can use tools available on the MCP server to perform tasks
5. Responses are sent back to the app and displayed to the user