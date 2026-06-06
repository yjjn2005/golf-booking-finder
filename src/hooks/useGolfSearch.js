/**
 * useGolfSearch — 3개 플랫폼 병렬 조회 커스텀 훅
 * 골프몬 + 골팡 + 조인부킹을 Promise.allSettled로 동시 호출
 */
import { useState, useCallback, useRef } from 'react';
import { getGolfmonTeetimes }     from '../api/golfmon.js';
import { getGolfangTeetimes }     from '../api/golfang.js';
import { getJoinbookingTeetimes } from '../api/joinbooking.js';
import { GOLF_COURSES }           from '../data/courses.js';

export function useGolfSearch() {
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError]           = useState(null);
  const abortRef = useRef(null);

  const search = useCallback(async ({ date, selectedRegion, selectedPlatforms, maxDistance, sortBy }) => {
    if (!date) return;
    // 이전 검색 취소
    if (abortRef.current) abortRef.current = false;
    const token = {};
    abortRef.current = token;

    setSearching(true);
    setError(null);

    try {
      // 1. 로컬 골프장 목록 필터
      const filtered = GOLF_COURSES.filter(c => {
        if (selectedRegion !== 'all' && c.region !== selectedRegion) return false;
        if (!selectedPlatforms.includes(c.platform)) return false;
        if (c.distance > maxDistance) return false;
        return true;
      });

      // 2. 모든 골프장 티타임 병렬 조회
      const apiMap = {
        golfmon:     (id) => getGolfmonTeetimes(id, date),
        golfang:     (id) => getGolfangTeetimes(id, date),
        joinbooking: (id) => getJoinbookingTeetimes(id, date),
      };

      const settled = await Promise.allSettled(
        filtered.map(c => apiMap[c.platform]?.(c.id) ?? Promise.resolve({ teetimes: [] }))
      );

      if (token !== abortRef.current) return; // 취소됨

      // 3. 결과 조합
      const enriched = filtered.map((c, i) => {
        const res = settled[i];
        const teetimes = res.status === 'fulfilled'
          ? (res.value?.teetimes ?? [])
          : [];

        const minPrice = teetimes.length > 0
          ? Math.min(...teetimes.map(t => t.price))
          : null;

        return { ...c, teeTimes: teetimes, minPrice, availableSlots: teetimes.length };
      }).filter(c => c.teeTimes.length > 0);

      // 4. 정렬
      enriched.sort((a, b) => {
        if (sortBy === 'price')    return (a.minPrice ?? 999999) - (b.minPrice ?? 999999);
        if (sortBy === 'distance') return a.distance - b.distance;
        if (sortBy === 'rating')   return b.rating - a.rating;
        return b.availableSlots - a.availableSlots;
      });

      setResults(enriched);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  return { results, searching, lastUpdated, error, search };
}
