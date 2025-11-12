import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import './LoginPage.css';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, formData);

      const storage = autoLogin ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
      storage.setItem('user', JSON.stringify(response.data.data));
      alert(`${response.data.data.name}님 환영합니다!`);
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || '로그인에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-logo">Shopping Mall</h1>

        <div className="login-tabs">
          <div className="tab active">
            <span className="tab-icon">📧</span>
            이메일 로그인
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 주소"
              required
              className="login-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              required
              className="login-input"
            />
          </div>

          <div className="login-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              <span>로그인 상태 유지</span>
            </label>
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>

          <div className="signup-link">
            처음 오셨나요? <Link to="/register">회원가입</Link>
          </div>
        </form>

        <div className="login-footer">
          <Link to="/find-password">비밀번호 찾기</Link>
          <span className="divider">|</span>
          <Link to="/find-email">이메일 찾기</Link>
          <span className="divider">|</span>
          <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
