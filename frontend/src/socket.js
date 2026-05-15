import { io } from "socket.io-client";

// Point to the backend server with the same port as environmental PORT or fallback to 5000.
// We're using localhost:5000 for local development.
const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000");

export default socket;
