import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      if (user) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(response.data.data.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    setCartCount(0);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          네이버 짝퉁
        </Link>

        <div className="navbar-search">
          <input type="text" placeholder="상품을 검색해보세요" />
          <button className="search-btn">검색</button>
        </div>

        <div className="navbar-actions">
          {user && (
            <Link to="/cart" className="cart-btn">
              🛒 장바구니
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <>
              <div className="user-menu">
                <button onClick={toggleDropdown} className="user-btn">
                  {user.name}님 환영합니다
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link to="/my-orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      주문내역
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      로그아웃
                    </button>
                  </div>
                )}
              </div>

              {user.user_type === 'admin' && (
                <Link to="/admin" className="admin-btn">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" className="login-btn">
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
