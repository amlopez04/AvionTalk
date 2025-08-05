import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Alert,
  Paper,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Group as GroupIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useData } from "../../context/DataProvider";
import './ChannelList.css';

// Use environment variable with fallback
const API_URL = process.env.REACT_APP_API_URL || "https://slack-api.up.railway.app/api/v1";

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const { userHeaders } = useData();
  const navigate = useNavigate();

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

  const fetchChannels = async () => {
    try {
      setLoading(true);
      console.log("Fetching channels with headers:", getAuthHeaders());
      console.log("API URL for fetching:", API_URL);
      
      const res = await axios.get(`${API_URL}/channels`, {
        headers: getAuthHeaders(),
      });
      
      console.log("Channels response:", res.data);
      console.log("Response status:", res.status);
      console.log("Full response object:", res);
      
      const channelsData = res.data.data || res.data || [];
      console.log("Processed channels data:", channelsData);
      console.log("Number of channels found:", channelsData.length);
      
      if (channelsData.length === 0) {
        console.log("No channels found in response");
      }
      
      setChannels(channelsData);
      setError("");
    } catch (err) {
      console.error("Error fetching channels", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Full error object:", err);
      setError(`Failed to load channels: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateChannel = async () => {
    if (!newChannel.trim()) return;
  
    try {
      console.log("Creating channel:", { name: newChannel });
      console.log("API URL:", API_URL);
      console.log("Headers:", getAuthHeaders());
  
      const res = await axios.post(
        `${API_URL}/channels`,
        { name: newChannel },
        { headers: getAuthHeaders() }
      );
  
            console.log("Channel creation response:", res.data);
      console.log("Response status:", res.status);
      console.log("Full creation response:", res);
      
      // Check if the response contains the created channel
      const createdChannel = res.data?.data || res.data;
      console.log("Created channel data:", createdChannel);
      
      // Always treat as success if we get here
      setNewChannel("");
      setError("");
      setSuccess(`Channel "#${newChannel}" created successfully!`);
      
      // Add the new channel to the list immediately if we have the data
      if (createdChannel && createdChannel.id) {
        setChannels(prev => [...prev, createdChannel]);
        console.log("Added channel to list immediately:", createdChannel);
      }
      
      // Also refresh the full list after a delay
      setTimeout(async () => {
        console.log("Refreshing channel list after creation...");
        await fetchChannels();
      }, 1000);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Create channel error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Check if it's actually a success (sometimes API returns error but creates the channel)
      if (err.response?.status === 201 || err.response?.status === 200) {
        setNewChannel("");
        setError("");
        setSuccess(`Channel "#${newChannel}" created successfully!`);
        
        // Small delay to ensure API has processed the creation
        setTimeout(async () => {
          await fetchChannels();
        }, 500);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorMessage =
          err.response?.data?.errors?.full_messages?.[0] ||
          err.response?.data?.message ||
          "Cannot add channel.";
        setError(errorMessage);
      }
    }
  };
  
  const goToChannel = (id) => {
    navigate(`/channels/${id}`);
  };

  useEffect(() => {
    if (userHeaders) {
      fetchChannels();
    }
  }, [userHeaders]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#673ab7' }}>
        Channel Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create new channels and manage your workspace
      </Typography>

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

      {/* Create Channel Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          Create New Channel
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Channel Name"
            size="small"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateChannel()}
            placeholder="e.g., general, random, announcements"
            sx={{ flex: 1 }}
          />
          <Button 
            onClick={handleCreateChannel} 
            variant="contained" 
            disabled={!newChannel.trim()}
            startIcon={<AddIcon />}
          >
            Create Channel
          </Button>
        </Box>
      </Paper>

      {/* Channels List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Your Channels ({channels.length})
          </Typography>
          <Button 
            onClick={fetchChannels} 
            variant="outlined" 
            size="small"
            disabled={loading}
          >
            Refresh List
          </Button>
        </Box>
        
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading channels...
          </Typography>
        ) : channels.length === 0 ? (
          <Box>
            <Typography variant="body2" color="text.secondary">
              No channels available. Create your first channel above!
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Debug: API URL: {API_URL}, Headers: {JSON.stringify(getAuthHeaders())}
              </Typography>
            )}
          </Box>
        ) : (
          <List>
            {channels.map((channel, index) => (
              <Box key={channel.id}>
                <ListItem 
                  button 
                  onClick={() => goToChannel(channel.id)}
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': { 
                      backgroundColor: '#f5f5f5',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`# ${channel.name}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={`Channel ID: ${channel.id}`}
                  />
                  <IconButton size="small">
                    <MessageIcon />
                  </IconButton>
                </ListItem>
                {index < channels.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ChannelList;