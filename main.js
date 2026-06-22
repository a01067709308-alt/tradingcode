/* ── 테마 ── */
const THEME_KEY = 'weather-food-theme';
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

/* ── 날씨 코드 ── */
const WEATHER_CODE_MAP = new Map([
    [0, ['clear', '맑음']], [1, ['clear', '대체로 맑음']],
    [2, ['cloudy', '부분 흐림']], [3, ['cloudy', '흐림']],
    [45, ['cloudy', '안개']], [48, ['cloudy', '안개']],
    [51, ['rain', '이슬비']], [53, ['rain', '이슬비']], [55, ['rain', '이슬비']],
    [61, ['rain', '비']], [63, ['rain', '비']], [65, ['rain', '강한 비']],
    [71, ['snow', '눈']], [73, ['snow', '눈']], [75, ['snow', '폭설']],
    [80, ['rain', '소나기']], [81, ['rain', '소나기']], [82, ['rain', '강한 소나기']],
    [95, ['rain', '뇌우']], [96, ['rain', '뇌우']], [99, ['rain', '뇌우']]
]);

const getWeatherType = (code, temp) => {
    const [type = 'cloudy', label = '날씨 정보'] = WEATHER_CODE_MAP.get(code) || [];
    if (temp >= 28 && (type === 'clear' || type === 'cloudy')) return ['hot', `${label}, 더움`];
    if (temp <= 3 && (type === 'clear' || type === 'cloudy')) return ['cold', `${label}, 추움`];
    return [type, label];
};

/* ── 음식 데이터베이스 ── */
// tags: 잘 어울리는 날씨 / cuisine: 주변에 이 음식점이 많을 때 우선 추천
const FOOD_DB = [
    { name: '냉면', desc: '탱글한 면발에 시원한 육수, 더운 날 제1순위 메뉴입니다.', tags: ['hot'], cuisine: ['korean'], cat: 'noodle' },
    { name: '물회', desc: '해산물을 차갑게 버무린 새콤한 한 그릇, 더위를 날려줍니다.', tags: ['hot'], cuisine: ['korean'], cat: 'soup' },
    { name: '콩국수', desc: '고소한 콩물 국수, 속까지 시원하게 채워줍니다.', tags: ['hot'], cuisine: ['korean'], cat: 'noodle' },
    { name: '삼계탕', desc: '이열치열 보양식, 더운 여름 몸 보신에 딱 맞습니다.', tags: ['hot'], cuisine: ['korean'], cat: 'soup' },
    { name: '냉모밀', desc: '얼음물에 담긴 가벼운 메밀 국수, 더운 날 가볍게 즐기세요.', tags: ['hot', 'clear'], cuisine: ['japanese', 'korean'], cat: 'noodle' },
    { name: '팥빙수', desc: '달콤한 팥과 얼음의 조화, 무더위에 최고의 간식입니다.', tags: ['hot'], cuisine: ['korean'], cat: 'snack' },

    { name: '설렁탕', desc: '사골을 푹 고은 진한 국물이 추운 몸을 따뜻하게 데워줍니다.', tags: ['cold', 'snow'], cuisine: ['korean'], cat: 'soup' },
    { name: '순댓국', desc: '얼큰하고 구수한 국밥, 쌀쌀한 날 속을 든든히 채웁니다.', tags: ['cold', 'snow'], cuisine: ['korean'], cat: 'soup' },
    { name: '갈비탕', desc: '맑고 진한 갈비 국물이 추위를 녹여줍니다.', tags: ['cold', 'snow'], cuisine: ['korean'], cat: 'soup' },
    { name: '감자탕', desc: '뼈를 우린 진한 국물에 감자까지, 추운 날 최고의 한 끼입니다.', tags: ['cold'], cuisine: ['korean'], cat: 'soup' },
    { name: '부대찌개', desc: '얼큰하고 풍성한 재료가 추운 날 몸을 달궈줍니다.', tags: ['cold', 'rain'], cuisine: ['korean'], cat: 'soup' },
    { name: '곱창전골', desc: '진한 국물에 구수한 곱창이 어우러진 겨울 별미입니다.', tags: ['cold', 'snow'], cuisine: ['korean'], cat: 'soup' },

    { name: '파전', desc: '비 오는 날 막걸리 한 잔과 함께하는 고소한 전입니다.', tags: ['rain'], cuisine: ['korean'], cat: 'snack' },
    { name: '수제비', desc: '손으로 뜯은 면의 구수한 국물, 비 오는 날 떠오르는 메뉴입니다.', tags: ['rain', 'cold'], cuisine: ['korean'], cat: 'soup' },
    { name: '짬뽕', desc: '매콤한 해물 국물이 비 오는 날 몸을 달궈줍니다.', tags: ['rain', 'cold'], cuisine: ['chinese'], cat: 'soup' },
    { name: '어묵탕', desc: '따뜻한 어묵 국물 한 잔, 비 오는 날 간단하게 즐기세요.', tags: ['rain', 'cold'], cuisine: ['korean'], cat: 'snack' },
    { name: '우동', desc: '따뜻한 육수에 쫄깃한 면, 비 오는 날 간단한 한 끼입니다.', tags: ['rain', 'cold'], cuisine: ['japanese'], cat: 'noodle' },
    { name: '라멘', desc: '진한 육수와 쫄깃한 면, 비 오는 날 일본식 국수 한 그릇입니다.', tags: ['rain', 'cold', 'cloudy'], cuisine: ['japanese'], cat: 'noodle' },
    { name: '피자', desc: '여럿이 나눠 먹기 좋은 메뉴, 비 오는 날 배달로 즐겨보세요.', tags: ['rain', 'cloudy'], cuisine: ['italian', 'western'], cat: 'western' },

    { name: '떡만둣국', desc: '눈 오는 날 온 가족이 함께 먹는 따뜻한 국물 요리입니다.', tags: ['snow', 'cold'], cuisine: ['korean'], cat: 'soup' },
    { name: '전골', desc: '보글보글 끓는 냄비 요리, 눈 오는 날 여럿이 나눠 드세요.', tags: ['snow', 'cold'], cuisine: ['korean'], cat: 'soup' },

    { name: '비빔밥', desc: '알록달록 채소와 고명이 가득한 영양 만점 한 그릇입니다.', tags: ['clear', 'cloudy'], cuisine: ['korean'], cat: 'rice' },
    { name: '초밥', desc: '신선한 생선이 올라간 깔끔한 한 끼입니다.', tags: ['clear'], cuisine: ['japanese'], cat: 'rice' },
    { name: '돈가스', desc: '바삭한 튀김 옷의 두툼한 고기, 맑은 날 든든한 점심입니다.', tags: ['clear', 'cloudy'], cuisine: ['japanese', 'korean'], cat: 'western' },
    { name: '칼국수', desc: '직접 뽑은 면의 구수한 국물, 흐린 날 따뜻하게 즐기세요.', tags: ['cloudy', 'cold'], cuisine: ['korean'], cat: 'noodle' },
    { name: '오므라이스', desc: '달걀로 감싼 부드러운 볶음밥, 흐린 날 기분을 채워줍니다.', tags: ['cloudy'], cuisine: ['western', 'korean'], cat: 'rice' },
    { name: '파스타', desc: '다양한 소스와 면의 조합, 맑은 날 여유로운 한 끼입니다.', tags: ['clear', 'cloudy'], cuisine: ['italian', 'western'], cat: 'western' },
    { name: '짜장면', desc: '구수한 춘장 소스에 비벼 먹는 국민 중식 메뉴입니다.', tags: ['rain', 'cloudy'], cuisine: ['chinese'], cat: 'noodle' },
    { name: '삼겹살', desc: '불판에 구워 쌈 채소와 함께, 언제나 인기 있는 구이입니다.', tags: ['clear', 'cloudy', 'cold'], cuisine: ['korean'], cat: 'grill' },
    { name: '치킨', desc: '바삭하게 튀긴 닭, 날씨와 관계없이 항상 맛있습니다.', tags: ['clear', 'cloudy', 'rain', 'cold'], cuisine: ['korean', 'fast_food'], cat: 'grill' },
];

/* ── 추천 알고리즘 ── */
const getSeason = (month) => {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
};

const recommend = (weatherType, month, cuisineCounts) => {
    const season = getSeason(month);
    const totalPlaces = Object.values(cuisineCounts).reduce((a, b) => a + b, 0) || 1;

    const scored = FOOD_DB.map((food) => {
        let score = 0;

        // 날씨 일치 (핵심)
        if (food.tags.includes(weatherType)) score += 10;
        else score -= 5;

        // 계절 보너스
        const seasonBonus = { spring: 'clear', summer: 'hot', autumn: 'clear', winter: 'cold' };
        if (food.tags.includes(seasonBonus[season])) score += 2;

        // 주변 음식점 종류 가중치
        food.cuisine.forEach((c) => {
            if (cuisineCounts[c]) score += (cuisineCounts[c] / totalPlaces) * 8;
        });

        return { ...food, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // 카테고리가 다른 2가지 선택
    const result = [];
    const usedCat = new Set();
    for (const food of scored) {
        if (result.length >= 2) break;
        if (!usedCat.has(food.cat)) {
            result.push(food);
            usedCat.add(food.cat);
        }
    }
    // 카테고리 다양성 확보 실패 시 그냥 상위 2개
    if (result.length < 2) {
        for (const food of scored) {
            if (!result.includes(food)) { result.push(food); break; }
        }
    }
    return result.slice(0, 2);
};

/* ── API 호출 ── */
const fetchWeather = async (lat, lon) => {
    const params = new URLSearchParams({
        latitude: lat, longitude: lon,
        current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
        timezone: 'Asia/Seoul', forecast_days: '1'
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error('날씨 정보를 가져오지 못했습니다.');
    const data = await res.json();
    return data.current;
};

const fetchLocationName = async (lat, lon) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`,
            { headers: { 'Accept': 'application/json' } }
        );
        const data = await res.json();
        const a = data.address || {};
        // 동/읍/면 → 구/군 → 시 순으로 표시
        return [a.quarter || a.neighbourhood || a.suburb || a.village || a.town, a.city || a.county]
            .filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '현재 위치';
    } catch {
        return '현재 위치';
    }
};

// 카카오 로컬 API로 주변 음식점 조회
const KAKAO_KEY = '803fc99d6c59c84dd43e09d5815dcf8b';

const fetchNearbyRestaurants = async (lat, lon) => {
    try {
        const params = new URLSearchParams({
            category_group_code: 'FD6', // 음식점
            y: lat, x: lon,
            radius: 600,
            size: 15
        });
        const res = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?${params}`, {
            headers: { 'Authorization': `KakaoAK ${KAKAO_KEY}` }
        });
        if (!res.ok) throw new Error('Kakao API error');
        const data = await res.json();
        return data.documents || [];
    } catch {
        return []; // 실패 시 날씨만으로 추천
    }
};

const KAKAO_CUISINE_MAP = {
    '한식': 'korean', '분식': 'korean', '해장국': 'korean', '삼겹살': 'korean',
    '치킨': 'fast_food', '패스트푸드': 'fast_food', '버거': 'fast_food',
    '일식': 'japanese', '돈까스': 'japanese', '초밥': 'japanese', '라멘': 'japanese',
    '중식': 'chinese',
    '양식': 'western', '이탈리안': 'italian', '피자': 'italian', '파스타': 'italian',
    '카페': 'cafe', '베이커리': 'cafe',
};

const parseCuisines = (restaurants) => {
    const counts = {};
    restaurants.forEach((r) => {
        const category = r.category_name || '';
        Object.entries(KAKAO_CUISINE_MAP).forEach(([kor, eng]) => {
            if (category.includes(kor)) counts[eng] = (counts[eng] || 0) + 1;
        });
    });
    return counts;
};

/* ── UI 렌더링 ── */
const locateSection = document.getElementById('locate-section');
const resultSection = document.getElementById('result-section');
const foodEl = document.getElementById('food-recommendation');
const locationNameEl = document.getElementById('location-name');
const weatherTextEl = document.getElementById('weather-text');
const dateTextEl = document.getElementById('date-text');

const showLoading = () => {
    locateSection.hidden = true;
    resultSection.hidden = false;
    foodEl.innerHTML = `
        <div class="food-card loading-card">
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
        <div class="food-card loading-card">
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
        </div>`;
    locationNameEl.textContent = '위치 파악 중…';
    weatherTextEl.textContent = '—';
    dateTextEl.textContent = '—';
};

const showError = (msg) => {
    locateSection.hidden = false;
    resultSection.hidden = true;
    const btn = document.getElementById('locate-btn');
    btn.textContent = '다시 시도하기';
    document.querySelector('.locate-card p').textContent = msg;
};

const WEATHER_EMOJI = { clear: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️', hot: '🌡️', cold: '🥶' };

const renderResults = (locationName, current, weatherLabel, weatherType, foods, restaurantCount) => {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short'
    }).format(now);

    locationNameEl.textContent = locationName;
    weatherTextEl.textContent = `${WEATHER_EMOJI[weatherType] || '🌤️'} ${weatherLabel} ${Math.round(current.temperature_2m)}°C`;
    dateTextEl.textContent = dateStr;

    const nearbyNote = restaurantCount > 0
        ? `주변 ${restaurantCount}곳 음식점 분석 반영`
        : '날씨·계절 기반 추천';

    foodEl.innerHTML = foods.map((food, i) => `
        <article class="food-card">
            <span class="food-tag">추천 ${i + 1}</span>
            <h3>${food.name}</h3>
            <p>${food.desc}</p>
            <span class="food-basis">${nearbyNote}</span>
        </article>
    `).join('');
};

/* ── 메인 로직 ── */
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
    } catch (e) {
        showError('위치 권한이 필요합니다. 브라우저 설정에서 위치 접근을 허용해 주세요.');
        return;
    }

    try {
        const [locationName, current, restaurants] = await Promise.all([
            fetchLocationName(coords.lat, coords.lon),
            fetchWeather(coords.lat, coords.lon),
            fetchNearbyRestaurants(coords.lat, coords.lon),
        ]);

        const cuisineCounts = parseCuisines(restaurants);
        const [weatherType, weatherLabel] = getWeatherType(current.weather_code, current.temperature_2m);
        const month = new Date().getMonth() + 1;
        const foods = recommend(weatherType, month, cuisineCounts);

        renderResults(locationName, current, weatherLabel, weatherType, foods, restaurants.length);
    } catch (e) {
        showError('정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
};

document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError('이 브라우저는 위치 기능을 지원하지 않습니다.');
        return;
    }
    run();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    locateSection.hidden = false;
    resultSection.hidden = true;
});

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
document.getElementById('comments-toggle').addEventListener('click', () => {
    loadDisqus();
    openModal(commentsModal);
});
document.querySelectorAll('.modal-close').forEach((btn) =>
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')))
);
document.querySelectorAll('.modal-overlay').forEach((overlay) =>
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); })
);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        [contactModal, commentsModal].forEach((m) => { if (m.classList.contains('is-open')) closeModal(m); });
    }
});
