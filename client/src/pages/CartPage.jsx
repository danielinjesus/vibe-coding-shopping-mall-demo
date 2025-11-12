import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../utils/api';
import './CartPage.css';

function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    // navigate는 Navbar에서 처리
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/cart/quantity`,
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.data);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('수량 변경에 실패했습니다.');
    }
  };

  const toggleSelect = async (productId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/cart/select`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to toggle select:', error);
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm('장바구니에서 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.data);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const getTotalPrice = () => {
    return cart.items
      .filter(item => item.selected && item.product)
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getSelectedCount = () => {
    return cart.items.filter(item => item.selected).length;
  };

  const handleCheckout = () => {
    if (getSelectedCount() === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="cart-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="cart-container">
        <h1 className="cart-title">장바구니</h1>

        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <p>장바구니가 비어있습니다.</p>
            <Link to="/" className="continue-shopping">쇼핑 계속하기</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.product._id} className="cart-item">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.product._id)}
                    className="item-checkbox"
                  />

                  <Link to={`/product/${item.product._id}`} className="item-image">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} />
                    ) : (
                      <div className="no-image">이미지 없음</div>
                    )}
                  </Link>

                  <div className="item-info">
                    <Link to={`/product/${item.product._id}`} className="item-name">
                      {item.product.name}
                    </Link>
                    <div className="item-category">{item.product.category}</div>
                    <div className="item-price">{item.product.price.toLocaleString()}원</div>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="qty-button"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="qty-button"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </div>

                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="remove-button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>선택 상품 ({getSelectedCount()}개)</span>
                <span className="summary-price">{getTotalPrice().toLocaleString()}원</span>
              </div>
              <div className="summary-total">
                <span>총 결제금액</span>
                <span className="total-price">{getTotalPrice().toLocaleString()}원</span>
              </div>
              <button className="checkout-button" onClick={handleCheckout}>주문하기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
