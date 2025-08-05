import './App.css';
import Navigation from './components/Navigation/Navigation.jsx';
import Home from './pages/Home/Home.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';
import Login from './pages/Login/Login.jsx';
import Message from './pages/Message/Message.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import ChannelList from './pages/Channels/ChannelList.jsx';
import ChannelRoom from './pages/Channels/ChannelRoom.jsx';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import DataProvider from "./context/DataProvider";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated
                  ? <Navigate to="/" replace />
                  : <Login onLogin={handleLogin} />
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Navigation onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="message" element={<Message />} />
              <Route path="channels" element={<ChannelList />} />
              <Route path="channels/:id" element={<ChannelRoom />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </div>
  );
}

export default App;
