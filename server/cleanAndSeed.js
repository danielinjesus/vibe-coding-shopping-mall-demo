require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const sampleProducts = [
  // GPU 3개
  {
    sku: 'GPU-RTX4090',
    name: 'NVIDIA GeForce RTX 4090',
    price: 101,
    category: 'GPU',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
    description: '최고 성능의 게이밍 GPU, 24GB GDDR6X, Ada Lovelace 아키텍처'
  },
  {
    sku: 'GPU-RTX4080',
    name: 'NVIDIA GeForce RTX 4080 SUPER',
    price: 103,
    category: 'GPU',
    image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=500',
    description: '고성능 게이밍 및 크리에이티브 작업용 GPU, 16GB GDDR6X'
  },
  {
    sku: 'GPU-RX7900XTX',
    name: 'AMD Radeon RX 7900 XTX',
    price: 105,
    category: 'GPU',
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=500',
    description: 'AMD 최상위 GPU, 24GB GDDR6, RDNA 3 아키텍처, 4K 게이밍'
  },

  // 패드 3개
  {
    sku: 'PAD-IPAD-PRO',
    name: 'Apple iPad Pro 12.9" M2',
    price: 107,
    category: '컴퓨터',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    description: 'M2 칩, 12.9인치 Liquid Retina XDR 디스플레이, 256GB'
  },
  {
    sku: 'PAD-TAB-S9',
    name: 'Samsung Galaxy Tab S9 Ultra',
    price: 109,
    category: '컴퓨터',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500',
    description: '14.6인치 Dynamic AMOLED, S펜 포함, 12GB RAM, 256GB'
  },
  {
    sku: 'PAD-SURFACE-PRO9',
    name: 'Microsoft Surface Pro 9',
    price: 111,
    category: '컴퓨터',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
    description: 'Intel Core i7, 13인치 PixelSense 터치스크린, 16GB RAM, 256GB SSD'
  },

  // 노트북 3개
  {
    sku: 'NB-MACBOOK-PRO16',
    name: 'Apple MacBook Pro 16" M3 Max',
    price: 113,
    category: '노트북',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    description: 'M3 Max 칩, 16인치 Liquid Retina XDR, 36GB RAM, 1TB SSD, 스페이스 블랙'
  },
  {
    sku: 'NB-RAZER-BLADE18',
    name: 'Razer Blade 18 Gaming Laptop',
    price: 115,
    category: '노트북',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
    description: 'Intel i9-13950HX, RTX 4090, 18인치 QHD+ 240Hz, 32GB RAM, 2TB SSD'
  },
  {
    sku: 'NB-LEGION-PRO7',
    name: 'Lenovo Legion Pro 7i Gen 9',
    price: 117,
    category: '노트북',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    description: 'Intel Core i9-14900HX, RTX 4080, 16인치 WQXGA 240Hz, 32GB RAM, 1TB SSD'
  }
];

const sampleUsers = [
  { email: 'kim.minsoo@example.com', name: '김민수', password: '1111', user_type: 'customer' },
  { email: 'lee.jieun@example.com', name: '이지은', password: '1111', user_type: 'customer' },
  { email: 'park.junho@example.com', name: '박준호', password: '1111', user_type: 'customer' },
  { email: 'choi.seoyeon@example.com', name: '최서연', password: '1111', user_type: 'customer' },
  { email: 'jung.hyunwoo@example.com', name: '정현우', password: '1111', user_type: 'customer' }
];

async function cleanAndSeed() {
  try {
    // MongoDB 연결
    await mongoose.connect(
      process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-mall'
    );
    console.log('✓ MongoDB 연결 성공\n');

    // 모든 제품 삭제
    const deletedProducts = await Product.deleteMany({});
    console.log(`🗑️  기존 제품 ${deletedProducts.deletedCount}개 삭제 완료`);

    // 새 제품 추가
    const products = await Product.insertMany(sampleProducts);
    console.log(`✓ 새 제품 ${products.length}개 추가 완료\n`);

    // 사용자 추가 (기존 사용자는 건너뜀)
    console.log('👥 사용자 추가 중...');
    let addedUsers = 0;
    let skippedUsers = 0;

    for (const userData of sampleUsers) {
      try {
        await User.create(userData);
        console.log(`✓ ${userData.name} 추가`);
        addedUsers++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`- ${userData.name} 이미 존재 (건너뜀)`);
          skippedUsers++;
        } else {
          console.error(`✗ ${userData.name} 실패:`, error.message);
        }
      }
    }

    console.log(`\n=== 완료! ===`);
    console.log(`제품: ${products.length}개`);
    console.log(`사용자: ${addedUsers}개 추가, ${skippedUsers}개 건너뜀`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

cleanAndSeed();
