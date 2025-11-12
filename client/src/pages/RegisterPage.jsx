import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    user_type: 'customer',
    address: ''
  });
  const [error, setError] = useState('');
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
      const response = await axios.post(`${API_URL}/api/users`, formData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      alert(`${response.data.data.name}님 가입을 환영합니다!`);
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.error || '회원가입에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-logo">Shopping Mall</h1>
        <h2 className="register-title">회원가입</h2>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label className="input-label">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 주소를 입력하세요"
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">회원 유형</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="register-select"
            >
              <option value="customer">일반 회원</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">주소 (선택)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="주소를 입력하세요"
              className="register-input"
            />
          </div>

          <button type="submit" className="register-button">
            가입하기
          </button>

          <div className="login-link">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
