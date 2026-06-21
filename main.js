const THEME_STORAGE_KEY = 'weather-food-theme';
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeLabel = document.querySelector('.theme-label');
const regionGrid = document.getElementById('region-grid');
const selectedRegion = document.getElementById('selected-region');
const weatherSummary = document.getElementById('weather-summary');
const weatherMetrics = document.getElementById('weather-metrics');
const recommendationDiv = document.getElementById('food-recommendation');

const regions = [
    { id: 'gyeonggi', name: '경기권', place: '서울', lat: 37.5665, lon: 126.9780 },
    { id: 'gangwon', name: '강원권', place: '춘천', lat: 37.8813, lon: 127.7298 },
    { id: 'chungbuk', name: '충북권', place: '청주', lat: 36.6424, lon: 127.4890 },
    { id: 'chungnam', name: '충남권', place: '대전', lat: 36.3504, lon: 127.3845 },
    { id: 'jeonbuk', name: '전북권', place: '전주', lat: 35.8242, lon: 127.1480 },
    { id: 'jeonnam', name: '전남권', place: '광주', lat: 35.1595, lon: 126.8526 },
    { id: 'gyeongbuk', name: '경북권', place: '대구', lat: 35.8714, lon: 128.6014 },
    { id: 'gyeongnam', name: '경남권', place: '부산', lat: 35.1796, lon: 129.0756 }
];

const recommendationSets = {
    clear: [
        ['냉모밀', '맑은 날 가볍게 먹기 좋은 시원한 면 요리입니다.'],
        ['비빔밥', '채소와 고명을 넉넉히 더해 산뜻하게 즐기기 좋습니다.'],
        ['초밥', '깔끔하고 부담이 적어 외출 전후 식사로 잘 맞습니다.'],
        ['샐러드 파스타', '상큼한 채소와 면을 함께 먹는 밝은 날 메뉴입니다.'],
        ['콩국수', '햇볕 강한 날 고소하고 시원하게 먹기 좋습니다.']
    ],
    cloudy: [
        ['칼국수', '흐린 날에 따뜻한 국물이 든든하게 어울립니다.'],
        ['오므라이스', '부드럽고 편안한 맛으로 흐린 날 기분을 채웁니다.'],
        ['돈가스', '바삭한 식감이 흐린 날에도 만족감을 줍니다.'],
        ['크림 리조또', '고소하고 묵직한 한 그릇 메뉴입니다.'],
        ['김치볶음밥', '간단하지만 풍미가 확실한 컴포트 푸드입니다.']
    ],
    rain: [
        ['파전', '비 오는 날 대표 메뉴로 고소한 전이 잘 어울립니다.'],
        ['수제비', '촉촉한 날씨에 뜨끈한 국물이 잘 맞습니다.'],
        ['부대찌개', '얼큰한 국물과 푸짐한 재료가 만족스럽습니다.'],
        ['짬뽕', '비 오는 날 매콤한 국물로 몸을 데우기 좋습니다.'],
        ['어묵탕', '따뜻하고 가볍게 나눠 먹기 좋은 메뉴입니다.']
    ],
    snow: [
        ['떡만둣국', '눈 오는 날 따뜻하고 든든하게 먹기 좋습니다.'],
        ['갈비탕', '진한 국물이 추운 날 몸을 데워줍니다.'],
        ['군고구마', '겨울 분위기와 잘 맞는 달콤한 간식입니다.'],
        ['핫초코', '눈 내리는 날 달콤하게 마시기 좋습니다.'],
        ['전골', '여럿이 따뜻하게 나눠 먹기 좋은 메뉴입니다.']
    ],
    hot: [
        ['냉면', '더운 날 빠르게 시원해지는 대표 메뉴입니다.'],
        ['물회', '차갑고 새콤한 국물이 더위에 잘 맞습니다.'],
        ['열무국수', '가볍고 시원하게 먹기 좋은 여름 메뉴입니다.'],
        ['과일 화채', '수분감이 많아 더운 날 간식으로 좋습니다.'],
        ['메밀소바', '깔끔하고 차가운 면 요리로 부담이 적습니다.']
    ],
    cold: [
        ['순댓국', '쌀쌀한 날 속을 따뜻하게 채워줍니다.'],
        ['설렁탕', '담백한 국물이 추운 날에 잘 어울립니다.'],
        ['김치찌개', '칼칼한 국물로 체온을 올리기 좋습니다.'],
        ['닭곰탕', '부드럽고 든든한 따뜻한 한 끼입니다.'],
        ['감자탕', '푸짐하고 진한 국물이 추운 날에 좋습니다.']
    ]
};

const weatherCodeMap = new Map([
    [0, ['clear', '맑음']],
    [1, ['clear', '대체로 맑음']],
    [2, ['cloudy', '부분적으로 흐림']],
    [3, ['cloudy', '흐림']],
    [45, ['cloudy', '안개']],
    [48, ['cloudy', '상고대 안개']],
    [51, ['rain', '약한 이슬비']],
    [53, ['rain', '이슬비']],
    [55, ['rain', '강한 이슬비']],
    [61, ['rain', '약한 비']],
    [63, ['rain', '비']],
    [65, ['rain', '강한 비']],
    [71, ['snow', '약한 눈']],
    [73, ['snow', '눈']],
    [75, ['snow', '강한 눈']],
    [80, ['rain', '약한 소나기']],
    [81, ['rain', '소나기']],
    [82, ['rain', '강한 소나기']],
    [95, ['rain', '뇌우']],
    [96, ['rain', '우박 동반 뇌우']],
    [99, ['rain', '강한 우박 동반 뇌우']]
]);

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    const isDark = theme === 'dark';

    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? '화이트 모드로 전환' : '다크 모드로 전환');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    themeLabel.textContent = isDark ? '화이트 모드' : '다크 모드';
};

const getWeatherType = (code, temperature) => {
    const [type = 'cloudy', label = '날씨 정보'] = weatherCodeMap.get(code) || [];

    if (temperature >= 28 && (type === 'clear' || type === 'cloudy')) {
        return ['hot', `${label}, 더움`];
    }

    if (temperature <= 3 && (type === 'clear' || type === 'cloudy')) {
        return ['cold', `${label}, 추움`];
    }

    return [type, label];
};

const formatTime = (isoTime) => {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(isoTime));
};

const renderRegions = () => {
    regionGrid.innerHTML = regions.map((region) => `
        <button class="region-btn" type="button" data-region="${region.id}">
            <strong>${region.name}</strong>
            <span>대표 관측: ${region.place}</span>
        </button>
    `).join('');
};

const setActiveRegion = (regionId) => {
    document.querySelectorAll('.region-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.region === regionId);
    });
};

const setLoading = (region) => {
    selectedRegion.textContent = `${region.name} 날씨 불러오는 중`;
    weatherSummary.textContent = `${region.place} 기준 실시간 기상 정보를 조회하고 있습니다.`;
    weatherMetrics.hidden = true;
    recommendationDiv.className = 'loading-state';
    recommendationDiv.textContent = '추천 음식을 준비하고 있습니다.';
};

const renderWeather = (region, current) => {
    const [weatherType, weatherLabel] = getWeatherType(current.weather_code, current.temperature_2m);
    const foods = recommendationSets[weatherType] || recommendationSets.cloudy;

    selectedRegion.textContent = `${region.name} · ${region.place}`;
    weatherSummary.textContent = `${weatherLabel} 기준으로 지금 먹기 좋은 음식 5가지를 추천합니다.`;
    weatherMetrics.hidden = false;
    weatherMetrics.innerHTML = `
        <div class="metric"><span>기온</span><strong>${Math.round(current.temperature_2m)}°C</strong></div>
        <div class="metric"><span>체감 바람</span><strong>${Math.round(current.wind_speed_10m)} km/h</strong></div>
        <div class="metric"><span>강수</span><strong>${current.precipitation.toFixed(1)} mm</strong></div>
        <div class="metric"><span>관측 시각</span><strong>${formatTime(current.time)}</strong></div>
    `;
    recommendationDiv.className = 'food-grid';
    recommendationDiv.innerHTML = foods.map(([name, description], index) => `
        <article class="food-card">
            <span class="food-tag">추천 ${index + 1}</span>
            <h3>${name}</h3>
            <p>${description}</p>
        </article>
    `).join('');
};

const renderError = (region) => {
    selectedRegion.textContent = `${region.name} 조회 실패`;
    weatherSummary.textContent = '실시간 날씨 정보를 가져오지 못했습니다. 잠시 뒤 다시 선택해 주세요.';
    weatherMetrics.hidden = true;
    recommendationDiv.className = 'error-state';
    recommendationDiv.textContent = '네트워크 상태 또는 날씨 API 응답을 확인해야 합니다.';
};

const fetchWeather = async (region) => {
    const params = new URLSearchParams({
        latitude: region.lat,
        longitude: region.lon,
        current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
        timezone: 'Asia/Seoul',
        forecast_days: '1'
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

    if (!response.ok) {
        throw new Error('Weather request failed');
    }

    const data = await response.json();
    return data.current;
};

const handleRegionClick = async (regionId) => {
    const region = regions.find((item) => item.id === regionId);

    if (!region) {
        return;
    }

    setActiveRegion(region.id);
    setLoading(region);

    try {
        const current = await fetchWeather(region);
        renderWeather(region, current);
    } catch (error) {
        renderError(region);
    }
};

applyTheme(getInitialTheme());
renderRegions();

themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
});

regionGrid.addEventListener('click', (event) => {
    const button = event.target.closest('.region-btn');

    if (button) {
        handleRegionClick(button.dataset.region);
    }
});

handleRegionClick('gyeonggi');
