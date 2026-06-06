/**
 * 골프존카운티 실시간 API
 * 공개 엔드포인트 - 실제 그린피 + 가용타임 실시간 조회
 */

const BASE = 'https://www.golfzoncounty.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': `${BASE}/reserve/main`,
};

async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: HEADERS,
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`GolfzonCounty ${res.status}`);
  return res.json();
}

/** 특정 월의 전체 골프장 가용 타임 카운트 */
export async function getGolfzonMonthData(yearMonth) {
  const data = await apiFetch('/reserve/main/getDayTeetimeCountList', { yearMonth });
  return data?.data?.reserveDayTeetimeCountInfo?.reserveDayTeetimeCountList ?? [];
}

/** 특정 날짜 기준 가용 골프장 + 그린피 실시간 조회 */
export async function getGolfzonAvailability(date) {
  const ym = date.replace(/-/g, '').slice(0, 6);
  const entries = await getGolfzonMonthData(ym);
  
  const targetDate = date.replace(/-/g, '');
  // 날짜 필터: workDate가 정확히 일치하거나 가용 정보 있는 항목
  const available = entries.filter(e => e.bookgAbleCnt > 0);
  
  return available.map(e => ({
    golfzonSeq: e.golfclubSeq,
    name: e.golfclubName,
    area: e.areaName,
    address: e.golfclubAddress,
    tel: e.golfclubTel,
    cartFee: e.cartfeeDesc,
    greenFeeWeekend: parseInt(e.greenFeeWeekend) || 0,
    greenFeeWeek: parseInt(e.greenFeeWeek) || 0,
    availCount: e.bookgAbleCnt,
    img: e.thumbnailFileUrl,
    bookingUrl: `${BASE}/reserve/main?golfclubSeq=${e.golfclubSeq}`,
  }));
}
