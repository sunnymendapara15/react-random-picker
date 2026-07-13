import React, { useMemo, useState } from 'react';
import '../styles/AuthPanel.css';

const roles = ['Member', 'Moderator', 'Admin'];

const AuthPanel = ({ currentUser, onLogin, onSignup, message }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Member' });
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  const passwordHint = useMemo(() => {
    if (!signupForm.password) {
      return 'Use 8+ characters.';
    }
    return signupForm.password.length < 8 ? 'Password needs more characters.' : 'Looks good!';
  }, [signupForm.password]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Enter an email and password.');
      return;
    }
    const result = await onLogin(loginForm);
    if (!result.success) {
      setLoginError(result.message);
    } else {
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setSignupError('All fields are required.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords must match.');
      return;
    }

    const result = await onSignup({
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
      role: signupForm.role,
    });

    if (!result.success) {
      setSignupError(result.message);
      return;
    }

    setSignupSuccess(result.message);
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '', role: 'Member' });
  };

  return (
    <div className="auth-panel">
      <div className="panel-header">
        <h3>Authentication</h3>
        <p className="panel-subtitle">Sign in or onboard a teammate to unlock the user dashboard.</p>
      </div>
      <div className="auth-grid">
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <h4>Login</h4>
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            value={loginForm.email}
            placeholder="you@email.com"
            onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="password"
            value={loginForm.password}
            placeholder="••••••••"
            onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          {loginError && <p className="form-error">{loginError}</p>}
          <button className="primary-btn" type="submit">
            Sign in
          </button>
        </form>
        <form className="auth-form" onSubmit={handleSignupSubmit}>
          <h4>Signup</h4>
          <label htmlFor="signupName">Full name</label>
          <input
            id="signupName"
            type="text"
            value={signupForm.name}
            placeholder="Team Member"
            onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <label htmlFor="signupEmail">Email</label>
          <input
            id="signupEmail"
            type="email"
            value={signupForm.email}
            placeholder="new@agency.com"
            onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <label htmlFor="signupPassword">Password</label>
          <input
            id="signupPassword"
            type="password"
            value={signupForm.password}
            placeholder="8+ characters"
            onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <p className={`password-hint ${signupForm.password.length >= 8 ? 'valid' : ''}`}>{passwordHint}</p>
          <label htmlFor="signupConfirm">Confirm password</label>
          <input
            id="signupConfirm"
            type="password"
            value={signupForm.confirmPassword}
            placeholder="Repeat password"
            onChange={(event) => setSignupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
          />
          <label htmlFor="signupRole">Role</label>
          <select
            id="signupRole"
            value={signupForm.role}
            onChange={(event) => setSignupForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {signupError && <p className="form-error">{signupError}</p>}
          <button className="primary-btn" type="submit">
            Create account
          </button>
          {signupSuccess && <p className="form-success">{signupSuccess}</p>}
        </form>
      </div>
      {message && (
        <p className="auth-panel-message">
          {currentUser ? `Signed in as ${currentUser.name}.` : message}
        </p>
      )}
    </div>
  );
};

export default AuthPanel;
