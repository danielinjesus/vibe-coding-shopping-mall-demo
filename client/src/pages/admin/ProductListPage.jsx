import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../utils/api';
import './ProductListPage.css';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 2
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // 관리자 권한 체크
    if (user.user_type !== 'admin') {
      alert('관리자만 접근 가능합니다.');
      navigate('/');
      return;
    }

    fetchProducts(currentPage);
  }, [navigate, currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products?page=${page}&limit=2`);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('상품 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 상품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      alert('상품이 삭제되었습니다.');
      fetchProducts(currentPage); // 현재 페이지 유지
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="product-list-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="product-list-container">
        <div className="product-list-header">
          <h1 className="product-list-title">상품 관리</h1>
          <div className="header-buttons">
            <Link to="/admin/product/create" className="create-button">
              새상품 등록
            </Link>
            <Link to="/" className="home-button">
              홈으로 가기
            </Link>
            <Link to="/admin" className="back-button">
              돌아가기
            </Link>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>이미지</th>
                <th>SKU</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-image-cell">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                      </div>
                    </td>
                    <td className="sku-cell">{product.sku}</td>
                    <td className="name-cell">{product.name}</td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td className="price-cell">{product.price.toLocaleString()}원</td>
                    <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/product/edit/${product._id}`} className="edit-button">
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="delete-button"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">등록된 상품이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            총 {pagination.totalCount}개의 상품 (페이지 {pagination.currentPage}/{pagination.totalPages})
          </div>

          <div className="pagination-buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-button"
            >
              이전
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="page-button"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListPage;
