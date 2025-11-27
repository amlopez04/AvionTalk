# Mock API Setup (MSW)

This project uses Mock Service Worker (MSW) to mock API calls when the backend API is unavailable.

## How It Works

- MSW intercepts all API requests to `https://slack-api.up.railway.app`
- Mock handlers in `handlers.js` simulate the API responses
- The mock API only runs in development mode

## Default Test Credentials

**Pre-seeded Users (all use password: `password`):**
- `alex@avion.com` - Admin/Team Lead
- `sarah@avion.com` - Team Member
- `mike@avion.com` - Developer
- `emily@avion.com` - Designer
- `david@avion.com` - Team Member

**Register:**
- You can register any new email
- Password must match password confirmation
- Default password for testing: `password`

## Mock Data

The mock API comes pre-seeded with realistic data for portfolio screenshots:
- **Users**: 5 pre-seeded users (alex, sarah, mike, emily, david)
- **Channels**: 5 channels (general, random, announcements, dev-team, design)
- **Messages**: 18 pre-populated messages across different channels with realistic timestamps
- **Channel Members**: Each channel has appropriate members assigned

## Features

✅ Login/Register
✅ Create channels
✅ List channels
✅ Send messages
✅ Add members to channels
✅ View channel details
✅ View channel members

## Notes

- Data resets when you refresh the page (in-memory storage)
- All API endpoints are mocked
- Authentication headers are automatically generated
- The creator of a channel is automatically added as a member

