import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Cart from "./pages/Cart";
import Results from "./pages/Results";
import PriceInsights from "./pages/PriceInsights";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HotDeals from "./pages/HotDeals";
import PriceAlert from "./pages/PriceAlert";
import GiftCards from "./pages/GiftCards";


import Chatbot from "./components/Chatbot";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/price-insights" element={<ProtectedRoute><PriceInsights /></ProtectedRoute>} />
          <Route path="/hot-deals" element={<ProtectedRoute><HotDeals /></ProtectedRoute>} />
          <Route path="/price-alert" element={<ProtectedRoute><PriceAlert /></ProtectedRoute>} />
          <Route path="/gift-cards" element={<ProtectedRoute><GiftCards /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Chatbot />
    </AuthProvider>
  );
}

export default App;
