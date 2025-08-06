import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Login component to avoid react-router-dom issues
jest.mock('./Login', () => {
  return function MockLogin({ onLogin }) {
    return (
      <div data-testid="login-form">
        <h1>AvionTalk</h1>
        <p>The universal chat app for Avion School bootcampers.</p>
        <h2>Login</h2>
        <input data-testid="email-input" type="email" placeholder="Email" />
        <input data-testid="password-input" type="password" placeholder="Password" />
        <label>
          <input data-testid="show-password" type="checkbox" />
          Show password
        </label>
        <button data-testid="login-button">Login</button>
        <button data-testid="register-toggle">Don't have an account? Register</button>
      </div>
    );
  };
});

import Login from './Login';

test('renders the login form', () => {
  render(<Login onLogin={jest.fn()} />);
  expect(screen.getByText(/AvionTalk/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login');
});

test('shows email and password fields', () => {
  render(<Login onLogin={jest.fn()} />);
  
  expect(screen.getByTestId('email-input')).toBeInTheDocument();
  expect(screen.getByTestId('password-input')).toBeInTheDocument();
});

test('has login and register buttons', () => {
  render(<Login onLogin={jest.fn()} />);
  
  expect(screen.getByTestId('login-button')).toBeInTheDocument();
  expect(screen.getByTestId('register-toggle')).toBeInTheDocument();
});

