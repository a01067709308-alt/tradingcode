/* ── 테마 ── */
const THEME_KEY = 'restaurant-theme';
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeLabel = document.querySelector('.theme-label');

const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? '화이트 모드로 전환' : '다크 모드로 전환');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    themeLabel.textContent = isDark ? '화이트 모드' : '다크 모드';
};

const getInitialTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

applyTheme(getInitialTheme());
themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

/* ── 거리 계산 ── */
const haversineM = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatDistance = (m) => m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;

/* ── 날씨 API (Open-Meteo) ── */
const fetchWeather = async (lat, lon) => {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );
        const data = await res.json();
        return { temp: data.current.temperature_2m, code: data.current.weather_code };
    } catch {
        return { temp: 20, code: 0 };
    }
};

const getWeatherType = (code, temp) => {
    if (temp >= 28) return 'hot';
    if (temp <= 5)  return 'cold';
    if ([51,53,55,61,63,65,80,81,82].includes(code)) return 'rainy';
    return 'normal';
};

/* ── 날씨·시간 기반 점수 ── */
const scoreRestaurant = (category, hour, weatherType) => {
    const c = category;
    let score = 0;
    let reason = '';

    // 시간대
    if (hour >= 6 && hour < 10) {
        if (c.includes('카페') || c.includes('베이커리') || c.includes('죽')) {
            score += 3; reason = '아침 식사로 딱이에요 ☀️';
        } else {
            score += 1;
        }
    } else if (hour >= 10 && hour < 14) {
        if (c.includes('한식') || c.includes('분식') || c.includes('국밥') || c.includes('돼지국밥')) {
            score += 3; reason = '든든한 점심 식사 🍱';
        } else {
            score += 2; reason = '점심 시간이에요 🕛';
        }
    } else if (hour >= 14 && hour < 17) {
        if (c.includes('카페') || c.includes('디저트') || c.includes('베이커리')) {
            score += 3; reason = '오후 티타임 ☕';
        } else {
            score += 1;
        }
    } else if (hour >= 17 && hour < 21) {
        if (c.includes('고기') || c.includes('구이') || c.includes('삼겹살') || c.includes('치킨')) {
            score += 3; reason = '저녁 식사로 딱! 🍖';
        } else {
            score += 2; reason = '저녁 식사 시간이에요 🌆';
        }
    } else {
        if (c.includes('치킨') || c.includes('피자') || c.includes('분식') || c.includes('포장마차')) {
            score += 3; reason = '야식으로 딱이에요 🌙';
        } else {
            score += 1; reason = '늦은 시간 식사 🌙';
        }
    }

    // 날씨 보정
    if (weatherType === 'hot') {
        if (c.includes('냉면') || c.includes('초밥') || c.includes('회') || c.includes('카페')) {
            score += 2; reason = '더운 날씨에 시원하게 🧊';
        }
        if (c.includes('고기') || c.includes('구이') || c.includes('삼겹살')) score -= 1;
    } else if (weatherType === 'cold') {
        if (c.includes('국밥') || c.includes('탕') || c.includes('찜') || c.includes('순대') ||
            c.includes('설렁탕') || c.includes('삼계탕') || c.includes('한식')) {
            score += 2; reason = '추운 날엔 뜨끈하게 🍲';
        }
    } else if (weatherType === 'rainy') {
        if (c.includes('칼국수') || c.includes('수제비') || c.includes('부침') || c.includes('한식')) {
            score += 2; reason = '비 오는 날 생각나는 맛 🌧️';
        }
    }

    if (!reason) reason = '가까운 맛집이에요 📍';
    return { score, reason };
};

/* ── 카카오 API ── */
const KAKAO_KEY = '803fc99d6c59c84dd43e09d5815dcf8b';

const kakaoSearch = async (lat, lon) => {
    const params = new URLSearchParams({
        category_group_code: 'FD6',
        y: lat, x: lon, radius: 800, size: 10, sort: 'distance'
    });
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?${params}`,
        { headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` } }
    );
    if (!res.ok) throw new Error(`Kakao ${res.status}`);
    const data = await res.json();
    return (data.documents || [])
        .filter(r => r.x && r.y)
        .map(r => ({
            name: r.place_name,
            category: r.category_name.split(' > ').pop(),
            lat: parseFloat(r.y),
            lon: parseFloat(r.x),
            distance: parseInt(r.distance, 10) || 0,
            address: r.road_address_name || r.address_name || '',
            phone: r.phone || '',
            url: r.place_url || '',
            reason: ''
        }))
        .filter(r => !isNaN(r.lat) && !isNaN(r.lon));
};

/* ── Overpass 백업 ── */
const overpassSearch = async (lat, lon) => {
    const query = `[out:json][timeout:10];(node["amenity"~"^(restaurant|fast_food|cafe)$"](around:800,${lat},${lon}););out body 10;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
    if (!res.ok) throw new Error('Overpass API 오류');
    const data = await res.json();
    const AMENITY_KO = { restaurant: '음식점', fast_food: '패스트푸드', cafe: '카페' };
    return (data.elements || [])
        .filter(r => typeof r.lat === 'number' && typeof r.lon === 'number')
        .map(r => ({
            name: r.tags.name || r.tags['name:ko'] || '이름 없음',
            category: AMENITY_KO[r.tags.amenity] || '음식점',
            lat: r.lat,
            lon: r.lon,
            distance: haversineM(lat, lon, r.lat, r.lon),
            address: r.tags['addr:full'] || r.tags['addr:street'] || '',
            phone: r.tags.phone || r.tags['contact:phone'] || '',
            url: '',
            reason: ''
        }));
};

/* ── 음식점 검색 + 날씨·시간 정렬 + 별점 → top 3 ── */
const fetchRestaurants = async (lat, lon, hour, weatherType) => {
    let items = [];
    try {
        items = await kakaoSearch(lat, lon);
        if (items.length === 0) throw new Error('결과 없음');
    } catch (e) {
        console.warn('카카오 실패:', e.message, '→ Overpass 시도');
        items = await overpassSearch(lat, lon);
    }

    if (items.length === 0) return [];

    // 날씨·시간 점수 부여 후 정렬
    const scored = items
        .map(r => {
            const { score, reason } = scoreRestaurant(r.category, hour, weatherType);
            return { ...r, score, reason };
        })
        .sort((a, b) => b.score !== a.score ? b.score - a.score : a.distance - b.distance)
        .slice(0, 3);

    return scored;
};

/* ── 위치명 ── */
const fetchLocationName = async (lat, lon) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`
        );
        const data = await res.json();
        const a = data.address || {};
        return [a.quarter || a.neighbourhood || a.suburb || a.village || a.town, a.city || a.county]
            .filter(Boolean).join(' ') || '현재 위치';
    } catch {
        return '현재 위치';
    }
};

/* ── 지도 ── */
let map = null;
const MARKER_COLORS = ['#e8473f', '#f0953a', '#4ca47b'];

const createNumberedIcon = (num, color) => L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg)">${num}</span></div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -34]
});

const createUserIcon = () => L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,0.35),0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: '', iconSize: [16, 16], iconAnchor: [8, 8]
});

const initMap = (lat, lon, restaurants) => {
    if (map) { map.remove(); map = null; }
    map = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.marker([lat, lon], { icon: createUserIcon() }).addTo(map).bindPopup('<strong>📍 현재 위치</strong>');

    const bounds = [[lat, lon]];
    restaurants.forEach((r, i) => {
        if (typeof r.lat !== 'number' || typeof r.lon !== 'number') return;
        bounds.push([r.lat, r.lon]);
        L.marker([r.lat, r.lon], { icon: createNumberedIcon(i + 1, MARKER_COLORS[i]) })
            .addTo(map)
            .bindPopup(`<strong>${r.name}</strong><br><span style="color:#666;font-size:.85em">${r.category}</span><br><span style="color:#888;font-size:.82em">${formatDistance(r.distance)}</span>`);
    });

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
    setTimeout(() => map && map.invalidateSize(), 150);
};

/* ── UI ── */
const resultSection = document.getElementById('result-section');
const restaurantList = document.getElementById('restaurant-list');
const locationNameEl = document.getElementById('location-name');
const dateTextEl = document.getElementById('date-text');
const weatherInfoEl = document.getElementById('weather-info');

const showLoading = () => {
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    restaurantList.innerHTML = `<div class="restaurant-card skeleton-card"><div class="skeleton sk-rank"></div><div class="skeleton-body"><div class="skeleton sk-title"></div><div class="skeleton sk-text"></div><div class="skeleton sk-text short"></div></div></div>`.repeat(3);
    locationNameEl.textContent = '위치 파악 중…';
    dateTextEl.textContent = '—';
    if (weatherInfoEl) weatherInfoEl.textContent = '—';
};

const WEATHER_LABELS = {
    hot: '☀️ 더운 날씨',
    cold: '🧣 추운 날씨',
    rainy: '🌧️ 비 오는 날씨',
    normal: '🌤️ 맑은 날씨'
};

const renderRestaurants = (restaurants, temp, weatherType) => {
    dateTextEl.textContent = new Intl.DateTimeFormat('ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short'
    }).format(new Date());

    if (weatherInfoEl) {
        weatherInfoEl.textContent = `${WEATHER_LABELS[weatherType]} ${Math.round(temp)}°C`;
    }

    restaurantList.innerHTML = restaurants.map((r, i) => `
        <article class="restaurant-card">
            <div class="rest-rank" style="background:${MARKER_COLORS[i]}">${i + 1}</div>
            <div class="rest-body">
                <div class="rest-header">
                    <h3 class="rest-name">${r.name}</h3>
                    <span class="rest-distance">${formatDistance(r.distance)}</span>
                </div>
                <div class="rest-tags">
                    <span class="rest-category">${r.category}</span>
                    <span class="rest-reason">${r.reason}</span>
                </div>
                ${r.address ? `<p class="rest-address">📌 ${r.address}</p>` : ''}
                ${r.phone ? `<p class="rest-phone">📞 ${r.phone}</p>` : ''}
                <a class="rest-link" href="${r.url || `https://map.kakao.com/?q=${encodeURIComponent(r.name)}`}" target="_blank" rel="noopener noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    카카오맵에서 평점·리뷰 보기
                </a>
            </div>
        </article>`).join('');
};

/* ── 메인 ── */
const run = async () => {
    showLoading();

    let coords;
    try {
        const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, timeout: 12000
            })
        );
        coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    } catch {
        resultSection.hidden = true;
        alert('위치 권한이 필요합니다. 브라우저 설정에서 위치 접근을 허용해 주세요.');
        return;
    }

    const hour = new Date().getHours();

    try {
        const [locationName, weather] = await Promise.all([
            fetchLocationName(coords.lat, coords.lon),
            fetchWeather(coords.lat, coords.lon)
        ]);

        const weatherType = getWeatherType(weather.code, weather.temp);
        locationNameEl.textContent = locationName;

        const restaurants = await fetchRestaurants(coords.lat, coords.lon, hour, weatherType);

        if (!restaurants.length) {
            restaurantList.innerHTML = '<p class="empty-msg">주변 800m 내 등록된 음식점이 없습니다.</p>';
            if (weatherInfoEl) weatherInfoEl.textContent = `${WEATHER_LABELS[weatherType]} ${Math.round(weather.temp)}°C`;
            dateTextEl.textContent = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
            return;
        }

        initMap(coords.lat, coords.lon, restaurants);
        renderRestaurants(restaurants, weather.temp, weatherType);

    } catch (e) {
        resultSection.hidden = true;
        alert(e.message || '정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
};

document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) { alert('이 브라우저는 위치 기능을 지원하지 않습니다.'); return; }
    run();
});
document.getElementById('retry-btn').addEventListener('click', run);

/* ── 모달 ── */
let disqusLoaded = false;
const loadDisqus = () => {
    if (disqusLoaded) return;
    disqusLoaded = true;
    window.disqus_config = function () {
        this.page.url = window.location.href;
        this.page.identifier = window.location.pathname;
    };
    const s = document.createElement('script');
    s.src = 'https://tradingcode.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (document.head || document.body).appendChild(s);
};

const openModal = (modal) => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
};
const closeModal = (modal) => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
};

const contactModal = document.getElementById('contact-modal');
const commentsModal = document.getElementById('comments-modal');

document.getElementById('contact-toggle').addEventListener('click', () => openModal(contactModal));
document.getElementById('comments-toggle').addEventListener('click', () => { loadDisqus(); openModal(commentsModal); });
document.querySelectorAll('.modal-close').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')))
);
document.querySelectorAll('.modal-overlay').forEach(overlay =>
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay); })
);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
        [contactModal, commentsModal].forEach(m => { if (m.classList.contains('is-open')) closeModal(m); });
});
