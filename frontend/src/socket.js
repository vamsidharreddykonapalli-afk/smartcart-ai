import { io } from "socket.io-client";

// Point to the backend server with the same port as environmental PORT or fallback to 5000.
// We're using localhost:5000 for local development.
const socket = io("http://localhost:5000");

export default socket;
