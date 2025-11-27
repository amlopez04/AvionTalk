# AvionTalk

A modern team communication platform built with React that enables real-time messaging, channel management, and seamless team collaboration. Inspired by Slack, AvionTalk provides a clean and intuitive interface for teams to stay connected and productive.

## Screenshots

### Login Page

![Login Page](Slack%20app%20log%20in%20page.png)

### Home Dashboard

![Home Dashboard](Slack%20app%20Home.png)

### Channel Management

![Channel Management](Slack%20app%20channel%20view.png)

### Direct Messaging

![Direct Messaging](Slack%20app%20direct%20message.png)

## Features

* **User Authentication & Authorization**
  * Secure user registration and login
  * Protected routes with authentication guards
  * Session management with token-based authentication
  * Automatic token refresh and validation

* **Channel Management**
  * Create and manage team channels
  * Browse available channels
  * View channel details and members
  * Real-time channel updates

* **Real-time Messaging**
  * Send and receive messages in channels
  * Direct messaging between users
  * Message history and conversation threads
  * Timestamp tracking for all messages

* **User Management**
  * View all team members
  * User profiles and information
  * Member search and discovery
  * User activity tracking

* **Protected Routes**
  * Secure navigation with route guards
  * Automatic redirect to login for unauthenticated users
  * Seamless authentication flow

* **Mock API Support**
  * Development mode with Mock Service Worker (MSW)
  * Pre-seeded test data for development
  * Offline development capabilities
  * Easy API mocking and testing

* **Modern UI/UX**
  * Material-UI components for consistent design
  * Responsive layout for all screen sizes
  * Intuitive navigation and user experience
  * Clean and modern interface

## Tech Stack

* **Framework**: React 19.1.0
* **Routing**: React Router DOM 7.7.1
* **UI Library**: Material-UI (MUI) 7.2.0
* **UI Components**: Ant Design 5.26.3
* **HTTP Client**: Axios 1.11.0
* **Build Tool**: Create React App / React Scripts 5.0.1
* **Styling**: CSS3, Tailwind CSS 4.1.11
* **Testing**: Jest, React Testing Library
* **Mocking**: Mock Service Worker (MSW)
* **State Management**: React Context API
* **Icons**: Material-UI Icons, Ant Design Icons

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AvionTalk.git
   cd AvionTalk/SlackMain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `SlackMain` directory:
   ```env
   REACT_APP_API_URL=https://slack-api.up.railway.app/api/v1
   ```
   Or use the default API URL if not specified.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Visit the application**
   Open your browser and navigate to `http://localhost:3000`

## Configuration

### API Configuration

The application connects to a backend API for data. Configure the API URL via environment variables:

* `REACT_APP_API_URL` - Backend API endpoint (default: `https://slack-api.up.railway.app/api/v1`)

### Mock API (Development)

The application includes Mock Service Worker (MSW) for development:

* Mock API runs automatically in development mode
* Pre-seeded test users available:
  * `alex@avion.com` - Admin/Team Lead
  * `sarah@avion.com` - Team Member
  * `mike@avion.com` - Developer
  * `emily@avion.com` - Designer
  * `david@avion.com` - Team Member
* Default password for all test users: `password`

### Authentication

The app uses token-based authentication with the following headers:
* `access-token`
* `client`
* `expiry`
* `uid`

These are automatically managed by the `DataProvider` context.

## Usage

### For Users

1. **Login**
   - Navigate to `/login`
   - Enter your email and password
   - Access the dashboard upon successful authentication

2. **Browse Channels**
   - Go to `/channels` to view all available channels
   - Create new channels by entering a channel name
   - Click on a channel to enter the channel room

3. **Send Messages**
   - In channel rooms, type your message and click send
   - View message history and timestamps
   - Messages are displayed with sender information

4. **Direct Messaging**
   - Navigate to `/message` to send direct messages
   - Select a user from the home page to start a conversation
   - View conversation history

5. **View Team Members**
   - Check the home page to see all team members
   - View recent messages and activity

### For Developers

1. **Development Mode**
   - Run `npm start` for development server
   - Mock API automatically enabled in development
   - Hot reload enabled for instant updates

2. **Building for Production**
   ```bash
   npm run build
   ```
   Creates an optimized production build in the `build` folder.

3. **Running Tests**
   ```bash
   npm test
   ```
   Launches the test runner in interactive watch mode.

## Testing

Run the test suite with Jest:

```bash
npm test
```

For specific test files:

```bash
npm test -- Login.test.jsx
```

The application includes:
* Unit tests for components
* Integration tests for user flows
* Mock API testing with MSW

## Project Structure

```
SlackMain/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── mockServiceWorker.js
├── src/
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── Navigation.jsx
│   │   │   └── Navigation.css
│   │   └── ProtectedRoute/
│   │       └── ProtectedRoute.jsx
│   ├── context/
│   │   └── DataProvider.jsx
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   └── Home.css
│   │   ├── Login/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   └── Login.test.jsx
│   │   ├── Message/
│   │   │   ├── Message.jsx
│   │   │   └── Message.css
│   │   ├── Channels/
│   │   │   ├── ChannelList.jsx
│   │   │   ├── ChannelList.css
│   │   │   ├── ChannelRoom.jsx
│   │   │   └── ChannelRoom.css
│   │   └── NotFound/
│   │       └── NotFound.jsx
│   ├── mocks/
│   │   ├── browser.js
│   │   ├── handlers.js
│   │   └── README.md
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .dockerignore
├── .gitignore
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## Deployment

This application can be deployed using Docker and Coolify. See the deployment configuration files:

* `Dockerfile` - Multi-stage Docker build configuration
* `nginx.conf` - Nginx server configuration for production
* `.dockerignore` - Files excluded from Docker build

For detailed deployment instructions, refer to the deployment documentation (if available).

### Quick Deploy to Coolify

1. Push your code to GitHub repository `AvionTalk`
2. In Coolify dashboard, create a new resource
3. Connect your `AvionTalk` repository
4. Select "Dockerfile" as build pack
5. Set port to `80`
6. Deploy!

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App to get full control over configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## About

A team communication platform project built with React. This application demonstrates modern React development practices including:

* Component-based architecture
* Context API for state management
* Protected routing
* API integration
* Mock service worker for development
* Material-UI for modern design

## License

This project is open source and available for educational purposes.

## Resources

* [React Documentation](https://reactjs.org/)
* [Material-UI Documentation](https://mui.com/)
* [React Router Documentation](https://reactrouter.com/)
* [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
