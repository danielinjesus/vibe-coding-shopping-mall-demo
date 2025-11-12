import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../utils/api';
import './ProductCreatePage.css';

function ProductCreatePage() {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cloudinary 위젯 초기화
  const openCloudinaryWidget = () => {
    console.log('버튼 클릭됨');
    console.log('window.cloudinary:', window.cloudinary);
    console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    if (!window.cloudinary) {
      alert('Cloudinary 스크립트가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxImageFileSize: 2000000,
        clientAllowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          return;
        }
        if (result && result.event === 'success') {
          console.log('Upload success:', result.info);
          setFormData(prev => ({
            ...prev,
            image: result.info.secure_url
          }));
        }
      }
    );
    widget.open();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: Number(formData.price)
      };

      await axios.post(`${API_URL}/api/products`, submitData);
      alert('상품이 성공적으로 등록되었습니다.');
      navigate('/admin');
    } catch (error) {
      console.error('Failed to create product:', error);
      setError(error.response?.data?.error || '상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-create-page">
      <div className="product-create-container">
        <h1 className="product-create-title">새 상품 등록</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="예: COMP-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">상품명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="상품 이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">가격 *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">카테고리 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">카테고리를 선택하세요</option>
              <option value="컴퓨터">컴퓨터</option>
              <option value="노트북">노트북</option>
              <option value="GPU">GPU</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">상품 이미지</label>
            <button
              type="button"
              className="upload-button"
              onClick={openCloudinaryWidget}
            >
              이미지 업로드
            </button>
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="상품 미리보기" />
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                >
                  ✕ 제거
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="상품 설명을 입력하세요"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? '등록 중...' : '상품 등록'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/admin')}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductCreatePage;
