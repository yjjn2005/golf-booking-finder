/**
 * 골팡 API 클라이언트
 * 파트너 API 신청: https://www.golfang.com/partner
 *
 * API 발급 절차:
 * 1. 골팡 사업자 파트너 신청 페이지 접수
 * 2. 담당자 이메일 연락 (partner@golfang.com)
 * 3. API KEY + Webhook URL 발급
 */

const BASE_URL = import.meta.env.VITE_GOLFANG_BASE_URL || 'https://api.golfang.com/v2';
const API_KEY  = import.meta.env.VITE_GOLFANG_API_KEY  || 'MOCK';
const IS_MOCK  = API_KEY === 'MOCK';

async function fetchReal(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Golfang API ${res.status}: ${res.statusText}`);
  return res.json();
}

function mockTeetimes(courseId, date) {
  const slots = [];
  const seed  = (courseId * 17 + parseInt(date.replace(/-/g, '').slice(-3))) % 100;
  const times  = ['06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00'];
  times.forEach((t, i) => {
    if ((seed + i * 11) % 3 !== 0) {
      slots.push({
        teeTime: t,
        availableTeams: ((seed + i * 5) % 3) + 1,
        price: 110000 + ((seed + i * 9) % 7) * 5000,
        greenFee: true,
        cartFee: true,
        caddyFee: i % 2 === 0,
      });
    }
  });
  return slots;
}

/** 지역/날짜별 골팡 골프장 목록 */
export async function getGolfangCourses(params) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 450));
    return { source: 'golfang', isMock: true, courses: [] };
  }
  return fetchReal('/golf/courses', {
    date:       params.date,
    areaCode:   params.regionCode || '',
    latitude:   params.lat,
    longitude:  params.lng,
    radius:     params.maxDistanceKm || 100,
  });
}

/** 특정 골프장 티타임 조회 */
export async function getGolfangTeetimes(courseId, date) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 350));
    return { source: 'golfang', isMock: true, teetimes: mockTeetimes(courseId, date) };
  }
  return fetchReal(`/golf/courses/${courseId}/available-times`, { playDate: date });
}
