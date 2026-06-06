/**
 * 골프몬 API 클라이언트
 * 파트너 API 신청: https://partner.golfmon.co.kr/api
 * 
 * API 발급 절차:
 * 1. 골프몬 파트너센터 가입
 * 2. 사업자등록증 제출
 * 3. 검토 후 API KEY 발급 (영업일 3~5일)
 */

const BASE_URL = import.meta.env.VITE_GOLFMON_BASE_URL || 'https://api.golfmon.co.kr/v1';
const API_KEY  = import.meta.env.VITE_GOLFMON_API_KEY  || 'MOCK';
const IS_MOCK  = API_KEY === 'MOCK';

// ─── 실제 API 호출 ────────────────────────────────────────────────────────────
async function fetchReal(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`GolfMon API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Mock 데이터 (API 키 미발급 시) ──────────────────────────────────────────
function mockTeetimes(courseId, date) {
  const slots = [];
  const seed  = (courseId * 31 + date.replace(/-/g, '').slice(-4)) % 100;
  const times  = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'];
  times.forEach((t, i) => {
    if ((seed + i * 7) % 3 !== 0) {
      slots.push({
        teeTime: t,
        availableTeams: ((seed + i * 3) % 3) + 1,
        price: 95000 + ((seed + i * 13) % 6) * 5000,
        greenFee: true,
        cartFee: true,
        caddyFee: i % 3 !== 0,
      });
    }
  });
  return slots;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * 지역/날짜 기준 골프장 목록 조회
 * @param {Object} params - { date, regionCode, lat, lng, maxDistanceKm }
 */
export async function getGolfmonCourses(params) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return { source: 'golfmon', isMock: true, courses: [] }; // 공용 COURSES 데이터 사용
  }
  return fetchReal('/courses', {
    playDate:    params.date,
    regionCode:  params.regionCode || '',
    lat:         params.lat,
    lng:         params.lng,
    maxDistance: params.maxDistanceKm || 100,
  });
}

/**
 * 특정 골프장 티타임 조회
 * @param {string|number} courseId
 * @param {string} date  - YYYY-MM-DD
 */
export async function getGolfmonTeetimes(courseId, date) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return { source: 'golfmon', isMock: true, teetimes: mockTeetimes(courseId, date) };
  }
  return fetchReal(`/courses/${courseId}/teetimes`, { playDate: date });
}
