// API Base URL 설정
// 개발 시: localhost 사용
// 모바일 테스트: PC IP 사용
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
