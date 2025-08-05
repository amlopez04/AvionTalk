import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useData } from "../../context/DataProvider";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Send as SendIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import "./Message.css";

const API_URL = process.env.REACT_APP_API_URL || "https://slack-api.up.railway.app/api/v1";

function DirectMessage() {
  const { userHeaders, currentUser } = useData();
  const location = useLocation();
  const hasLoaded = useRef(false);

  const [messageText, setMessageText] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  // Parse email and id from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setReceiverEmail(params.get("email") || "");
    setReceiverId(params.get("id") || "");
  }, [location.search]);

  // Fetch message history
  useEffect(() => {
    if (!receiverId || !userHeaders) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log("Fetching messages for receiver:", receiverId);
        console.log("Fetching messages with headers:", getAuthHeaders());
        console.log("API URL:", API_URL);
        
        const res = await axios.get(
          `${API_URL}/messages?receiver_id=${receiverId}&receiver_class=User`,
          { headers: getAuthHeaders() }
        );
        
        console.log("Messages response:", res.data);
        console.log("Response status:", res.status);
        
        const messagesData = res.data.data || res.data || [];
        console.log("Processed messages data:", messagesData);
        console.log("Number of messages found:", messagesData.length);
        
        setMessageHistory(messagesData);
        setError("");
      } catch (err) {
        console.error("Failed to load messages:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        console.error("Full error object:", err);
        setError(`Failed to load messages: ${err.response?.data?.message || err.message}`);
        setMessageHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, userHeaders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiverId || !messageText.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const payload = {
        receiver_id: Number(receiverId),
        receiver_class: "User",
        body: messageText,
      };

      console.log("Sending message:", payload);
      const res = await axios.post(`${API_URL}/messages`, payload, {
        headers: getAuthHeaders(),
      });

      console.log("Message response:", res.data);

      // Handle different response structures
      const newMsg = res.data.data || res.data;
      
      // If the response doesn't include sender info, add it manually
      if (newMsg && !newMsg.sender && currentUser) {
        newMsg.sender = {
          email: currentUser.email,
          id: currentUser.id
        };
      }

      // Ensure the message has all required fields
      if (newMsg) {
        newMsg.id = newMsg.id || Date.now(); // Fallback ID
        newMsg.created_at = newMsg.created_at || new Date().toISOString();
        newMsg.body = newMsg.body || messageText;
      }

      setMessageHistory((prev) => [...prev, newMsg]);
      setMessageText("");
      setError("");
      setSuccess("Message sent successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to send:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.errors?.full_messages?.[0] || 
                          err.response?.data?.message || 
                          "Failed to send message";
      setError(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const getSenderEmail = (message) => {
    if (message.sender?.email) {
      return message.sender.email;
    }
    return "Unknown User";
  };

  const isMyMessage = (message) => {
    const currentUserEmail = currentUser?.email || userHeaders?.uid;
    const senderEmail = getSenderEmail(message);
    return currentUserEmail?.toLowerCase() === senderEmail?.toLowerCase();
  };

  if (!receiverEmail) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No user selected for direct message
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="dm-wrapper">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#673ab7' }}>
          💬 Chat with: {receiverEmail}
        </Typography>
        <Button 
          onClick={() => {
            hasLoaded.current = false;
            setMessageHistory([]);
            setError("");
            // Trigger re-fetch
            const fetchMessages = async () => {
              try {
                setLoading(true);
                console.log("Manual refresh - Fetching messages for receiver:", receiverId);
                const res = await axios.get(
                  `${API_URL}/messages?receiver_id=${receiverId}&receiver_class=User`,
                  { headers: getAuthHeaders() }
                );
                console.log("Manual refresh - Messages response:", res.data);
                setMessageHistory(res.data.data || res.data || []);
                setError("");
              } catch (err) {
                console.error("Manual refresh - Failed to load messages:", err);
                setError(`Failed to load messages: ${err.response?.data?.message || err.message}`);
              } finally {
                setLoading(false);
              }
            };
            fetchMessages();
          }}
          variant="outlined" 
          size="small"
          disabled={loading}
        >
          Refresh Messages
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box className="messages-container">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : messageHistory?.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Paper>
        ) : (
          messageHistory.map((msg, index) => {
            const senderEmail = getSenderEmail(msg);
            const isMine = isMyMessage(msg);

            return (
              <Box key={msg.id}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  mb: 1
                }}>
                  <Paper 
                    sx={{ 
                      p: 2,
                      backgroundColor: isMine ? '#f3e5f5' : '#f5f5f5',
                      borderRadius: 2,
                      maxWidth: '70%',
                      minWidth: '200px'
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {senderEmail.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {senderEmail}
                    </Typography>
                    {isMine && (
                      <Chip label="You" size="small" color="primary" />
                    )}
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {msg.body}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 12 }} />
                    {new Date(msg.created_at).toLocaleString()}
                  </Typography>
                </Paper>
                  </Box>
                {index < messageHistory.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            );
          })
        )}
      </Box>

      <Box component="form" className="dm-form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sendingMessage}
          sx={{ flex: 1 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!messageText.trim() || sendingMessage}
          startIcon={sendingMessage ? <CircularProgress size={16} /> : <SendIcon />}
        >
          {sendingMessage ? "Sending..." : "Send"}
        </Button>
      </Box>
    </Box>
  );
}

export default DirectMessage;

