import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createXPost} from "./mcp.tool.js"
import { z } from "zod";

const server = new McpServer({
  name: "backwards-compatible-server",
  version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...
const app = express();

server.tool(
  "addTwoNumbers",
  "Add two numbers",
  {
    a: z.number(),
    b: z.number()
  },
  async (arg) => {
    const {a, b} = arg;
    return {
      content: [
        {
          type:"text",
          text: `The sum of ${a} and ${b} is ${a + b}.`
        }
      ]
    };
  }
)

server.tool(
  "createXPost",
  "Create a post on X (formerly Twitter)",
  {status: z.string()},
  async (arg) => {
    const {status} = arg;
    return createXPost(status);
  }
)

// Store transports for each session type
const transports = {
  sse: {}
};

// Legacy SSE endpoint for older clients
app.get('/sse', async (req, res) => {
  try {
    // Create SSE transport for legacy clients
    const transport = new SSEServerTransport('/messages', res);
    transports.sse[transport.sessionId] = transport;
    
    res.on("close", () => {
      delete transports.sse[transport.sessionId];
    });
    
    await server.connect(transport);
  } catch (error) {
    console.error('SSE connection error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Legacy message endpoint for older clients
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.sse[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

app.listen(3001, () =>{
  console.log("Server is running")
});
