import { useState, useEffect, useCallback } from "react";
import { REGIONS, PLATFORMS, GOLF_COURSES, getWeekendDates } from "./data/courses.js";
import { getGolfmonTeetimes }     from "./api/golfmon.js";
import { getGolfangTeetimes }     from "./api/golfang.js";
import { getJoinbookingTeetimes } from "./api/joinbooking.js";

export default function GolfBookingApp() {
  const [selectedRegion, setSelectedRegion]       = useState("all");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["golfmon","golfang","joinbooking"]);
  const [selectedDate, setSelectedDate]           = useState("");
  const [sortBy, setSortBy]                       = useState("price");
  const [searching, setSearching]                 = useState(false);
  const [results, setResults]                     = useState([]);
  const [expandedCourse, setExpandedCourse]       = useState(null);
  const [maxDistance, setMaxDistance]             = useState(100);
  const [lastUpdated, setLastUpdated]             = useState(null);
  const [autoRefresh, setAutoRefresh]             = useState(false);
  const weekendDates = getWeekendDates();

  useEffect(() => {
    if (weekendDates.length > 0 && !selectedDate) setSelectedDate(weekendDates[0].date);
  }, []);

  const doSearch = useCallback(async () => {
    if (!selectedDate) return;
    setSearching(true);
    setExpandedCourse(null);
    try {
      const filtered = GOLF_COURSES.filter(c => {
        if (selectedRegion !== "all" && c.region !== selectedRegion) return false;
        if (!selectedPlatforms.includes(c.platform)) return false;
        if (c.distance > maxDistance) return false;
        return true;
      });

      const apiMap = {
        golfmon:     (id) => getGolfmonTeetimes(id, selectedDate),
        golfang:     (id) => getGolfangTeetimes(id, selectedDate),
        joinbooking: (id) => getJoinbookingTeetimes(id, selectedDate),
      };

      const settled = await Promise.allSettled(
        filtered.map(c => apiMap[c.platform]?.(c.id) ?? Promise.resolve({ teetimes: [] }))
      );

      const enriched = filtered.map((c, i) => {
        const res = settled[i];
        const teetimes = res.status === "fulfilled" ? (res.value?.teetimes ?? []) : [];
        const minPrice = teetimes.length > 0 ? Math.min(...teetimes.map(t => t.price)) : null;
        return { ...c, teeTimes: teetimes, minPrice, availableSlots: teetimes.length };
      }).filter(c => c.teeTimes.length > 0);

      enriched.sort((a, b) => {
        if (sortBy === "price")    return (a.minPrice ?? 999999) - (b.minPrice ?? 999999);
        if (sortBy === "distance") return a.distance - b.distance;
        if (sortBy === "rating")   return b.rating - a.rating;
        return b.availableSlots - a.availableSlots;
      });

      setResults(enriched);
      setLastUpdated(new Date());
    } finally {
      setSearching(false);
    }
  }, [selectedDate, selectedRegion, selectedPlatforms, sortBy, maxDistance]);

  useEffect(() => { if (selectedDate) doSearch(); }, [selectedDate, selectedRegion, selectedPlatforms, sortBy, maxDistance]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(doSearch, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, doSearch]);

  const togglePlatform = (pid) => {
    setSelectedPlatforms(prev =>
      prev.includes(pid) ? (prev.length > 1 ? prev.filter(p => p !== pid) : prev) : [...prev, pid]
    );
  };

  const platformInfo = (pid) => PLATFORMS.find(p => p.id === pid);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a1628 0%,#0d2137 40%,#0a2e1a 100%)", fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif", color:"#e8f4e8", paddingBottom:80 }}>
      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(90deg,#0a2e1a,#0d3d24,#0a2e1a)", borderBottom:"1px solid #1a5c30", padding:"20px 20px 0", position:"sticky", top:0, zIndex:100, boxShadow:"0 4px 30px rgba(0,196,113,0.15)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:"#00C471", letterSpacing:-0.5 }}>⛳ 골프 최저가 부킹</div>
              <div style={{ fontSize:11, color:"#4a9e6e", marginTop:2 }}>송파 기준 · 주말/공휴일 · 실시간 비교</div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setAutoRefresh(v=>!v)} style={{ background:autoRefresh?"#00C471":"rgba(0,196,113,0.15)", color:autoRefresh?"#000":"#00C471", border:"1px solid #00C471", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                {autoRefresh?"🔴 실시간 ON":"⚪ 실시간 OFF"}
              </button>
              <button onClick={doSearch} style={{ background:"linear-gradient(135deg,#00C471,#00a85d)", color:"#000", border:"none", borderRadius:20, padding:"6px 18px", fontSize:12, fontWeight:900, cursor:"pointer", boxShadow:"0 2px 12px rgba(0,196,113,0.4)" }}>
                🔄 새로고침
              </button>
            </div>
          </div>
          {/* Platform + Distance */}
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => togglePlatform(p.id)} style={{ background:selectedPlatforms.includes(p.id)?p.color:"rgba(255,255,255,0.05)", color:selectedPlatforms.includes(p.id)?"#fff":"#6b8c7d", border:`1px solid ${selectedPlatforms.includes(p.id)?p.color:"#2a4a38"}`, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                {p.logo} {p.label}
              </button>
            ))}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11, color:"#4a9e6e" }}>거리 ≤</span>
              <input type="range" min={30} max={100} step={10} value={maxDistance} onChange={e=>setMaxDistance(Number(e.target.value))} style={{ width:80, accentColor:"#00C471" }} />
              <span style={{ fontSize:11, color:"#00C471", fontWeight:700 }}>{maxDistance}km</span>
            </div>
          </div>
          {/* Date Tabs */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
            {weekendDates.map(d => (
              <button key={d.date} onClick={() => setSelectedDate(d.date)} style={{ background:selectedDate===d.date?"linear-gradient(135deg,#00C471,#00a85d)":"rgba(255,255,255,0.05)", color:selectedDate===d.date?"#000":d.isHoliday?"#ff7070":"#a0c8b0", border:`1px solid ${selectedDate===d.date?"#00C471":"#2a4a38"}`, borderRadius:10, padding:"6px 12px", whiteSpace:"nowrap", fontSize:12, fontWeight:selectedDate===d.date?900:500, cursor:"pointer", flexShrink:0 }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"16px 16px 0" }}>
        {/* Region + Sort */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => setSelectedRegion(r.id)} style={{ background:selectedRegion===r.id?"rgba(0,196,113,0.2)":"rgba(255,255,255,0.04)", color:selectedRegion===r.id?"#00C471":"#6b8c7d", border:`1px solid ${selectedRegion===r.id?"#00C471":"#2a4a38"}`, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:selectedRegion===r.id?700:400, cursor:"pointer" }}>
              {r.emoji} {r.label}
            </button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {[["price","💰 최저가"],["distance","📍 거리"],["rating","⭐ 평점"],["slots","🕐 타임"]].map(([s,l]) => (
              <button key={s} onClick={() => setSortBy(s)} style={{ background:sortBy===s?"rgba(0,196,113,0.15)":"transparent", color:sortBy===s?"#00C471":"#4a9e6e", border:`1px solid ${sortBy===s?"#00C471":"#2a4a38"}`, borderRadius:20, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Status */}
        {lastUpdated && (
          <div style={{ background:"rgba(0,196,113,0.08)", border:"1px solid #1a5c30", borderRadius:8, padding:"6px 14px", marginBottom:12, fontSize:11, color:"#4a9e6e", display:"flex", justifyContent:"space-between" }}>
            <span>{searching?"⏳ 실시간 조회 중...":`✅ ${results.length}개 골프장 조회 완료`}</span>
            <span>업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}</span>
          </div>
        )}

        {/* Spinner */}
        {searching && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ display:"inline-block", width:40, height:40, border:"3px solid rgba(0,196,113,0.2)", borderTop:"3px solid #00C471", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <div style={{ color:"#4a9e6e", marginTop:12, fontSize:13 }}>골프몬 · 골팡 · 조인부킹 실시간 조회 중...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Results */}
        {!searching && results.map((course, idx) => {
          const platform = platformInfo(course.platform);
          const expanded = expandedCourse === course.id;
          return (
            <div key={course.id} style={{ background:expanded?"linear-gradient(135deg,rgba(0,196,113,0.1),rgba(0,50,30,0.8))":"rgba(255,255,255,0.04)", border:`1px solid ${expanded?"#00C471":"#1a3d28"}`, borderRadius:14, marginBottom:10, transition:"all 0.3s", overflow:"hidden", boxShadow:expanded?"0 4px 24px rgba(0,196,113,0.2)":"none" }}>
              <div style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }} onClick={() => setExpandedCourse(expanded ? null : course.id)}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:idx===0?"linear-gradient(135deg,#FFD700,#FFA500)":idx===1?"linear-gradient(135deg,#C0C0C0,#A0A0A0)":idx===2?"linear-gradient(135deg,#CD7F32,#A05020)":"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:idx<3?"#000":"#6b8c7d", flexShrink:0 }}>{idx+1}</div>
                <div style={{ fontSize:22, flexShrink:0 }}>{course.image}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:15, fontWeight:700, color:"#e8f4e8" }}>{course.name}</span>
                    <span style={{ background:platform?.color+"30", color:platform?.color, border:`1px solid ${platform?.color}50`, borderRadius:10, padding:"1px 8px", fontSize:10, fontWeight:700 }}>{platform?.logo} {platform?.label}</span>
                    <span style={{ fontSize:11, color:"#4a9e6e" }}>⭐ {course.rating} · {course.holes}홀</span>
                  </div>
                  <div style={{ fontSize:11, color:"#4a9e6e", marginTop:3 }}>📍 {course.address} · 송파에서 약 {course.distance}km</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  {course.minPrice ? (
                    <>
                      <div style={{ fontSize:18, fontWeight:900, color:"#00C471" }}>₩{course.minPrice.toLocaleString()}</div>
                      <div style={{ fontSize:10, color:"#4a9e6e" }}>최저가 · {course.availableSlots}타임</div>
                    </>
                  ) : <div style={{ fontSize:12, color:"#6b8c7d" }}>마감</div>}
                </div>
                <div style={{ color:"#4a9e6e", fontSize:14 }}>{expanded?"▲":"▼"}</div>
              </div>

              {expanded && (
                <div style={{ borderTop:"1px solid #1a5c30", padding:"14px 16px" }}>
                  <div style={{ display:"flex", gap:8, marginBottom:12, fontSize:11, color:"#4a9e6e", flexWrap:"wrap" }}>
                    <span>🟢 그린피 {course.greenFee}</span>
                    <span>🚗 카트 {course.cart}</span>
                    <span>👤 캐디 {course.caddie}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
                    {course.teeTimes.map((slot, i) => (
                      <div key={i} style={{ background:"rgba(0,196,113,0.08)", border:"1px solid #1a5c30", borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"all 0.2s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,196,113,0.2)";e.currentTarget.style.borderColor="#00C471"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,196,113,0.08)";e.currentTarget.style.borderColor="#1a5c30"}}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#e8f4e8" }}>🕐 {slot.teeTime}</div>
                        <div style={{ fontSize:13, fontWeight:900, color:"#00C471", marginTop:3 }}>₩{slot.price.toLocaleString()}</div>
                        <div style={{ fontSize:10, color:"#4a9e6e", marginTop:2 }}>잔여 {slot.availableTeams}팀</div>
                        <button onClick={e=>{e.stopPropagation();window.open(platform?.url,"_blank")}} style={{ width:"100%", marginTop:8, background:"linear-gradient(135deg,#00C471,#00a85d)", color:"#000", border:"none", borderRadius:6, padding:"5px 0", fontSize:10, fontWeight:900, cursor:"pointer" }}>
                          바로 예약 →
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:14 }}>
                    {PLATFORMS.map(p => (
                      <button key={p.id} onClick={()=>window.open(p.url,"_blank")} style={{ background:p.color+"20", color:p.color, border:`1px solid ${p.color}50`, borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                        {p.logo} {p.label}에서 보기
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!searching && results.length === 0 && lastUpdated && (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#4a9e6e" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⛳</div>
            <div>선택한 조건에 맞는 가용 타임이 없습니다.</div>
            <div style={{ fontSize:12, marginTop:6 }}>지역이나 날짜를 변경해 보세요.</div>
          </div>
        )}

        {/* Summary */}
        {!searching && results.length > 0 && (
          <div style={{ background:"rgba(0,196,113,0.06)", border:"1px solid #1a5c30", borderRadius:12, padding:"14px 16px", marginTop:8, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              { label:"검색 골프장",  value:`${results.length}개` },
              { label:"최저가",       value:`₩${Math.min(...results.map(r=>r.minPrice||999999)).toLocaleString()}` },
              { label:"총 가용 타임", value:`${results.reduce((a,r)=>a+r.availableSlots,0)}개` },
              { label:"최근접 거리",  value:`${Math.min(...results.map(r=>r.distance))}km` },
            ].map((stat,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:900, color:"#00C471" }}>{stat.value}</div>
                <div style={{ fontSize:10, color:"#4a9e6e", marginTop:2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
