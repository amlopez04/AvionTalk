// components/Navigation/Navigation.jsx
import React, { useEffect, useState } from 'react';
import {
  Drawer, List, ListItemButton, ListItemText,
  Toolbar, Typography, Box, Divider, Accordion,
  AccordionSummary, AccordionDetails, IconButton,
  Avatar, ListItemAvatar
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useData } from '../../context/DataProvider';

const drawerWidth = 280; // Widened from 240 to 280

const API_URL = process.env.REACT_APP_API_URL || "https://slack-api.up.railway.app/api/v1";

export default function Navigation({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userHeaders } = useData();

  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!userHeaders) return;

      setLoading(true);
      setError("");

      try {
        console.log("Fetching navigation data with headers:", getAuthHeaders());
        console.log("API_URL:", API_URL);

        // Fetch users
        const usersResponse = await axios.get(`${API_URL}/users`, {
          headers: getAuthHeaders()
        });

        console.log("Users response:", usersResponse.data);

        const usersData = usersResponse.data.data || usersResponse.data || [];
        console.log("Processed users data:", usersData);
        setUsers(usersData);

      } catch (error) {
        console.error("Error fetching navigation data:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        setError(`Failed to load navigation data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, userHeaders]);

  const handleAccordionToggle = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getInitials = (email) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#673ab7',
            color: 'white'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AvionTalk</Typography>
        </Toolbar>
        <Divider />

        <List>
          <SidebarItem to="/" icon={<HomeIcon />} label="Home" currentPath={location.pathname} />
          <SidebarItem to="/channels" icon={<SettingsIcon />} label="Channel Management" currentPath={location.pathname} />
        </List>

        <Divider />

        {/* Direct Messages Accordion */}
        <Accordion
          expanded={expanded === 'dms'}
          onChange={handleAccordionToggle('dms')}
          sx={{ backgroundColor: '#673ab7', color: 'white', boxShadow: 'none' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
            <Typography fontWeight="bold">Direct Messages</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading users...
                </Typography>
              ) : error ? (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              ) : users.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No users found
                </Typography>
              ) : (
                users.map((user) => (
                  <ListItemButton
                    key={user.id}
                    onClick={() => navigate(`/message?email=${user.email}&id=${user.id}`)}
                    sx={{
                      color: 'white',
                      '&:hover': { backgroundColor: '#5e35b1' },
                      borderRadius: 1,
                      mb: 0.5
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.875rem',
                          backgroundColor: '#5e35b1',
                          color: 'white'
                        }}
                      >
                        {getInitials(user.email)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.email} 
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { 
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }
                      }}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <List sx={{ mt: 'auto' }}>
          <ListItemButton onClick={onLogout} sx={{ color: 'white' }}>
            <LogoutIcon sx={{ mr: 1 }} />
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

function SidebarItem({ to, icon, label, currentPath }) {
  return (
    <ListItemButton
      component={Link}
      to={to}
      selected={currentPath === to}
      sx={{
        color: 'white',
        '&.Mui-selected': { backgroundColor: '#5e35b1' },
        '&:hover': { backgroundColor: '#5e35b1' }
      }}
    >
      {icon && <Box sx={{ color: 'white', mr: 1 }}>{icon}</Box>}
      <ListItemText primary={label} />
    </ListItemButton>
  );
}
