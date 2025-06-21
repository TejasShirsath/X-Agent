import { config } from 'dotenv';
import { GoogleGenAI } from "@google/genai"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { WebSocketServer } from 'ws';
config();

let tools = [];
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});
const mcpClient = new Client({
    name: "example-client",
    version: "1.0.0",
});

// connection status
mcpClient.isConnected = false;

const chatHistory = [];
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', async (message) => {
        const messageStr = message.toString();
        
        try {
            // Try to parse as JSON
            const jsonMessage = JSON.parse(messageStr);
            
            if (jsonMessage.type === 'mcpConfig') {
                // Handle MCP server URL configuration
                console.log(`Received MCP server configuration: ${jsonMessage.url}`);
                
                try {
                    // Disconnect from current MCP server if connected
                    try {
                        await mcpClient.disconnect();
                        console.log("Disconnected from previous MCP server");
                    } catch (error) {
                        console.log("No active connection to disconnect");
                    }
                      // Connect to the new MCP server URL
                    await mcpClient.connect(new SSEClientTransport(new URL(jsonMessage.url)));
                    mcpClient.isConnected = true;
                    console.log(`Connected to MCP Server at ${jsonMessage.url}`);
                    
                    // Refresh the tools
                    tools = (await mcpClient.listTools()).tools.map(tool => {
                        return {
                            name: tool.name,
                            description: tool.description,
                            parameters: {
                                type: tool.inputSchema.type,
                                properties: tool.inputSchema.properties,
                                required: tool.inputSchema.required
                            }
                        }
                    });
                    
                    ws.send("MCP server URL updated successfully. Connected and ready to use tools.");
                } catch (error) {
                    console.error("Failed to connect to MCP server:", error);
                    ws.send(`Failed to connect to MCP server: ${error.message}`);
                }
            } else if (jsonMessage.type === 'message') {
                // Handle regular message
                await handleMessage(jsonMessage.content, ws);
            }
        } catch (error) {
            // If not JSON, treat as regular message
            await handleMessage(messageStr, ws);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Initialize MCP connection
async function initializeMcpConnection(url) {
    if (!url) {
        // If no URL is provided, just start the WebSocket server without MCP connection
        console.log("No MCP server URL provided. Waiting for configuration.");
        return false;
    }
    
    try {        await mcpClient.connect(new SSEClientTransport(new URL(url)));
        mcpClient.isConnected = true;
        console.log(`Connected to MCP Server at ${url}`);
        
        tools = (await mcpClient.listTools()).tools.map(tool => {
            return {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: tool.inputSchema.type,
                    properties: tool.inputSchema.properties,
                    required: tool.inputSchema.required
                }
            }
        });
        
        return true;
    } catch (error) {
        console.error(`Failed to connect to MCP server at ${url}:`, error);
        return false;
    }
}

// Start WebSocket server without initializing MCP connection
console.log("WebSocket server is running on port 8080");
console.log("Waiting for MCP server configuration from client...");

async function handleMessage(question, ws, toolCall) {
    // Check if MCP client is connected before trying to use tools
    const isMcpConnected = mcpClient && mcpClient.isConnected;
    
    if (toolCall) {
        if (!isMcpConnected) {
            console.log("Cannot call tool: MCP server not configured");
            ws.send("Cannot execute tool call. Please configure the MCP server first using the settings icon.");
            return;
        }
        
        console.log("calling tool ",toolCall.name)
        chatHistory.push({
            role: 'model',
            parts: [
                {
                    text: `calling tool ${toolCall.name}`,
                    type: "text"
                }
            ]
        })

        const toolResult = await mcpClient.callTool({
            name: toolCall.name,
            arguments: toolCall.args
        })

        chatHistory.push({
            role: 'user',
            parts: [
                {
                    text: "Tool Result: " + toolResult.content[0].text,
                    type: "text"
                }
            ]
        })    } else {
        chatHistory.push({
            role: 'user',
            parts: [
                {
                    text: question,
                    type: "text"
                }
            ]
        })
    }
    
    // Config for Gemini API call
    const modelConfig = {
        model: "gemini-2.0-flash",
        contents: chatHistory,
        config: {}
    };
    
    // Only add tools configuration if MCP client is connected
    if (isMcpConnected && tools.length > 0) {
        modelConfig.config.tools = tools.map(tool => ({
            functionDeclarations: [{
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }]
        }));
    } else if (!isMcpConnected) {
        // Add a reminder about MCP configuration to the chat history
        chatHistory.push({
            role: 'model',
            parts: [
                {
                    text: "Note: MCP server is not configured. Some functionality may be limited.",
                    type: "text"
                }
            ]
        });
    }
    
    const response = await ai.models.generateContent(modelConfig);

    const functionCall = response.candidates[0].content.parts[0].functionCall;
    const responseText = response.candidates[0].content.parts[0].text;

    if (functionCall) {
        return handleMessage(question, ws, functionCall);
    }

    chatHistory.push({
        role: "model",
        parts: [
            {
                text: responseText,
                type: "text"
            }
        ]
    })

    ws.send(responseText);
}