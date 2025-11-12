import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const orderData = location.state?.orderData;

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 주문 데이터가 없으면 메인으로
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!orderData) {
    return null;
  }

  return (
    <div className="order-success-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="order-success-container">
        <div className="success-icon">✓</div>
        <h1 className="success-title">주문이 완료되었습니다!</h1>

        <div className="order-info">
          <div className="info-row">
            <span className="info-label">주문번호</span>
            <span className="info-value">{orderData.orderNumber}</span>
          </div>
          <div className="info-row">
            <span className="info-label">결제금액</span>
            <span className="info-value highlight">{orderData.totalAmount?.toLocaleString()}원</span>
          </div>
          <div className="info-row">
            <span className="info-label">수령인</span>
            <span className="info-value">{orderData.recipientName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">배송지</span>
            <span className="info-value">{orderData.shippingAddress}</span>
          </div>
        </div>

        <div className="success-message">
          <p>주문하신 상품을 빠르게 배송해드리겠습니다.</p>
          <p>주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/my-orders')}>
            주문 내역 보기
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
