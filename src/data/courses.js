/**
 * 골프장 기본 데이터
 * 송파구 기준 거리 (km), 실제 API 연동 전 기준 데이터로 사용
 */

export const REGIONS = [
  { id: 'all',       label: '전체',  emoji: '🌐' },
  { id: 'chuncheon', label: '춘천',  emoji: '🏔️' },
  { id: 'pocheon',   label: '포천',  emoji: '🌲' },
  { id: 'yongin',    label: '용인',  emoji: '🏙️' },
  { id: 'anseong',   label: '안성',  emoji: '🌾' },
  { id: 'chungju',   label: '충주',  emoji: '🏞️' },
  { id: 'yeoju',     label: '여주',  emoji: '🌊' },
  { id: 'icheon',    label: '이천',  emoji: '🌿' },
];

export const PLATFORMS = [
  { id: 'golfmon',     label: '골프몬',   color: '#00C471', logo: '⛳', url: 'https://golfmon.co.kr'    },
  { id: 'golfang',     label: '골팡',     color: '#FF6B35', logo: '🏌️', url: 'https://golfang.com'      },
  { id: 'joinbooking', label: '조인부킹', color: '#4A90E2', logo: '🤝', url: 'https://joinbooking.com'  },
];

export const GOLF_COURSES = [
  { id: 1,  name: '천마산 CC',        region: 'chuncheon', address: '강원 춘천시', distance: 72,  holes: 18, platform: 'golfmon',     basePrice: 95000,  rating: 4.3, greenFee: '포함', cart: '포함', caddie: '선택',   image: '🏔️' },
  { id: 2,  name: '라비돌 리조트',    region: 'pocheon',   address: '경기 포천시', distance: 58,  holes: 27, platform: 'golfmon',     basePrice: 110000, rating: 4.5, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🌲' },
  { id: 3,  name: '힐크레스트 CC',    region: 'yongin',    address: '경기 용인시', distance: 35,  holes: 18, platform: 'golfang',     basePrice: 145000, rating: 4.7, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🏙️' },
  { id: 4,  name: '안성 베네스트',    region: 'anseong',   address: '경기 안성시', distance: 65,  holes: 18, platform: 'golfang',     basePrice: 88000,  rating: 4.2, greenFee: '포함', cart: '포함', caddie: '선택',   image: '🌾' },
  { id: 5,  name: '충주 스카이힐',    region: 'chungju',   address: '충북 충주시', distance: 95,  holes: 18, platform: 'joinbooking', basePrice: 72000,  rating: 4.0, greenFee: '포함', cart: '포함', caddie: '불포함', image: '🏞️' },
  { id: 6,  name: '여주 스타힐스',    region: 'yeoju',     address: '경기 여주시', distance: 68,  holes: 18, platform: 'golfmon',     basePrice: 105000, rating: 4.4, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🌊' },
  { id: 7,  name: '블랙스톤 이천',    region: 'icheon',    address: '경기 이천시', distance: 55,  holes: 27, platform: 'golfang',     basePrice: 160000, rating: 4.8, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🌿' },
  { id: 8,  name: '포천 아도니스',    region: 'pocheon',   address: '경기 포천시', distance: 62,  holes: 18, platform: 'joinbooking', basePrice: 98000,  rating: 4.3, greenFee: '포함', cart: '포함', caddie: '선택',   image: '🌲' },
  { id: 9,  name: '춘천 레이크사이드',region: 'chuncheon', address: '강원 춘천시', distance: 78,  holes: 18, platform: 'golfang',     basePrice: 85000,  rating: 4.1, greenFee: '포함', cart: '포함', caddie: '선택',   image: '🏔️' },
  { id: 10, name: '용인 성남 CC',     region: 'yongin',    address: '경기 용인시', distance: 38,  holes: 18, platform: 'joinbooking', basePrice: 135000, rating: 4.6, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🏙️' },
  { id: 11, name: '이천 미래에셋 CC', region: 'icheon',    address: '경기 이천시', distance: 52,  holes: 18, platform: 'golfmon',     basePrice: 118000, rating: 4.5, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🌿' },
  { id: 12, name: '여주 골프랜드',    region: 'yeoju',     address: '경기 여주시', distance: 71,  holes: 18, platform: 'joinbooking', basePrice: 78000,  rating: 3.9, greenFee: '포함', cart: '포함', caddie: '불포함', image: '🌊' },
  { id: 13, name: '포천 베어즈베스트',region: 'pocheon',   address: '경기 포천시', distance: 60,  holes: 18, platform: 'golfmon',     basePrice: 155000, rating: 4.6, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🌲' },
  { id: 14, name: '안성Q 리조트',     region: 'anseong',   address: '경기 안성시', distance: 70,  holes: 27, platform: 'golfang',     basePrice: 92000,  rating: 4.3, greenFee: '포함', cart: '포함', caddie: '선택',   image: '🌾' },
  { id: 15, name: '용인 레이크우드',  region: 'yongin',    address: '경기 용인시', distance: 42,  holes: 18, platform: 'joinbooking', basePrice: 128000, rating: 4.4, greenFee: '포함', cart: '포함', caddie: '포함',   image: '🏙️' },
];

/** 향후 30일 주말/공휴일 날짜 리스트 */
export function getWeekendDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      dates.push({
        date: d.toISOString().split('T')[0],
        label: `${d.getMonth() + 1}/${d.getDate()}(${['일','월','화','수','목','금','토'][dow]})`,
        isHoliday: dow === 0,
      });
    }
  }
  return dates.slice(0, 10);
}
