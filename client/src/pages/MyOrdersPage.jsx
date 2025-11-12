import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../utils/api';
import './MyOrdersPage.css';

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('주문 내역을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/order/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('주문이 취소되었습니다.');
      fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.response?.data?.error || '주문 취소에 실패했습니다.');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      shipping: 'status-shipping',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '주문대기',
      confirmed: '주문확인',
      shipping: '배송중',
      delivered: '배송완료',
      cancelled: '주문취소'
    };
    return statusMap[status] || status;
  };

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '주문대기' },
    { id: 'confirmed', label: '주문확인' },
    { id: 'shipping', label: '배송중' },
    { id: 'delivered', label: '배송완료' },
    { id: 'cancelled', label: '주문취소' }
  ];

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.orderStatus === activeTab);

  const getOrderCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.orderStatus === status).length;
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="my-orders-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="my-orders-container">
        <h1 className="my-orders-title">주문 내역</h1>

        {/* 탭 메뉴 */}
        <div className="order-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">({getOrderCount(tab.id)})</span>
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <p>주문 내역이 없습니다.</p>
            <button onClick={() => navigate('/')} className="continue-shopping">
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-number">주문번호: {order.orderNumber}</div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="order-status-badge">
                    <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="item-image">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.product?.name || '삭제된 상품'}</div>
                        <div className="item-quantity">수량: {item.quantity}개</div>
                        {item.product && (
                          <div className="item-price">
                            {(item.product.price * item.quantity).toLocaleString()}원
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="label">배송지</span>
                      <span className="value">{order.shippingAddress}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">수령인</span>
                      <span className="value">{order.recipientName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">연락처</span>
                      <span className="value">{order.recipientPhone}</span>
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="total-amount">
                      총 결제금액: <strong>{order.totalAmount.toLocaleString()}원</strong>
                    </div>
                    {order.orderStatus === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="cancel-order-button"
                      >
                        주문 취소
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
