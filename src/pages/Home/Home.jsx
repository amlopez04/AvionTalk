import { useEffect, useState } from "react";
import axios from "axios";
import { useData } from "../../context/DataProvider";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import {
  People as PeopleIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import "./Home.css";

const API_URL = process.env.REACT_APP_API_URL || "https://slack-api.up.railway.app/api/v1";

function Home() {
  const { userHeaders, currentUser } = useData();
  const [userList, setUserList] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to format headers properly
  const getAuthHeaders = () => {
    if (!userHeaders) return {};
    return {
      'access-token': userHeaders['access-token'],
      'client': userHeaders.client,
      'expiry': userHeaders.expiry,
      'uid': userHeaders.uid
    };
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users with headers:", getAuthHeaders());
      const res = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      console.log("Users response:", res.data);
      const usersData = res.data.data || res.data || [];
      setUserList(usersData);
    } catch (error) {
      console.error("Error fetching users", error);
      console.error("Error response:", error.response?.data);
      setError("Failed to load users");
    }
  };

  const fetchRecentMessages = async () => {
    try {
      console.log("Fetching recent messages with headers:", getAuthHeaders());
      console.log("API URL:", API_URL);
      
      const res = await axios.get(`${API_URL}/messages`, {
        headers: getAuthHeaders(),
      });
      console.log("📦 Raw message response:", res.data);
      console.log("Response status:", res.status);
      
      const messagesData = res.data.data || res.data || [];
      console.log("Processed messages data:", messagesData);
      console.log("Number of messages found:", messagesData.length);
      
      // Filter out messages without proper sender info and sort by creation date
      const validMessages = messagesData.filter(msg => 
        msg.body && msg.created_at && (msg.sender?.email || msg.sender_id)
      );
      
      const sorted = validMessages.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      const recent = sorted.slice(0, 5);
      console.log("Recent messages (filtered):", recent);
      
      setRecentMessages(recent);
    } catch (error) {
      console.error("Error fetching messages", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      // Don't show error, just set empty array
      setRecentMessages([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userHeaders) return;
      
      setLoading(true);
      setError("");
      
      try {
        await Promise.all([fetchUsers(), fetchRecentMessages()]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Only show error for users, not for messages
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userHeaders]);

  const getSenderEmail = (message) => {
    if (message.sender?.email) {
      return message.sender.email;
    }
    
    const sender = userList.find((u) => u.id === message.sender_id);
    if (sender?.email) {
      return sender.email;
    }
    
    return "Unknown User";
  };

  const isMyMessage = (message) => {
    const currentUserEmail = currentUser?.email || userHeaders?.uid;
    const senderEmail = getSenderEmail(message);
    return currentUserEmail?.toLowerCase() === senderEmail?.toLowerCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#673ab7', mb: 2 }}>
        👋 Welcome to AvionTalk
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You're logged in as <strong>{currentUser?.email || userHeaders?.uid}</strong>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#673ab7', mb: 1 }} />
            <Typography variant="h4" component="div">
              {userList.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 40, color: '#673ab7', mb: 1 }} />
            <Typography variant="h4" component="div">
              {recentMessages.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recent Messages
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Messages */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MessageIcon />
              📩 Latest Messages
            </Typography>
            <Button 
              onClick={async () => {
                setLoading(true);
                setError("");
                try {
                  await Promise.all([fetchUsers(), fetchRecentMessages()]);
                } catch (error) {
                  console.error("Error refreshing data:", error);
                  // Don't show error for refresh
                } finally {
                  setLoading(false);
                }
              }}
              variant="outlined" 
              size="small"
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          
          {recentMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Recent Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a conversation to see your recent messages here!
              </Typography>
            </Box>
          ) : (
            <List>
              {recentMessages.map((msg, index) => (
                <Box key={msg.id}>
                  <ListItem sx={{ 
                    backgroundColor: isMyMessage(msg) ? '#f3e5f5' : 'transparent',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {getSenderEmail(msg).charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {getSenderEmail(msg)}
                          </Typography>
                          {isMyMessage(msg) && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            "{msg.body}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 12 }} />
                            {new Date(msg.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentMessages.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Home;

