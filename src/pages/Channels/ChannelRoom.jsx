import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useData } from "../../context/DataProvider";
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  Alert,
  Box,
  CircularProgress,
  Avatar,
  Chip,
  Paper,
} from "@mui/material";
import {
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import "./ChannelRoom.css";

// Use environment variable with fallback
const API_URL = process.env.REACT_APP_API_URL || "https://slack-api.up.railway.app/api/v1";

export default function ChannelRoom() {
  const { id: channelId } = useParams();
  const { userHeaders, currentUser } = useData();
  const hasLoaded = useRef(false);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [channel, setChannel] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [addedMembers, setAddedMembers] = useState([]); // Track recently added members

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

  // Fetch all users
  const fetchUsers = async () => {
    try {
      console.log("Fetching users with headers:", getAuthHeaders());
      const res = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      console.log("Users response:", res.data);
      setUserList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch user list", err);
      console.error("Error response:", err.response?.data);
      setError("Failed to load user list");
    }
  };

  // Fetch channel details
  const fetchChannelDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching channel details with headers:", getAuthHeaders());
      const res = await axios.get(`${API_URL}/channels/${channelId}`, {
        headers: getAuthHeaders(),
      });
      
      console.log("Channel details response:", res.data);
      
      // Handle different response structures
      const channelData = res.data.data || res.data;
      console.log("Processed channel data:", channelData);
      
      setChannel(channelData);
      
      // Fetch messages for this channel
      await fetchChannelMessages();
      
      // Fetch members for this channel
      await fetchChannelMembers();
      
      setError("");
    } catch (err) {
      console.error("Failed to fetch channel details:", err);
      console.error("Error response:", err.response?.data);
      setError("Failed to load channel details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for this channel
  const fetchChannelMessages = async () => {
    try {
      console.log("Fetching messages for channel:", channelId);
      const res = await axios.get(
        `${API_URL}/messages?receiver_id=${channelId}&receiver_class=Channel`,
        { headers: getAuthHeaders() }
      );
      
      console.log("Channel messages response:", res.data);
      const messagesData = res.data.data || res.data || [];
      setMessages(messagesData);
    } catch (err) {
      console.error("Failed to fetch channel messages:", err);
      console.error("Error response:", err.response?.data);
      setMessages([]);
    }
  };

  // Fetch members for this channel
  const fetchChannelMembers = async () => {
    try {
      console.log("Fetching members for channel:", channelId);
      const res = await axios.get(
        `${API_URL}/channels/${channelId}/members`,
        { headers: getAuthHeaders() }
      );
      
      console.log("Channel members response:", res.data);
      const membersData = res.data.data || res.data || [];
      setMembers(membersData);
    } catch (err) {
      console.error("Failed to fetch channel members:", err);
      console.error("Error response:", err.response?.data);
      // Fallback to channel_members from channel data
      if (channel?.channel_members) {
        setMembers(channel.channel_members.map(member => ({
          id: member.user_id,
          email: `User ${member.user_id}`
        })));
      } else {
        setMembers([]);
      }
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const messageData = {
        receiver_id: Number(channelId),
        receiver_class: "Channel",
        body: messageText,
      };
      console.log("Sending message:", messageData);

      const res = await axios.post(
        `${API_URL}/messages`,
        messageData,
        { headers: getAuthHeaders() }
      );

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

      setMessages((prev) => [...prev, newMsg]);
      setMessageText("");
      setError("");
      setSuccess("Message sent successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh messages to ensure we have the latest data
      await fetchChannelMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.errors?.full_messages?.[0] || 
                          err.response?.data?.message || 
                          "Message failed to send";
      setError(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  // Add member by email
  const handleAddMember = async () => {
    if (!selectedEmail || addingMember) {
      setError("Please select a user email");
      return;
    }

    const foundUser = userList.find(
      (user) => user.email.toLowerCase() === selectedEmail.toLowerCase()
    );
    if (!foundUser) {
      setError("Email not found in user list");
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = members.some(member => member.id === foundUser.id);
    if (isAlreadyMember) {
      setError(`${foundUser.email} is already a member of this channel`);
      return;
    }

    try {
      setAddingMember(true);
      const memberData = {
        id: Number(channelId),
        member_id: foundUser.id,
      };
      console.log("Adding member:", memberData);

      // Use the correct API endpoint for adding channel members
      const response = await axios.post(
        `${API_URL}/channel/add_member`,
        memberData,
        { headers: getAuthHeaders() }
      );

      console.log("Add member response:", response.data);

      setError("");
      setSelectedEmail("");
      setSuccess(`Successfully added ${foundUser.email} to the channel!`);
      
      // Track the added member
      setAddedMembers(prev => [...prev, {
        id: foundUser.id,
        email: foundUser.email,
        addedAt: new Date().toISOString()
      }]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh members list to show the new member
      await fetchChannelMembers();
    } catch (err) {
      console.error("Failed to add member:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.errors?.full_messages?.[0] || 
                          err.response?.data?.message || 
                          "Failed to add member to channel. Please try again.";
      setError(errorMessage);
    } finally {
      setAddingMember(false);
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

  useEffect(() => {
    if (userHeaders && channelId && !hasLoaded.current) {
      hasLoaded.current = true;
      fetchChannelDetails();
      fetchUsers();
    }
  }, [userHeaders, channelId]);

  if (loading) {
    return (
      <Box className="dm-wrapper">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="dm-wrapper">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#673ab7' }}>
          # {channel?.name || "Loading..."}
        </Typography>
        <Button 
          onClick={() => {
            hasLoaded.current = false;
            setMessages([]);
            setError("");
            fetchChannelDetails();
          }}
          variant="outlined" 
          size="small"
          disabled={loading}
        >
          Refresh Channel
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

      {/* Messages */}
      <Box className="messages-container">
        {messages.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Paper>
        ) : (
          messages.map((msg, index) => {
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
                {index < messages.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            );
          })
        )}
      </Box>

      {/* Message Input */}
      <Box component="form" className="dm-form" onSubmit={handleSendMessage}>
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

      {/* Add Member */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          Add Member
        </Typography>
        <Autocomplete
          options={userList.map((u) => u.email)}
          value={selectedEmail}
          onChange={(e, value) => setSelectedEmail(value || "")}
          renderInput={(params) => (
            <TextField {...params} label="User Email" variant="outlined" size="small" />
          )}
          sx={{ mt: 1, mb: 2, width: 300 }}
          disabled={addingMember}
          loading={userList.length === 0}
        />
        <Button 
          variant="contained" 
          onClick={handleAddMember} 
          disabled={!selectedEmail || addingMember}
          startIcon={addingMember ? <CircularProgress size={16} /> : <AddIcon />}
        >
          {addingMember ? "Adding..." : "Add to Channel"}
        </Button>
      </Box>

      {/* Member Tracking Summary */}
      {addedMembers.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Recently Added Members ({addedMembers.length})
          </Typography>
          <List dense>
            {addedMembers.map((member) => (
              <ListItem key={member.id}>
                <ListItemText 
                  primary={member.email}
                  secondary={`Added on ${new Date(member.addedAt).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
