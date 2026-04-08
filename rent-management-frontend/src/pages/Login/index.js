import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../../SettyRents.png';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://demo-production-bf0f.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid Username or Password');
      }
    } catch (err) {
      setError('Server Error: ' + err.message);
    }
  };

  return (
    <div className='login-container'>
      <form className='login-card' onSubmit={handleSubmit}>
        <img src={logo} alt='logo' className='login-logo' />

        <label htmlFor='username'>Username</label>
        <input
          id='username'
          type='text'
          placeholder='Enter username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete='username'
          required
        />

        <label htmlFor='password'>Password</label>
        <div className='password-wrapper'>
          <input
            id='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
            required
          />
          <button
            type='button'
            className='toggle-password-btn'
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && <p className='error'>{error}</p>}

        <button type='submit' className='login-btn'>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login
