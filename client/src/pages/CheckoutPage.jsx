import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../utils/api';
import './CheckoutPage.css';

function CheckoutPage() {
  const location = useLocation();
  const [cart, setCart] = useState({ items: [] });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    paymentMethod: 'card'
  });
  const navigate = useNavigate();

  // 직접 구매인지 확인
  const directPurchase = location.state?.directPurchase;
  const directItem = location.state?.item;

  useEffect(() => {
    // 포트원 결제 모듈 초기화
    if (window.IMP) {
      const IMP = window.IMP;
      IMP.init('imp04545181');
      console.log('포트원 초기화 완료');
    } else {
      console.error('IMP 객체를 찾을 수 없습니다. iamport.js 스크립트가 로드되었는지 확인하세요.');
    }

    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData(prev => ({
      ...prev,
      recipientName: parsedUser.name,
      shippingAddress: parsedUser.address || ''
    }));

    // 직접 구매인 경우 장바구니를 불러오지 않음
    if (directPurchase) {
      setLoading(false);
    } else {
      fetchCart();
    }
  }, [navigate, directPurchase]);

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 직접 구매인 경우 directItem 사용, 아니면 장바구니 선택 상품 사용
  const selectedItems = directPurchase ? [directItem] : cart.items.filter(item => item.selected);

  const getTotalPrice = () => {
    return selectedItems
      .filter(item => item.product)
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.recipientName || !formData.recipientPhone || !formData.shippingAddress) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    if (selectedItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate(directPurchase ? '/' : '/cart');
      return;
    }

    // 포트원 결제 요청
    if (!window.IMP) {
      alert('결제 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const IMP = window.IMP;
    const merchantUid = `order_${new Date().getTime()}`;

    // 주문 상품명 생성
    const orderName = selectedItems.length > 1
      ? `${selectedItems[0].product.name} 외 ${selectedItems.length - 1}건`
      : selectedItems[0].product.name;

    console.log('결제 요청:', {
      pg: 'html5_inicis',
      amount: getTotalPrice(),
      name: orderName,
      buyer_tel: formData.recipientPhone
    });

    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: formData.paymentMethod,
      merchant_uid: merchantUid,
      name: orderName,
      amount: getTotalPrice(),
      buyer_email: user.email,
      buyer_name: formData.recipientName,
      buyer_tel: formData.recipientPhone,
      buyer_addr: formData.shippingAddress,
      buyer_postcode: ''
    }, async (rsp) => {
      console.log('결제 응답:', rsp);

      if (rsp.success) {
        // 결제 성공 → 주문 생성
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');

          // 주문 데이터 준비
          const orderData = {
            ...formData,
            totalAmount: getTotalPrice()
          };

          // 직접 구매인 경우: 상품 정보를 직접 전달 (장바구니 우회)
          if (directPurchase) {
            orderData.items = [{
              productId: directItem.product._id,
              quantity: directItem.quantity
            }];
          }

          const response = await axios.post(
            `${API_URL}/api/order`,
            orderData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          window.dispatchEvent(new Event('cartUpdated'));
          navigate('/order-success', {
            state: {
              orderData: {
                orderNumber: response.data.data.orderNumber,
                totalAmount: rsp.paid_amount,
                recipientName: formData.recipientName,
                shippingAddress: formData.shippingAddress
              }
            }
          });
        } catch (error) {
          console.error('주문 생성 실패:', error);
          const errorMsg = error.response?.data?.error || error.message;
          navigate('/order-fail', {
            state: {
              errorMessage: `주문 생성에 실패했습니다.\n에러: ${errorMsg}\n\n결제는 완료되었으니 고객센터로 문의해주세요.`
            }
          });
        }
      } else {
        // 결제 실패
        console.error('결제 실패:', rsp.error_msg);
        navigate('/order-fail', {
          state: {
            errorMessage: `결제에 실패했습니다.\n${rsp.error_msg}`
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="checkout-container">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="checkout-container">
          <div className="empty-checkout">
            <p>주문할 상품이 없습니다.</p>
            <button onClick={() => navigate('/cart')} className="back-button">
              장바구니로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="checkout-container">
        <h1 className="checkout-title">주문하기</h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="checkout-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="checkout-items">
              {selectedItems.map(item => (
                <div key={item.product._id} className="checkout-item">
                  <div className="checkout-item-image">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} />
                    ) : (
                      <div className="no-image">이미지 없음</div>
                    )}
                  </div>
                  <div className="checkout-item-info">
                    <div className="checkout-item-name">{item.product.name}</div>
                    <div className="checkout-item-quantity">수량: {item.quantity}개</div>
                    <div className="checkout-item-price">
                      {(item.product.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-section">
            <h2 className="section-title">배송 정보</h2>
            <div className="form-group">
              <label>수령인</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>연락처</label>
              <input
                type="tel"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                placeholder="010-1234-5678"
                required
              />
            </div>
            <div className="form-group">
              <label>배송지</label>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleInputChange}
                placeholder="배송 받을 주소를 입력하세요"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="checkout-section">
            <h2 className="section-title">결제 방법</h2>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleInputChange}
                />
                <span>신용카드</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={handleInputChange}
                />
                <span>계좌이체</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleInputChange}
                />
                <span>무통장입금</span>
              </label>
            </div>
          </div>

          <div className="checkout-summary">
            <div className="summary-row">
              <span>상품 금액</span>
              <span>{getTotalPrice().toLocaleString()}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <div className="summary-total">
              <span>총 결제금액</span>
              <span className="total-price">{getTotalPrice().toLocaleString()}원</span>
            </div>
            <button type="submit" className="submit-checkout-button">
              {getTotalPrice().toLocaleString()}원 결제하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
