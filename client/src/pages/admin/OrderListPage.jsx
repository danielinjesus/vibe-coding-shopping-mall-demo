import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../utils/api';
import './OrderListPage.css';

function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // 관리자 권한 체크
    if (user.user_type !== 'admin') {
      alert('관리자만 접근 가능합니다.');
      navigate('/');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('주문 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/order/${orderId}/status`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('주문 상태가 변경되었습니다.');
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('주문 상태 변경에 실패했습니다.');
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
      pending: '대기',
      confirmed: '확인',
      shipping: '배송중',
      delivered: '완료',
      cancelled: '취소'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="order-list-page">
        <div className="order-list-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list-page">
      <div className="order-list-container">
        <div className="order-list-header">
          <h1 className="order-list-title">주문 관리</h1>
          <div className="header-buttons">
            <Link to="/" className="home-button">
              홈으로 가기
            </Link>
            <Link to="/admin" className="back-button">
              돌아가기
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-label">전체 주문</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">대기중</div>
            <div className="stat-value">
              {orders.filter(o => o.orderStatus === 'pending').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">배송중</div>
            <div className="stat-value">
              {orders.filter(o => o.orderStatus === 'shipping').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">완료</div>
            <div className="stat-value">
              {orders.filter(o => o.orderStatus === 'delivered').length}
            </div>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>주문일시</th>
                <th>고객정보</th>
                <th>주문상품</th>
                <th>금액</th>
                <th>결제방법</th>
                <th>주문상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-number">{order.orderNumber}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      <br />
                      <small>{new Date(order.createdAt).toLocaleTimeString('ko-KR')}</small>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div>{order.user?.name || '-'}</div>
                        <small>{order.user?.email || '-'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="order-items-cell">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-row">
                            {item.product?.name || '삭제된 상품'} x {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="amount-cell">
                      {order.totalAmount.toLocaleString()}원
                    </td>
                    <td>
                      {order.paymentMethod === 'card' && '카드'}
                      {order.paymentMethod === 'transfer' && '계좌이체'}
                      {order.paymentMethod === 'cash' && '무통장입금'}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="pending">대기</option>
                        <option value="confirmed">확인</option>
                        <option value="shipping">배송중</option>
                        <option value="delivered">완료</option>
                        <option value="cancelled">취소</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">등록된 주문이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-count">
          총 {orders.length}개의 주문
        </div>
      </div>
    </div>
  );
}

export default OrderListPage;
