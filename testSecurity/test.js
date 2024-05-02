const WebSocket = require("ws");
const ws = new WebSocket(
  "wss://pc6ix29j69.execute-api.us-east-1.amazonaws.com/production/"
);

ws.on("open", () => {
  console.log("Connection opened.");

  // Function to send messages as fast as the event loop allows
  function sendMessage() {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("xaxa");
      setImmediate(sendMessage); // Schedule the next send operation immediately
    }
  }

  sendMessage();
});

ws.on("message", (data) => {
  console.log("Received:", JSON.parse(data));
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", () => {
  console.log("WebSocket connection closed.");
});
