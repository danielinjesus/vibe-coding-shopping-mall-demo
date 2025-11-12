import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../utils/api';
import './MainPage.css';

function MainPage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      // limit=100으로 설정해서 모든 상품 가져오기
      const response = await axios.get(`${API_URL}/api/products?limit=100`);
      let allProducts = response.data.data || [];

      // 카테고리 필터링
      if (selectedCategory) {
        allProducts = allProducts.filter(product => product.category === selectedCategory);
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
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

  if (loading) {
    return (
      <div className="main-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="main-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="main-container">
        {selectedCategory && (
          <div className="category-header">
            <h2>{selectedCategory} 카테고리</h2>
            <Link to="/" className="show-all-link">전체 상품 보기</Link>
          </div>
        )}

        <div className="product-grid">
          {products.length > 0 ? (
            products.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">이미지</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-category">{product.category}</div>
                  <div className="product-price">{product.price.toLocaleString()}원</div>
                  <div className="product-sku">SKU: {product.sku}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-products">등록된 상품이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
