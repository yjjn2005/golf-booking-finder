/**
 * 조인부킹 API 클라이언트
 * 파트너 API 신청: https://joinbooking.com/developers
 *
 * API 발급 절차:
 * 1. 조인부킹 개발자 포털 가입
 * 2. App 등록 후 Client ID / Secret 발급
 * 3. OAuth2 Bearer Token 방식 인증
 */

const BASE_URL = import.meta.env.VITE_JOINBOOKING_BASE_URL || 'https://api.joinbooking.com/v1';
const API_KEY  = import.meta.env.VITE_JOINBOOKING_API_KEY  || 'MOCK';
const IS_MOCK  = API_KEY === 'MOCK';

async function fetchReal(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`JoinBooking API ${res.status}: ${res.statusText}`);
  return res.json();
}

function mockTeetimes(courseId, date) {
  const slots = [];
  const seed  = (courseId * 23 + parseInt(date.replace(/-/g, '').slice(-4))) % 100;
  const times  = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','11:00','11:30'];
  times.forEach((t, i) => {
    if ((seed + i * 9) % 3 !== 0) {
      slots.push({
        teeTime: t,
        availableTeams: ((seed + i * 7) % 3) + 1,
        price: 78000 + ((seed + i * 11) % 8) * 5000,
        greenFee: true,
        cartFee: true,
        caddyFee: i % 4 === 0,
      });
    }
  });
  return slots;
}

/** 조인부킹 골프장 목록 */
export async function getJoinbookingCourses(params) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 380));
    return { source: 'joinbooking', isMock: true, courses: [] };
  }
  return fetchReal('/courses/search', {
    playDate:    params.date,
    lat:         params.lat,
    lng:         params.lng,
    maxDistance: params.maxDistanceKm || 100,
    region:      params.regionCode || '',
  });
}

/** 조인부킹 티타임 조회 */
export async function getJoinbookingTeetimes(courseId, date) {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 320));
    return { source: 'joinbooking', isMock: true, teetimes: mockTeetimes(courseId, date) };
  }
  return fetchReal(`/teetimes`, { courseId, date });
}
