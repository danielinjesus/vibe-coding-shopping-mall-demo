import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../utils/api';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('상품을 불러오는데 실패했습니다.');
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

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/cart`,
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('장바구니에 추가되었습니다.');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    navigate('/checkout', {
      state: {
        directPurchase: true,
        item: {
          product: product,
          quantity: quantity
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="detail-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="detail-container">
          <div className="error-message">{error || '상품을 찾을 수 없습니다.'}</div>
          <button onClick={() => navigate('/')} className="back-to-home">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="detail-container">
        <div className="breadcrumb">
          <Link to="/">홈</Link> &gt; <Link to={`/?category=${product.category}`}>{product.category}</Link> &gt; <span>{product.name}</span>
        </div>

        <div className="product-detail-content">
          <div className="product-image-section">
            <div className="main-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="no-image-placeholder">이미지 없음</div>
              )}
            </div>
          </div>

          <div className="product-info-section">
            <div className="category-badge">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-price-section">
              <div className="price-label">판매가</div>
              <div className="price">{product.price.toLocaleString()}원</div>
            </div>

            <div className="product-meta">
              <div className="meta-row">
                <span className="meta-label">SKU</span>
                <span className="meta-value">{product.sku}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">카테고리</span>
                <span className="meta-value">{product.category}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">수량</span>
                <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange(-1)} className="qty-btn">-</button>
                  <span className="qty-display">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="qty-btn">+</button>
                </div>
              </div>
            </div>

            <div className="purchase-section">
              <button
                className="add-to-cart-button"
                onClick={handleAddToCart}
              >
                장바구니 담기
              </button>
              <button className="buy-now-button" onClick={handleBuyNow}>바로 구매</button>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="product-description-section">
            <h2>상품 상세 정보</h2>
            <div className="description-content">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
