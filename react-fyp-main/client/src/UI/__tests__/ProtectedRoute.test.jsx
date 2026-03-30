import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from 'shared/auth/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

const renderRoute = (token, route = '/admin/admin01/alluserdata') =>
  render(
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
      }}
    >
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<div>Login Page</div>} />
          <Route
            path="/admin/:Login_id/*"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('ProtectedRoute', () => {
  it('renders children when token uid matches the route param', () => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJ1aWQiOiJhZG1pbjAxIn0.';

    renderRoute(token);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to the login page when token is missing', () => {
    renderRoute(null);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
