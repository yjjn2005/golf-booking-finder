import { useState, useEffect, useCallback, useRef } from "react";
import { REGIONS, PLATFORMS, GOLF_COURSES, getWeekendDates, BASE_COORD } from "./data/courses.js";

// ── 가격 Mock 생성 (실 API 미연동 골프장) ──────────────────
function mockTeetimes(course, date) {
  const seed = (course.id * 31 + parseInt(date.replace(/-/g,'').slice(-4))) % 100;
  const times = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30'];
  return times
    .filter((_, i) => (seed + i * 7) % 3 !== 0)
    .map((t, i) => ({
      teeTime: t,
      price: course.greenFeeWeekend + ((seed + i * 13) % 6 - 2) * 5000,
      availableTeams: ((seed + i * 3) % 3) + 1,
    }));
}

// ── 골프존카운티 CORS 프록시 ────────────────────────────────
async function fetchGolfzonData(date) {
  const ym = date.replace(/-/g,'').slice(0,6);
  // CORS 우회: allorigins 프록시 사용
  const target = encodeURIComponent(
    `https://www.golfzoncounty.com/reserve/main/getDayTeetimeCountList?yearMonth=${ym}`
  );
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${target}`, { signal: AbortSignal.timeout(8000) });
    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);
    const list = data?.data?.reserveDayTeetimeCountInfo?.reserveDayTeetimeCountList ?? [];
    return list.filter(e => e.bookgAbleCnt > 0).map(e => ({
      golfzonSeq: e.golfclubSeq,
      greenFeeWeekend: parseInt(e.greenFeeWeekend) || 0,
      greenFeeWeek: parseInt(e.greenFeeWeek) || 0,
      availCount: e.bookgAbleCnt,
      cartFee: e.cartfeeDesc,
    }));
  } catch { return []; }
}

// ── 메인 앱 ────────────────────────────────────────────────
export default function GolfBookingApp() {
  const [region, setRegion]               = useState('all');
  const [platforms, setPlatforms]         = useState(['golfzon','golfmon','golfang','joinbooking']);
  const [date, setDate]                   = useState('');
  const [sortBy, setSortBy]               = useState('price');
  const [maxDist, setMaxDist]             = useState(100);
  const [searching, setSearching]         = useState(false);
  const [results, setResults]             = useState([]);
  const [expanded, setExpanded]           = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [autoRefresh, setAutoRefresh]     = useState(false);
  const [golfzonLive, setGolfzonLive]     = useState({});
  const [liveStatus, setLiveStatus]       = useState('idle'); // idle | loading | ok | fail
  const weekendDates = getWeekendDates();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!date && weekendDates.length) setDate(weekendDates[0].date);
  }, []);

  // 골프존카운티 실시간 데이터 조회
  const loadGolfzonLive = useCallback(async (targetDate) => {
    if (!targetDate) return;
    setLiveStatus('loading');
    try {
      const list = await fetchGolfzonData(targetDate);
      const map = {};
      list.forEach(e => { map[e.golfzonSeq] = e; });
      setGolfzonLive(map);
      setLiveStatus(Object.keys(map).length > 0 ? 'ok' : 'fail');
    } catch { setLiveStatus('fail'); }
  }, []);

  const doSearch = useCallback(async (targetDate) => {
    const d = targetDate || date;
    if (!d) return;
    setSearching(true);
    setExpanded(null);

    await loadGolfzonLive(d);

    const filtered = GOLF_COURSES.filter(c => {
      if (region !== 'all' && c.region !== region) return false;
      if (!c.platforms.some(p => platforms.includes(p))) return false;
      if (c.distance > maxDist) return false;
      return true;
    });

    // 가격 결정: 골프존카운티 실시간 > 기본가
    const enriched = filtered.map(c => {
      const liveData = c.golfzonSeq ? golfzonLive[c.golfzonSeq] : null;
      const livePrice = liveData?.greenFeeWeekend;
      const finalPrice = livePrice || c.greenFeeWeekend;
      const teetimes = mockTeetimes({ ...c, greenFeeWeekend: finalPrice }, d);
      return {
        ...c,
        greenFeeWeekend: finalPrice,
        isLive: !!livePrice,
        liveAvailCount: liveData?.availCount || 0,
        cartFeeText: liveData?.cartFee || '₩100,000/팀',
        teeTimes: teetimes,
        minPrice: finalPrice,
        availableSlots: teetimes.length,
      };
    }).filter(c => c.teeTimes.length > 0);

    enriched.sort((a, b) => {
      if (sortBy === 'price')    return a.minPrice - b.minPrice;
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'rating')   return (b.golfzonSeq?1:0) - (a.golfzonSeq?1:0);
      return b.availableSlots - a.availableSlots;
    });

    setResults(enriched);
    setLastUpdated(new Date());
    setSearching(false);
  }, [date, region, platforms, maxDist, sortBy, golfzonLive, loadGolfzonLive]);

  useEffect(() => { if (date) doSearch(date); }, [date, region, platforms, maxDist, sortBy]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => doSearch(date), 30000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, date, doSearch]);

  const togglePlatform = pid =>
    setPlatforms(prev => prev.includes(pid)
      ? (prev.length > 1 ? prev.filter(p => p !== pid) : prev)
      : [...prev, pid]);

  const pfInfo = pid => PLATFORMS.find(p => p.id === pid);

  const totalMin = results.length > 0 ? Math.min(...results.map(r => r.minPrice)) : 0;
  const totalSlots = results.reduce((a,r) => a + r.availableSlots, 0);
  const nearestDist = results.length > 0 ? Math.min(...results.map(r => r.distance)) : 0;
  const liveCount = results.filter(r => r.isLive).length;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#061018 0%,#0a1f14 50%,#071218 100%)', fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", color:'#e0f0e8', paddingBottom:80 }}>

      {/* ══ HEADER ══════════════════════════════════════════ */}
      <div style={{ background:'linear-gradient(90deg,#071a0e,#0a2d1a,#071a0e)', borderBottom:'1px solid rgba(0,196,113,0.2)', padding:'16px 16px 0', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(10px)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>

          {/* 타이틀 + 컨트롤 */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#00C471', letterSpacing:-0.5, display:'flex', alignItems:'center', gap:8 }}>
                ⛳ 골프 실시간 최저가
                <span style={{ fontSize:11, background:'rgba(0,196,113,0.15)', color:'#00C471', border:'1px solid rgba(0,196,113,0.3)', borderRadius:10, padding:'2px 8px', fontWeight:500 }}>
                  송파 100km · {GOLF_COURSES.length}개 골프장
                </span>
                {liveStatus === 'ok' && <span style={{ fontSize:10, color:'#00b4d8', background:'rgba(0,180,216,0.1)', border:'1px solid rgba(0,180,216,0.3)', borderRadius:10, padding:'2px 8px' }}>🔵 골프존카운티 실시간</span>}
              </div>
              <div style={{ fontSize:11, color:'#3a8a5e', marginTop:2 }}>골프존카운티·골프몬·골팡·조인부킹 동시비교</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={() => setAutoRefresh(v=>!v)} style={{ background:autoRefresh?'#00C471':'rgba(0,196,113,0.12)', color:autoRefresh?'#000':'#00C471', border:`1px solid #00C471`, borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                {autoRefresh?'🔴 실시간 ON':'⚪ 실시간'}
              </button>
              <button onClick={() => doSearch(date)} style={{ background:'linear-gradient(135deg,#00C471,#009955)', color:'#000', border:'none', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:900, cursor:'pointer', boxShadow:'0 2px 10px rgba(0,196,113,0.35)' }}>
                🔄 새로고침
              </button>
            </div>
          </div>

          {/* 플랫폼 + 거리 */}
          <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => togglePlatform(p.id)} style={{ background:platforms.includes(p.id)?p.color+'22':'rgba(255,255,255,0.04)', color:platforms.includes(p.id)?p.color:'#556c60', border:`1px solid ${platforms.includes(p.id)?p.color:'#1a3d28'}`, borderRadius:16, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                {p.logo} {p.label}
              </button>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
              <span style={{ fontSize:10, color:'#3a8a5e' }}>거리</span>
              <input type="range" min={20} max={100} step={10} value={maxDist} onChange={e=>setMaxDist(+e.target.value)} style={{ width:80, accentColor:'#00C471' }} />
              <span style={{ fontSize:11, color:'#00C471', fontWeight:700, minWidth:36 }}>{maxDist}km</span>
            </div>
          </div>

          {/* 날짜 탭 */}
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }}>
            {weekendDates.map(d => (
              <button key={d.date} onClick={() => setDate(d.date)} style={{ background:date===d.date?'linear-gradient(135deg,#00C471,#009955)':'rgba(255,255,255,0.04)', color:date===d.date?'#000':d.isHoliday?'#ff8080':'#80b090', border:`1px solid ${date===d.date?'#00C471':'#1a3d28'}`, borderRadius:8, padding:'5px 11px', whiteSpace:'nowrap', fontSize:11, fontWeight:date===d.date?900:400, cursor:'pointer', flexShrink:0 }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'12px 12px 0' }}>

        {/* 지역 + 정렬 */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10, alignItems:'center' }}>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => setRegion(r.id)} style={{ background:region===r.id?'rgba(0,196,113,0.18)':'rgba(255,255,255,0.03)', color:region===r.id?'#00C471':'#4a7a60', border:`1px solid ${region===r.id?'#00C471':'#1a3d28'}`, borderRadius:16, padding:'4px 12px', fontSize:11, fontWeight:region===r.id?700:400, cursor:'pointer', transition:'all 0.2s' }}>
              {r.emoji} {r.label}
              {r.id !== 'all' && <span style={{ fontSize:9, marginLeft:4, opacity:.6 }}>{r.count}</span>}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:5 }}>
            {[['price','💰 최저가'],['distance','📍 거리'],['rating','⭐ 인기'],['slots','🕐 타임수']].map(([s,l]) => (
              <button key={s} onClick={() => setSortBy(s)} style={{ background:sortBy===s?'rgba(0,196,113,0.15)':'transparent', color:sortBy===s?'#00C471':'#3a6a50', border:`1px solid ${sortBy===s?'#00C471':'#1a3d28'}`, borderRadius:14, padding:'3px 9px', fontSize:10, cursor:'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* 상태 바 */}
        {lastUpdated && (
          <div style={{ background:'rgba(0,196,113,0.06)', border:'1px solid rgba(0,196,113,0.15)', borderRadius:8, padding:'6px 14px', marginBottom:10, fontSize:11, color:'#3a8a5e', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:6 }}>
            <span>
              {searching ? '⏳ 조회 중...' : `✅ ${results.length}개 골프장`}
              {liveCount > 0 && ` · 🔵 ${liveCount}개 실시간`}
              {totalSlots > 0 && ` · 총 ${totalSlots}타임`}
            </span>
            <span style={{ color:'#2a6a40' }}>🕐 {lastUpdated.toLocaleTimeString('ko-KR')}</span>
          </div>
        )}

        {/* 로딩 */}
        {searching && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ display:'inline-block', width:36, height:36, border:'3px solid rgba(0,196,113,0.15)', borderTop:'3px solid #00C471', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            <div style={{ color:'#3a8a5e', marginTop:10, fontSize:12 }}>4개 플랫폼 실시간 조회 중...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* 결과 그리드 */}
        {!searching && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
            {results.map((course, idx) => {
              const isExpanded = expanded === course.id;
              const mainPf = pfInfo(course.platforms[0]);
              return (
                <div key={course.id} style={{ background:isExpanded?'linear-gradient(160deg,rgba(0,196,113,0.08),rgba(0,30,20,0.9))':'rgba(255,255,255,0.03)', border:`1px solid ${isExpanded?'#00C471':'rgba(0,196,113,0.12)'}`, borderRadius:14, overflow:'hidden', transition:'all 0.25s', boxShadow:isExpanded?'0 4px 24px rgba(0,196,113,0.15)':'none' }}>

                  {/* 카드 헤더 */}
                  <div style={{ padding:'12px 14px', cursor:'pointer', display:'flex', gap:10, alignItems:'center' }} onClick={() => setExpanded(isExpanded ? null : course.id)}>
                    {/* 순위 */}
                    <div style={{ width:26, height:26, borderRadius:'50%', background:idx===0?'linear-gradient(135deg,#FFD700,#FFA500)':idx===1?'linear-gradient(135deg,#C0C0C0,#909090)':idx===2?'linear-gradient(135deg,#CD7F32,#A05020)':'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:idx<3?'#000':'#3a6a50', flexShrink:0 }}>{idx+1}</div>
                    <div style={{ fontSize:20, flexShrink:0 }}>{course.image}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'#d8f0e0' }}>{course.name}</span>
                        {course.isLive && <span style={{ fontSize:9, background:'rgba(0,180,216,0.15)', color:'#00b4d8', border:'1px solid rgba(0,180,216,0.3)', borderRadius:8, padding:'1px 6px', fontWeight:700 }}>LIVE</span>}
                        {course.holes === 27 && <span style={{ fontSize:9, background:'rgba(255,180,0,0.1)', color:'#ffb400', border:'1px solid rgba(255,180,0,0.2)', borderRadius:8, padding:'1px 6px' }}>27H</span>}
                      </div>
                      <div style={{ fontSize:10, color:'#3a8a5e', marginTop:2 }}>
                        📍 {course.region} · {course.distance}km
                        {' · '}
                        {course.platforms.map(pid => {
                          const pf = pfInfo(pid);
                          return <span key={pid} style={{ color: pf?.color, marginRight:3 }}>{pf?.logo}</span>;
                        })}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:17, fontWeight:900, color:'#00C471' }}>₩{course.minPrice.toLocaleString()}</div>
                      <div style={{ fontSize:9, color:'#3a8a5e' }}>{course.availableSlots}타임</div>
                    </div>
                    <span style={{ color:'rgba(0,196,113,0.5)', fontSize:12 }}>{isExpanded?'▲':'▼'}</span>
                  </div>

                  {/* 확장 패널 */}
                  {isExpanded && (
                    <div style={{ borderTop:'1px solid rgba(0,196,113,0.15)', padding:'12px 14px' }}>
                      {/* 요금 정보 */}
                      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                        {[
                          ['그린피', `₩${course.minPrice.toLocaleString()}`],
                          ['카트비', course.cartFeeText || '-'],
                          ['홀수', `${course.holes}홀`],
                          ['거리', `${course.distance}km`],
                        ].map(([k,v]) => (
                          <div key={k} style={{ background:'rgba(0,196,113,0.06)', border:'1px solid rgba(0,196,113,0.1)', borderRadius:8, padding:'5px 10px', fontSize:10 }}>
                            <div style={{ color:'#3a8a5e' }}>{k}</div>
                            <div style={{ color:'#00C471', fontWeight:700, fontSize:12 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      {/* 티타임 그리드 */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:6, marginBottom:12 }}>
                        {course.teeTimes.map((slot, i) => (
                          <div key={i} style={{ background:'rgba(0,196,113,0.05)', border:'1px solid rgba(0,196,113,0.12)', borderRadius:9, padding:'8px 10px', cursor:'pointer', transition:'all 0.2s' }}
                            onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,196,113,0.15)';e.currentTarget.style.borderColor='#00C471'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,196,113,0.05)';e.currentTarget.style.borderColor='rgba(0,196,113,0.12)'}}>
                            <div style={{ fontSize:13, fontWeight:700, color:'#d8f0e0' }}>🕐 {slot.teeTime}</div>
                            <div style={{ fontSize:12, fontWeight:900, color:'#00C471', marginTop:2 }}>₩{slot.price.toLocaleString()}</div>
                            <div style={{ fontSize:9, color:'#3a8a5e' }}>잔여 {slot.availableTeams}팀</div>
                          </div>
                        ))}
                      </div>

                      {/* 예약 버튼 */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {course.platforms.map(pid => {
                          const pf = pfInfo(pid);
                          return (
                            <button key={pid} onClick={() => window.open(pf?.url,'_blank')} style={{ background:pf?.color+'18', color:pf?.color, border:`1px solid ${pf?.color}40`, borderRadius:8, padding:'6px 14px', fontSize:11, fontWeight:700, cursor:'pointer', flex:1, minWidth:80 }}>
                              {pf?.logo} {pf?.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 빈 결과 */}
        {!searching && results.length === 0 && lastUpdated && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#3a8a5e' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>⛳</div>
            <div style={{ fontSize:16 }}>조건에 맞는 골프장이 없습니다</div>
            <div style={{ fontSize:12, marginTop:8 }}>거리 또는 지역을 조정해보세요</div>
          </div>
        )}

        {/* 집계 풋터 */}
        {!searching && results.length > 0 && (
          <div style={{ background:'rgba(0,196,113,0.05)', border:'1px solid rgba(0,196,113,0.12)', borderRadius:12, padding:'14px', marginTop:14, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            {[
              ['검색결과', `${results.length}개`],
              ['최저그린피', `₩${totalMin.toLocaleString()}`],
              ['총 타임수', `${totalSlots}개`],
              ['최근접', `${nearestDist}km`],
              ['실시간', `${liveCount}개`],
            ].map(([l,v]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:15, fontWeight:900, color:'#00C471' }}>{v}</div>
                <div style={{ fontSize:9, color:'#3a8a5e', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
