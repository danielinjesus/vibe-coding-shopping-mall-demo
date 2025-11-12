import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './OrderFailPage.css';

function OrderFailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const errorMessage = location.state?.errorMessage || '알 수 없는 오류가 발생했습니다.';

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="order-fail-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="order-fail-container">
        <div className="fail-icon">✕</div>
        <h1 className="fail-title">주문 처리에 실패했습니다</h1>

        <div className="fail-message">
          <p className="error-text">{errorMessage}</p>
          <p className="help-text">문제가 계속되면 고객센터로 문의해주세요.</p>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/cart')}>
            장바구니로 돌아가기
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderFailPage;
