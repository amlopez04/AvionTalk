import { http, HttpResponse } from 'msw';

// Mock data store with seeded data for portfolio screenshots
let mockUsers = [
  { id: 1, email: 'alex@avion.com', uid: 'alex@avion.com' },
  { id: 2, email: 'sarah@avion.com', uid: 'sarah@avion.com' },
  { id: 3, email: 'mike@avion.com', uid: 'mike@avion.com' },
  { id: 4, email: 'emily@avion.com', uid: 'emily@avion.com' },
  { id: 5, email: 'david@avion.com', uid: 'david@avion.com' },
];

let mockChannels = [
  { id: 1, name: 'general' },
  { id: 2, name: 'random' },
  { id: 3, name: 'announcements' },
  { id: 4, name: 'dev-team' },
  { id: 5, name: 'design' },
];

// Pre-populated messages with timestamps
const now = new Date();
let mockMessages = [
  // General channel messages
  {
    id: 1,
    body: 'Welcome to AvionTalk! 🎉 This is our main channel for general discussions.',
    receiver_id: 1,
    receiver_class: 'Channel',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 3).toISOString(), // 3 days ago
  },
  {
    id: 2,
    body: 'Thanks for the welcome! Excited to be here.',
    receiver_id: 1,
    receiver_class: 'Channel',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 3 + 3600000).toISOString(), // 3 days ago + 1 hour
  },
  {
    id: 3,
    body: 'Has anyone started working on the new feature yet?',
    receiver_id: 1,
    receiver_class: 'Channel',
    sender: { id: 3, email: 'mike@avion.com' },
    created_at: new Date(now - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 4,
    body: 'I\'m planning to start tomorrow. Want to pair on it?',
    receiver_id: 1,
    receiver_class: 'Channel',
    sender: { id: 4, email: 'emily@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 1800000).toISOString(), // 2 days ago + 30 min
  },
  {
    id: 5,
    body: 'Sure! Let\'s sync up in the morning.',
    receiver_id: 1,
    receiver_class: 'Channel',
    sender: { id: 3, email: 'mike@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 3600000).toISOString(), // 2 days ago + 1 hour
  },
  // Random channel messages
  {
    id: 6,
    body: 'Anyone up for a coffee break? ☕',
    receiver_id: 2,
    receiver_class: 'Channel',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    id: 7,
    body: 'I\'m in! Meet at the usual spot?',
    receiver_id: 2,
    receiver_class: 'Channel',
    sender: { id: 5, email: 'david@avion.com' },
    created_at: new Date(now - 86400000 * 1 + 600000).toISOString(), // 1 day ago + 10 min
  },
  {
    id: 8,
    body: 'Sounds good! See you there in 10.',
    receiver_id: 2,
    receiver_class: 'Channel',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 1 + 1200000).toISOString(), // 1 day ago + 20 min
  },
  // Dev-team channel messages
  {
    id: 9,
    body: 'The new API endpoint is ready for testing. Can someone review the PR?',
    receiver_id: 4,
    receiver_class: 'Channel',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 10,
    body: 'I\'ll take a look this afternoon. Thanks for the heads up!',
    receiver_id: 4,
    receiver_class: 'Channel',
    sender: { id: 3, email: 'mike@avion.com' },
    created_at: new Date(now - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 11,
    body: 'Found a small issue with error handling. Left a comment on the PR.',
    receiver_id: 4,
    receiver_class: 'Channel',
    sender: { id: 3, email: 'mike@avion.com' },
    created_at: new Date(now - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 12,
    body: 'Fixed! Thanks for catching that.',
    receiver_id: 4,
    receiver_class: 'Channel',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 3600000 * 1).toISOString(), // 1 hour ago
  },
  // Design channel messages
  {
    id: 13,
    body: 'Here\'s the latest mockup for the dashboard. Feedback welcome!',
    receiver_id: 5,
    receiver_class: 'Channel',
    sender: { id: 4, email: 'emily@avion.com' },
    created_at: new Date(now - 3600000 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 14,
    body: 'Love the color scheme! The layout looks clean and intuitive.',
    receiver_id: 5,
    receiver_class: 'Channel',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 15,
    body: 'Can we make the sidebar a bit wider? It feels cramped.',
    receiver_id: 5,
    receiver_class: 'Channel',
    sender: { id: 5, email: 'david@avion.com' },
    created_at: new Date(now - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 16,
    body: 'Good point! I\'ll adjust that and share an updated version.',
    receiver_id: 5,
    receiver_class: 'Channel',
    sender: { id: 4, email: 'emily@avion.com' },
    created_at: new Date(now - 3600000 * 3).toISOString(), // 3 hours ago
  },
  // Announcements channel
  {
    id: 17,
    body: '📢 Team meeting scheduled for Friday at 2 PM. Please mark your calendars!',
    receiver_id: 3,
    receiver_class: 'Channel',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 18,
    body: 'New company policy update: Remote work guidelines have been updated. Check the wiki for details.',
    receiver_id: 3,
    receiver_class: 'Channel',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 1).toISOString(), // 1 day ago
  },
  // Direct messages between alex and sarah
  {
    id: 19,
    body: 'Hey Sarah! Quick question about the project timeline.',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 20,
    body: 'Hi Alex! Sure, what do you need?',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 300000).toISOString(), // 2 days ago + 5 min
  },
  {
    id: 21,
    body: 'Do you think we can finish the user authentication feature by end of week?',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 600000).toISOString(), // 2 days ago + 10 min
  },
  {
    id: 22,
    body: 'Yes, definitely! I\'m almost done with the frontend part. Just need to connect it to the API.',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 900000).toISOString(), // 2 days ago + 15 min
  },
  {
    id: 23,
    body: 'Perfect! Let me know if you need any help with the backend integration.',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 2 + 1200000).toISOString(), // 2 days ago + 20 min
  },
  {
    id: 24,
    body: 'Thanks! Will do. Also, did you get a chance to review the design mockups?',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    id: 25,
    body: 'Yes, I did! They look great. I especially like the new color scheme. Much better than the previous version.',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 86400000 * 1 + 600000).toISOString(), // 1 day ago + 10 min
  },
  {
    id: 26,
    body: 'Awesome! I\'ll let Emily know. She\'ll be happy to hear that.',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 86400000 * 1 + 1200000).toISOString(), // 1 day ago + 20 min
  },
  {
    id: 27,
    body: 'By the way, are you free for a quick sync meeting tomorrow morning?',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 3600000 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 28,
    body: 'Sure! What time works for you?',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 3600000 * 3 + 300000).toISOString(), // 3 hours ago + 5 min
  },
  {
    id: 29,
    body: 'How about 10 AM?',
    receiver_id: 2, // sarah
    receiver_class: 'User',
    sender: { id: 1, email: 'alex@avion.com' },
    created_at: new Date(now - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 30,
    body: 'Perfect! 10 AM works for me. See you then! 👋',
    receiver_id: 1, // alex
    receiver_class: 'User',
    sender: { id: 2, email: 'sarah@avion.com' },
    created_at: new Date(now - 3600000 * 2 + 180000).toISOString(), // 2 hours ago + 3 min
  },
];

let mockChannelMembers = {
  1: [ // general
    { id: 1, email: 'alex@avion.com' },
    { id: 2, email: 'sarah@avion.com' },
    { id: 3, email: 'mike@avion.com' },
    { id: 4, email: 'emily@avion.com' },
    { id: 5, email: 'david@avion.com' },
  ],
  2: [ // random
    { id: 2, email: 'sarah@avion.com' },
    { id: 5, email: 'david@avion.com' },
    { id: 1, email: 'alex@avion.com' },
  ],
  3: [ // announcements
    { id: 1, email: 'alex@avion.com' },
    { id: 2, email: 'sarah@avion.com' },
    { id: 3, email: 'mike@avion.com' },
    { id: 4, email: 'emily@avion.com' },
    { id: 5, email: 'david@avion.com' },
  ],
  4: [ // dev-team
    { id: 1, email: 'alex@avion.com' },
    { id: 3, email: 'mike@avion.com' },
    { id: 4, email: 'emily@avion.com' },
  ],
  5: [ // design
    { id: 2, email: 'sarah@avion.com' },
    { id: 4, email: 'emily@avion.com' },
    { id: 5, email: 'david@avion.com' },
  ],
};

// Helper to generate auth headers
const generateAuthHeaders = (user) => ({
  'access-token': `mock-token-${user.id}`,
  'client': `mock-client-${user.id}`,
  'expiry': new Date(Date.now() + 86400000).toISOString(),
  'uid': user.email,
});

export const handlers = [
  // Login
  http.post('https://slack-api.up.railway.app/api/v1/auth/sign_in', async ({ request }) => {
    console.log('🔵 MSW: Login request intercepted');
    const body = await request.json();
    console.log('🔵 MSW: Login body:', body);
    const { email, password } = body;

    // Find user
    const user = mockUsers.find(u => u.email === email);
    console.log('🔵 MSW: Found user:', user);
    
    if (!user || password !== 'password') {
      console.log('🔵 MSW: Login failed - invalid credentials');
      return HttpResponse.json(
        { errors: { full_messages: ['Invalid email or password'] } },
        { status: 401 }
      );
    }
    
    console.log('🔵 MSW: Login successful for:', email);

    const headers = generateAuthHeaders(user);
    return HttpResponse.json(
      { data: user },
      { 
        status: 200,
        headers: {
          'access-token': headers['access-token'],
          'client': headers.client,
          'expiry': headers.expiry,
          'uid': headers.uid,
        }
      }
    );
  }),

  // Register
  http.post('https://slack-api.up.railway.app/api/v1/auth/', async ({ request }) => {
    console.log('🟢 MSW: Registration request intercepted');
    const body = await request.json();
    console.log('🟢 MSW: Registration body:', body);
    const { email, password, password_confirmation } = body;

    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      console.log('🟢 MSW: Registration failed - email already taken');
      return HttpResponse.json(
        { errors: { full_messages: ['Email has already been taken'] } },
        { status: 422 }
      );
    }

    // Check password confirmation
    if (password !== password_confirmation) {
      console.log('🟢 MSW: Registration failed - password mismatch');
      return HttpResponse.json(
        { errors: { full_messages: ["Password confirmation doesn't match Password"] } },
        { status: 422 }
      );
    }
    
    console.log('🟢 MSW: Registration successful for:', email);

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email: email,
      uid: email,
    };
    mockUsers.push(newUser);

    const headers = generateAuthHeaders(newUser);
    return HttpResponse.json(
      { data: newUser },
      { 
        status: 201,
        headers: {
          'access-token': headers['access-token'],
          'client': headers.client,
          'expiry': headers.expiry,
          'uid': headers.uid,
        }
      }
    );
  }),

  // Get channels
  http.get('https://slack-api.up.railway.app/api/v1/channels', () => {
    return HttpResponse.json({ data: mockChannels });
  }),

  // Create channel
  http.post('https://slack-api.up.railway.app/api/v1/channels', async ({ request }) => {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return HttpResponse.json(
        { errors: { full_messages: ['Name can\'t be blank'] } },
        { status: 422 }
      );
    }

    // Get current user from headers
    const uid = request.headers.get('uid');
    const currentUser = mockUsers.find(u => u.email === uid) || mockUsers[0];

    const newChannel = {
      id: mockChannels.length + 1,
      name: name.trim(),
    };
    mockChannels.push(newChannel);
    
    // Automatically add creator as a member
    mockChannelMembers[newChannel.id] = [{ id: currentUser.id, email: currentUser.email }];

    return HttpResponse.json(
      { data: newChannel },
      { status: 201 }
    );
  }),

  // Get channel details
  http.get('https://slack-api.up.railway.app/api/v1/channels/:id', ({ params }) => {
    const channel = mockChannels.find(c => c.id === Number(params.id));
    
    if (!channel) {
      return HttpResponse.json(
        { errors: { full_messages: ['Channel not found'] } },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: channel });
  }),

  // Get channel members
  http.get('https://slack-api.up.railway.app/api/v1/channels/:id/members', ({ params }) => {
    const members = mockChannelMembers[Number(params.id)] || [];
    return HttpResponse.json({ data: members });
  }),

  // Add member to channel
  http.post('https://slack-api.up.railway.app/api/v1/channel/add_member', async ({ request }) => {
    const body = await request.json();
    const { id: channelId, member_id } = body;

    const channel = mockChannels.find(c => c.id === channelId);
    if (!channel) {
      return HttpResponse.json(
        { errors: { full_messages: ['Channel not found'] } },
        { status: 404 }
      );
    }

    const user = mockUsers.find(u => u.id === member_id);
    if (!user) {
      return HttpResponse.json(
        { errors: { full_messages: ['User not found'] } },
        { status: 404 }
      );
    }

    if (!mockChannelMembers[channelId]) {
      mockChannelMembers[channelId] = [];
    }

    // Check if already a member
    if (mockChannelMembers[channelId].find(m => m.id === member_id)) {
      return HttpResponse.json(
        { errors: { full_messages: ['User is already a member'] } },
        { status: 422 }
      );
    }

    mockChannelMembers[channelId].push({ id: user.id, email: user.email });

    return HttpResponse.json(
      { data: { id: user.id, email: user.email } },
      { status: 201 }
    );
  }),

  // Get messages
  http.get('https://slack-api.up.railway.app/api/v1/messages', ({ request }) => {
    const url = new URL(request.url);
    const receiverId = url.searchParams.get('receiver_id');
    const receiverClass = url.searchParams.get('receiver_class');

    if (receiverClass === 'Channel') {
      const channelMessages = mockMessages.filter(
        m => m.receiver_id === Number(receiverId) && m.receiver_class === 'Channel'
      );
      return HttpResponse.json({ data: channelMessages });
    }

    if (receiverClass === 'User') {
      // Get current user from headers
      const uid = request.headers.get('uid');
      const currentUser = mockUsers.find(u => u.email === uid);
      
      if (!currentUser) {
        return HttpResponse.json({ data: [] });
      }

      // Return messages in both directions for the conversation
      const directMessages = mockMessages.filter(m => {
        if (m.receiver_class !== 'User') return false;
        
        const queryReceiverId = Number(receiverId);
        const currentUserId = currentUser.id;
        
        // Messages sent TO the other user by current user
        const sentToOther = m.receiver_id === queryReceiverId && m.sender.id === currentUserId;
        // Messages sent TO current user by the other user
        const receivedFromOther = m.receiver_id === currentUserId && m.sender.id === queryReceiverId;
        
        return sentToOther || receivedFromOther;
      });
      
      // Sort by created_at to show chronological order
      directMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      return HttpResponse.json({ data: directMessages });
    }

    return HttpResponse.json({ data: [] });
  }),

  // Send message
  http.post('https://slack-api.up.railway.app/api/v1/messages', async ({ request }) => {
    const body = await request.json();
    const { receiver_id, receiver_class, body: messageBody } = body;
    
    // Get current user from headers
    const uid = request.headers.get('uid');
    const currentUser = mockUsers.find(u => u.email === uid) || mockUsers[0];

    const newMessage = {
      id: mockMessages.length + 1,
      body: messageBody,
      receiver_id: receiver_id,
      receiver_class: receiver_class,
      sender: {
        id: currentUser.id,
        email: currentUser.email,
      },
      created_at: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    return HttpResponse.json(
      { data: newMessage },
      { status: 201 }
    );
  }),

  // Get users
  http.get('https://slack-api.up.railway.app/api/v1/users', () => {
    return HttpResponse.json({ data: mockUsers });
  }),
];

