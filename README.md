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

- Flutter SDK 3.4.3 or higher
- Dart SDK 3.0.0 or higher
- An IDE (VS Code, Android Studio, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/X-Agent.git
   cd X-Agent/app
   ```

2. Install dependencies:
   ```
   flutter pub get
   ```

3. Create a `.env` file in the root of your app directory with the following content:
   ```
   WEBSOCKET_URL=wss://your-websocket-server-url
   ```

4. Run the application:
   ```
   flutter run
   ```

## Project Structure

- `/app` - Flutter application
- `/backend` - Backend services
  - `/client_server` - WebSocket client server
  - `/mcp_server` - MCP server implementation

## Configuration

The app connects to a WebSocket server defined in the `.env` file. You can also configure the MCP server URL at runtime using the settings icon in the app's interface.

## How it Works

1. The app establishes a WebSocket connection to the client server
2. The client server connects to an MCP server
3. User messages are sent to the AI model through these connections
4. The AI model can use tools available on the MCP server to perform tasks
5. Responses are sent back to the app and displayed to the user