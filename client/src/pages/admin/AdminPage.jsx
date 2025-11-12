import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../utils/api';
import './AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
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

    // 회원 목록 가져오기
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('회원 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">관리자 페이지</h1>
          <Link to="/" className="home-button">
            홈으로 가기
          </Link>
        </div>

        <div className="admin-menu-grid">
          <Link to="/admin/products" className="admin-menu-card">
            <div className="menu-icon">📦</div>
            <h2>상품 관리</h2>
            <p>상품 등록, 수정, 삭제</p>
          </Link>
          <Link to="/admin/orders" className="admin-menu-card">
            <div className="menu-icon">📋</div>
            <h2>주문 관리</h2>
            <p>주문 내역 및 상태 관리</p>
          </Link>
        </div>

        <h2 className="section-title">회원 목록</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>이름</th>
                <th>회원 유형</th>
                <th>주소</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id || user.email}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`badge ${user.user_type === 'admin' ? 'badge-admin' : 'badge-customer'}`}>
                        {user.user_type === 'admin' ? '관리자' : '일반 회원'}
                      </span>
                    </td>
                    <td>{user.address || '-'}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">등록된 회원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="users-count">
          총 {users.length}명의 회원
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
