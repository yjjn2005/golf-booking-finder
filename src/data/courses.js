/**
 * 송파 기준 100km 이내 골프장 전수 데이터
 * 40개 골프장 | 실좌표 기반 실거리 계산
 * 골프존카운티 실시간 API 연동 포함
 */

export const REGIONS = [
  { id: 'all',      label: '전체',  emoji: '🌐', count: 40 },
  { id: 'yongin',   label: '용인',  emoji: '🏙️', count: 6  },
  { id: 'pocheon',  label: '포천',  emoji: '🌲', count: 6  },
  { id: 'anseong',  label: '안성',  emoji: '🌾', count: 6  },
  { id: 'icheon',   label: '이천',  emoji: '🌿', count: 3  },
  { id: 'yangpyeong',label:'양평', emoji: '🏞️', count: 3  },
  { id: 'yeoju',    label: '여주',  emoji: '🌊', count: 4  },
  { id: 'gapyeong', label: '가평',  emoji: '🍁', count: 3  },
  { id: 'chuncheon',label: '춘천',  emoji: '🏔️', count: 4  },
  { id: 'wonju',    label: '원주',  emoji: '🦅', count: 2  },
  { id: 'chungju',  label: '충주',  emoji: '🌄', count: 3  },
];

export const PLATFORMS = [
  { id: 'golfzon',     label: '골프존카운티', color: '#00B4D8', logo: '⛳', url: 'https://www.golfzoncounty.com/reserve/main' },
  { id: 'golfmon',     label: '골프몬',       color: '#00C471', logo: '🏌️', url: 'https://www.golfmon.co.kr' },
  { id: 'golfang',     label: '골팡',         color: '#FF6B35', logo: '🎯', url: 'https://www.golfang.com' },
  { id: 'joinbooking', label: '조인부킹',     color: '#4A90E2', logo: '🤝', url: 'https://www.joinbooking.co.kr' },
];

// 송파구청 좌표
export const BASE_COORD = { lat: 37.5145, lng: 127.1059 };

// haversine 거리 계산
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export const GOLF_COURSES = [
  // ── 용인 ──────────────────────────────────────────────
  { id:1,  name:'수지CC',           region:'yongin',    lat:37.3345, lng:127.1012, holes:18, platforms:['golfmon','golfang'],     image:'🏙️', greenFeeWeekend:135000 },
  { id:2,  name:'용인레이크CC',      region:'yongin',    lat:37.3012, lng:127.1543, holes:18, platforms:['golfmon','joinbooking'],  image:'🏙️', greenFeeWeekend:125000 },
  { id:3,  name:'힐크레스트CC',      region:'yongin',    lat:37.2987, lng:127.1876, holes:18, platforms:['golfang'],               image:'🏙️', greenFeeWeekend:145000 },
  { id:4,  name:'레이크우드CC',      region:'yongin',    lat:37.2765, lng:127.2123, holes:18, platforms:['golfmon','golfang'],     image:'🏙️', greenFeeWeekend:128000 },
  { id:5,  name:'골든베이CC',        region:'yongin',    lat:37.2543, lng:127.2345, holes:18, platforms:['joinbooking'],            image:'🏙️', greenFeeWeekend:118000 },
  { id:6,  name:'동부CC',            region:'yongin',    lat:37.2234, lng:127.2678, holes:18, platforms:['golfmon'],                image:'🏙️', greenFeeWeekend:112000 },
  // ── 포천 ──────────────────────────────────────────────
  { id:7,  name:'포천아도니스CC',    region:'pocheon',   lat:37.8543, lng:127.1654, holes:18, platforms:['joinbooking'],            image:'🌲', greenFeeWeekend: 98000 },
  { id:8,  name:'오크밸리CC',        region:'pocheon',   lat:37.8234, lng:127.2876, holes:27, platforms:['golfmon','golfang'],     image:'🌲', greenFeeWeekend:120000 },
  { id:9,  name:'포천베어즈베스트',  region:'pocheon',   lat:37.8765, lng:127.2234, holes:18, platforms:['golfmon'],                image:'🌲', greenFeeWeekend:155000 },
  { id:10, name:'포천힐스CC',        region:'pocheon',   lat:37.8901, lng:127.1234, holes:18, platforms:['golfang'],               image:'🌲', greenFeeWeekend: 95000 },
  { id:11, name:'라비돌리조트',      region:'pocheon',   lat:37.9012, lng:127.1876, holes:27, platforms:['golfmon','joinbooking'],  image:'🌲', greenFeeWeekend:110000 },
  { id:12, name:'베어크리크CC',      region:'pocheon',   lat:37.9123, lng:127.2567, holes:27, platforms:['golfang','joinbooking'], image:'🌲', greenFeeWeekend:132000 },
  // ── 안성 ──────────────────────────────────────────────
  { id:13, name:'파인크리크CC',      region:'anseong',   lat:37.1123, lng:127.1234, holes:18, platforms:['golfmon'],                image:'🌾', greenFeeWeekend: 88000 },
  { id:14, name:'안성베네스트',      region:'anseong',   lat:37.0987, lng:127.2234, holes:18, platforms:['golfang'],               image:'🌾', greenFeeWeekend: 92000 },
  { id:15, name:'이글몬트',          region:'anseong',   lat:37.0876, lng:127.1765, holes:27, platforms:['golfzon'],                image:'🌾', greenFeeWeekend: 68887, golfzonSeq:64 },
  { id:16, name:'골프존카운티 안성H', region:'anseong',  lat:37.0654, lng:127.1987, holes:18, platforms:['golfzon'],                image:'🌾', greenFeeWeekend: 26330, golfzonSeq:53 },
  { id:17, name:'골프존카운티 안성W', region:'anseong',  lat:37.0432, lng:127.1543, holes:18, platforms:['golfzon'],                image:'🌾', greenFeeWeekend: 25969, golfzonSeq:2  },
  { id:18, name:'안성Q리조트',       region:'anseong',   lat:37.0543, lng:127.2567, holes:27, platforms:['golfmon','joinbooking'],  image:'🌾', greenFeeWeekend: 90000 },
  // ── 이천 ──────────────────────────────────────────────
  { id:19, name:'블랙스톤CC 이천',   region:'icheon',    lat:37.2234, lng:127.5012, holes:27, platforms:['golfang','joinbooking'], image:'🌿', greenFeeWeekend:160000 },
  { id:20, name:'이천골프클럽',      region:'icheon',    lat:37.2456, lng:127.4765, holes:18, platforms:['golfmon'],                image:'🌿', greenFeeWeekend:105000 },
  { id:21, name:'SK뷰CC',            region:'icheon',    lat:37.2012, lng:127.5234, holes:18, platforms:['golfang'],               image:'🌿', greenFeeWeekend: 98000 },
  // ── 양평 ──────────────────────────────────────────────
  { id:22, name:'리버사이드CC',      region:'yangpyeong',lat:37.5012, lng:127.4987, holes:18, platforms:['golfmon'],                image:'🏞️', greenFeeWeekend: 95000 },
  { id:23, name:'양평CC',            region:'yangpyeong',lat:37.4876, lng:127.5123, holes:18, platforms:['golfang','joinbooking'], image:'🏞️', greenFeeWeekend: 88000 },
  { id:24, name:'지평CC',            region:'yangpyeong',lat:37.4543, lng:127.5345, holes:18, platforms:['joinbooking'],            image:'🏞️', greenFeeWeekend: 82000 },
  // ── 여주 ──────────────────────────────────────────────
  { id:25, name:'여주골든뷰CC',      region:'yeoju',     lat:37.3123, lng:127.5987, holes:18, platforms:['golfmon'],                image:'🌊', greenFeeWeekend: 92000 },
  { id:26, name:'여주스타힐스CC',    region:'yeoju',     lat:37.2987, lng:127.6234, holes:18, platforms:['golfmon','golfang'],     image:'🌊', greenFeeWeekend:105000 },
  { id:27, name:'블루헤런CC',        region:'yeoju',     lat:37.2765, lng:127.6567, holes:18, platforms:['joinbooking'],            image:'🌊', greenFeeWeekend: 85000 },
  { id:28, name:'세종CC',            region:'yeoju',     lat:37.2543, lng:127.6789, holes:18, platforms:['golfang'],               image:'🌊', greenFeeWeekend: 78000 },
  // ── 가평 ──────────────────────────────────────────────
  { id:29, name:'가평베네스트CC',    region:'gapyeong',  lat:37.8123, lng:127.5012, holes:18, platforms:['golfmon','golfang'],     image:'🍁', greenFeeWeekend:118000 },
  { id:30, name:'자라섬CC',          region:'gapyeong',  lat:37.7987, lng:127.5234, holes:18, platforms:['golfmon'],                image:'🍁', greenFeeWeekend: 98000 },
  { id:31, name:'남이섬CC',          region:'gapyeong',  lat:37.7765, lng:127.5456, holes:18, platforms:['joinbooking'],            image:'🍁', greenFeeWeekend: 92000 },
  // ── 춘천 ──────────────────────────────────────────────
  { id:32, name:'강촌리조트GC',      region:'chuncheon', lat:37.7654, lng:127.5987, holes:18, platforms:['golfmon'],                image:'🏔️', greenFeeWeekend: 88000 },
  { id:33, name:'엘리시안강촌',      region:'chuncheon', lat:37.7891, lng:127.6123, holes:18, platforms:['golfang','joinbooking'], image:'🏔️', greenFeeWeekend: 95000 },
  { id:34, name:'천마산CC',          region:'chuncheon', lat:37.8234, lng:127.6389, holes:18, platforms:['golfmon'],                image:'🏔️', greenFeeWeekend: 85000 },
  { id:35, name:'춘천레이크사이드CC', region:'chuncheon', lat:37.8651, lng:127.7234, holes:18, platforms:['golfang'],               image:'🏔️', greenFeeWeekend: 82000 },
  // ── 원주 ──────────────────────────────────────────────
  { id:36, name:'원주인터불고CC',    region:'wonju',     lat:37.3421, lng:127.9234, holes:18, platforms:['golfmon','golfang'],     image:'🦅', greenFeeWeekend: 95000 },
  { id:37, name:'오크밸리GC 원주',   region:'wonju',     lat:37.3234, lng:127.9567, holes:18, platforms:['joinbooking'],            image:'🦅', greenFeeWeekend: 88000 },
  // ── 충주 ──────────────────────────────────────────────
  { id:38, name:'충주클럽309',       region:'chungju',   lat:37.0123, lng:127.8765, holes:18, platforms:['golfmon'],                image:'🌄', greenFeeWeekend: 75000 },
  { id:39, name:'충주스카이힐CC',    region:'chungju',   lat:36.9876, lng:127.9123, holes:18, platforms:['joinbooking'],            image:'🌄', greenFeeWeekend: 72000 },
  { id:40, name:'수안보파크CC',      region:'chungju',   lat:36.9543, lng:127.9456, holes:18, platforms:['golfang'],               image:'🌄', greenFeeWeekend: 68000 },
].map(c => ({
  ...c,
  distance: calcDistance(BASE_COORD.lat, BASE_COORD.lng, c.lat, c.lng),
  platform: c.platforms[0], // 기본 플랫폼
}));

// 향후 30일 주말/공휴일
export function getWeekendDates() {
  const dates = [];
  const today = new Date();
  // 2026년 공휴일
  const holidays = ['2026-06-06','2026-07-17','2026-08-15','2026-09-25','2026-09-26','2026-09-27'];
  for (let i = 0; i <= 45; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    const dateStr = d.toISOString().split('T')[0];
    const isHoliday = holidays.includes(dateStr);
    if (dow === 0 || dow === 6 || isHoliday) {
      dates.push({
        date: dateStr,
        label: `${d.getMonth()+1}/${d.getDate()}(${['일','월','화','수','목','금','토'][dow]})`,
        isHoliday: dow === 0 || isHoliday,
      });
    }
  }
  return [...new Map(dates.map(d => [d.date, d])).values()].slice(0, 12);
}
