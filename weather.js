/**
 * Real-Time Weather Dashboard Scripts (weather.js)
 * Live Open-Meteo API integration with Geocoding, Forecast, Error Handling & Theme Sync
 */

// Weather Code Interpretation Map (WMO standard)
const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'sun', description: 'Sunny and completely clear skies' },
  1: { label: 'Mainly Clear', icon: 'sun-cloud', description: 'Mostly clear with few passing clouds' },
  2: { label: 'Partly Cloudy', icon: 'cloud-sun', description: 'Partly cloudy skies with sunny spells' },
  3: { label: 'Overcast', icon: 'cloud', description: 'Dense cloud cover across the sky' },
  45: { label: 'Foggy', icon: 'fog', description: 'Reduced visibility due to fog' },
  48: { label: 'Depositing Rime Fog', icon: 'fog', description: 'Dense freezing rime fog' },
  51: { label: 'Light Drizzle', icon: 'drizzle', description: 'Light intermittent drizzle' },
  53: { label: 'Moderate Drizzle', icon: 'drizzle', description: 'Steady moderate drizzle' },
  55: { label: 'Dense Drizzle', icon: 'drizzle', description: 'Heavy and dense drizzle' },
  61: { label: 'Slight Rain', icon: 'rain-light', description: 'Occasional light rainfall' },
  63: { label: 'Moderate Rain', icon: 'rain', description: 'Continuous moderate rainfall' },
  65: { label: 'Heavy Rain', icon: 'rain-heavy', description: 'Heavy rainfall with strong showers' },
  66: { label: 'Freezing Rain', icon: 'rain-freeze', description: 'Freezing rain creating slick surfaces' },
  67: { label: 'Heavy Freezing Rain', icon: 'rain-freeze', description: 'Intense freezing rain' },
  71: { label: 'Slight Snow', icon: 'snow', description: 'Light snow flurry showers' },
  73: { label: 'Moderate Snow', icon: 'snow', description: 'Steady moderate snowfall' },
  75: { label: 'Heavy Snow', icon: 'snow', description: 'Substantial heavy snowfall accumulation' },
  77: { label: 'Snow Grains', icon: 'snow', description: 'Fine frozen snow grains' },
  80: { label: 'Slight Showers', icon: 'rain-light', description: 'Passing light rain showers' },
  81: { label: 'Moderate Showers', icon: 'rain', description: 'Passing moderate rain showers' },
  82: { label: 'Violent Showers', icon: 'rain-heavy', description: 'Torrential violent downpours' },
  85: { label: 'Slight Snow Showers', icon: 'snow', description: 'Light passing snow showers' },
  86: { label: 'Heavy Snow Showers', icon: 'snow', description: 'Heavy passing snow showers' },
  95: { label: 'Thunderstorm', icon: 'thunder', description: 'Thunderstorm with lightning activity' },
  96: { label: 'Thunderstorm with Hail', icon: 'thunder-hail', description: 'Severe thunderstorm with light hail' },
  99: { label: 'Severe Thunderstorm', icon: 'thunder-hail', description: 'Violent thunderstorm with heavy hail' },
};

// Application State
let currentWeatherData = null;
let currentUnit = 'C'; // 'C' or 'F'

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSearch();
  initUnitToggle();
  initBackToTop();

  // Load Madurai by default as requested
  fetchWeatherData('Madurai');
});

/* ==========================================================================
   THEME SYNCHRONIZATION
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('shahul-portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('shahul-portfolio-theme', newTheme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('shahul-portfolio-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme) {
  const themeBtn = document.getElementById('theme-toggle');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Switch to light mode');
      themeBtn.setAttribute('title', 'Switch to light mode');
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'Switch to dark mode');
      themeBtn.setAttribute('title', 'Switch to dark mode');
    }
  }
}

/* ==========================================================================
   MOBILE MENU NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileToggle || !mobileMenu) return;

  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileToggle.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileToggle.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  const navLinks = mobileMenu.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !mobileToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   SEARCH & QUICK CITY HANDLERS
   ========================================================================== */
function initSearch() {
  const form = document.getElementById('city-search-form');
  const input = document.getElementById('city-input');
  const retryBtn = document.getElementById('retry-btn');

  const cityChips = document.querySelectorAll('.city-chip');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cityQuery = input.value.trim();
      if (!cityQuery) {
        input.focus();
        return;
      }
      cityChips.forEach((c) => {
        const chipCity = c.getAttribute('data-city') || c.textContent.trim();
        if (chipCity.toLowerCase() === cityQuery.toLowerCase()) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
      fetchWeatherData(cityQuery);
    });
  }
  cityChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cityName = chip.getAttribute('data-city') || chip.textContent.trim();
      if (input) input.value = cityName;
      cityChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      fetchWeatherData(cityName);
    });
  });

  // Retry Button
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      const cityQuery = (input && input.value.trim()) || 'Madurai';
      fetchWeatherData(cityQuery);
    });
  }
}

/* ==========================================================================
   TEMPERATURE UNIT TOGGLE (°C / °F)
   ========================================================================== */
function initUnitToggle() {
  const btnC = document.getElementById('unit-c');
  const btnF = document.getElementById('unit-f');

  if (!btnC || !btnF) return;

  btnC.addEventListener('click', () => {
    if (currentUnit === 'C') return;
    currentUnit = 'C';
    btnC.classList.add('active');
    btnF.classList.remove('active');
    if (currentWeatherData) renderWeatherUI(currentWeatherData);
  });

  btnF.addEventListener('click', () => {
    if (currentUnit === 'F') return;
    currentUnit = 'F';
    btnF.classList.add('active');
    btnC.classList.remove('active');
    if (currentWeatherData) renderWeatherUI(currentWeatherData);
  });
}

function formatTemp(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (currentUnit === 'F') {
    const fahrenheit = Math.round((celsius * 9) / 5 + 32);
    return `${fahrenheit}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

function formatTempNumber(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (currentUnit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/* ==========================================================================
   WEATHER DATA FETCHING (ASYNC / AWAIT / FETCH / TRY-CATCH-FINALLY)
   ========================================================================== */
async function fetchWeatherData(cityName) {
  const loadingCard = document.getElementById('loading-state');
  const errorCard = document.getElementById('error-state');
  const weatherDisplay = document.getElementById('weather-display');
  const loadingCityText = document.getElementById('loading-city-name');
  const errorMessage = document.getElementById('error-message');

  // 1. Prepare UI for loading
  if (loadingCityText) loadingCityText.textContent = `Fetching live meteorological data for "${cityName}"...`;
  if (loadingCard) loadingCard.classList.add('active');
  if (errorCard) errorCard.classList.remove('active');
  if (weatherDisplay) weatherDisplay.classList.remove('active');

  try {
    // STEP 1: Geocoding via Open-Meteo Geocoding API
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName.trim())}&count=1&language=en&format=json`;
    
    let geoResponse;
    try {
      geoResponse = await fetch(geocodingUrl);
    } catch (networkErr) {
      throw new Error('Unable to connect to the weather service. Please check your internet connection and try again.');
    }

    if (!geoResponse.ok) {
      throw new Error(`Geocoding service returned status ${geoResponse.status}. Please try again later.`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`We couldn't locate any city named "${cityName}". Please check the spelling or try another city.`);
    }

    const location = geoData.results[0];
    const { name, latitude, longitude, country, admin1, elevation, timezone } = location;

    // STEP 2: Weather Forecast via Open-Meteo Weather API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    let weatherResponse;
    try {
      weatherResponse = await fetch(forecastUrl);
    } catch (networkErr) {
      throw new Error('Network error while retrieving atmospheric metrics. Please verify connectivity.');
    }

    if (!weatherResponse.ok) {
      throw new Error(`Weather forecast service returned status ${weatherResponse.status}.`);
    }

    const weatherData = await weatherResponse.json();

    // Package parsed data
    currentWeatherData = {
      location: {
        city: name,
        country: country || 'Unknown',
        region: admin1 || '',
        latitude,
        longitude,
        elevation: elevation !== undefined ? `${elevation}m` : 'N/A',
        timezone: timezone || 'UTC',
      },
      current: weatherData.current,
      daily: weatherData.daily,
    };

    // Render results
    renderWeatherUI(currentWeatherData);
    if (weatherDisplay) weatherDisplay.classList.add('active');

  } catch (error) {
    console.error('Weather dashboard error:', error);
    if (errorMessage) {
      errorMessage.textContent = error.message || 'An unexpected error occurred while fetching weather data.';
    }
    if (errorCard) errorCard.classList.add('active');
  } finally {
    // Hide loading indicator regardless of outcome
    if (loadingCard) loadingCard.classList.remove('active');
  }
}

/* ==========================================================================
   RENDER WEATHER DATA TO DOM
   ========================================================================== */
function renderWeatherUI(data) {
  const { location, current, daily } = data;

  // City & Country Details
  const cityNameEl = document.getElementById('city-name');
  const countryEl = document.getElementById('country-name');
  const regionEl = document.getElementById('region-name');
  const lastUpdatedEl = document.getElementById('last-updated-time');

  if (cityNameEl) cityNameEl.textContent = location.city;
  if (countryEl) countryEl.textContent = location.country;
  if (regionEl) {
    regionEl.textContent = location.region ? `${location.region}, ${location.country}` : location.country;
  }

  if (lastUpdatedEl) {
    const now = new Date();
    lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Weather Code Details
  const code = current.weather_code ?? 0;
  const isDay = current.is_day === 1;
  const weatherMeta = WMO_WEATHER_CODES[code] || {
    label: 'Moderate Conditions',
    icon: 'cloud-sun',
    description: 'Variable meteorological conditions',
  };

  // Weather Condition Icon
  const iconContainer = document.getElementById('weather-icon-container');
  if (iconContainer) {
    iconContainer.innerHTML = getWeatherSVG(weatherMeta.icon, isDay);
  }

  // Condition Text
  const conditionEl = document.getElementById('weather-condition');
  if (conditionEl) conditionEl.textContent = weatherMeta.label;

  // Temperature
  const tempValEl = document.getElementById('temp-value');
  const apparentTempEl = document.getElementById('apparent-temp');
  if (tempValEl) tempValEl.textContent = formatTempNumber(current.temperature_2m);
  if (apparentTempEl) {
    apparentTempEl.textContent = `Feels like ${formatTemp(current.apparent_temperature)}`;
  }

  // Today's High & Low
  const highTempEl = document.getElementById('today-high');
  const lowTempEl = document.getElementById('today-low');
  if (daily && daily.temperature_2m_max && daily.temperature_2m_max[0] !== undefined) {
    if (highTempEl) highTempEl.textContent = `H: ${formatTemp(daily.temperature_2m_max[0])}`;
  }
  if (daily && daily.temperature_2m_min && daily.temperature_2m_min[0] !== undefined) {
    if (lowTempEl) lowTempEl.textContent = `L: ${formatTemp(daily.temperature_2m_min[0])}`;
  }

  // Atmospheric Metrics
  // 1. Humidity
  const humidityEl = document.getElementById('metric-humidity');
  const humidityDescEl = document.getElementById('metric-humidity-desc');
  if (humidityEl) humidityEl.textContent = `${current.relative_humidity_2m}%`;
  if (humidityDescEl) {
    const h = current.relative_humidity_2m;
    let desc = 'Comfortable moisture level';
    if (h > 75) desc = 'High humidity, muggy feel';
    else if (h < 30) desc = 'Low humidity, dry air';
    humidityDescEl.textContent = desc;
  }

  // 2. Wind Speed
  const windEl = document.getElementById('metric-wind');
  const windDescEl = document.getElementById('metric-wind-desc');
  if (windEl) windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  if (windDescEl) {
    const w = current.wind_speed_10m;
    let desc = 'Light breeze';
    if (w < 5) desc = 'Calm atmospheric motion';
    else if (w < 20) desc = 'Gentle moderate breeze';
    else if (w < 40) desc = 'Fresh strong breeze';
    else desc = 'High wind warning';
    windDescEl.textContent = desc;
  }

  // 3. Precipitation
  const precipEl = document.getElementById('metric-precipitation');
  const precipDescEl = document.getElementById('metric-precipitation-desc');
  if (precipEl) precipEl.textContent = `${current.precipitation ?? 0} mm`;
  if (precipDescEl) {
    const p = current.precipitation ?? 0;
    precipDescEl.textContent = p > 0 ? 'Precipitation observed' : 'Zero precipitation recorded';
  }

  // 4. Coordinates & Elevation
  const coordsEl = document.getElementById('metric-coords');
  const elevationEl = document.getElementById('metric-coords-desc');
  if (coordsEl) {
    coordsEl.textContent = `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
  }
  if (elevationEl) {
    elevationEl.textContent = `Elevation: ${location.elevation} | Zone: ${location.timezone}`;
  }

  // 7-Day Forecast Grid
  renderDailyForecast(daily);
}

function renderDailyForecast(daily) {
  const container = document.getElementById('forecast-grid');
  if (!container || !daily || !daily.time) return;

  container.innerHTML = '';

  const daysCount = Math.min(daily.time.length, 7);
  for (let i = 0; i < daysCount; i++) {
    const dateStr = daily.time[i];
    const dateObj = new Date(`${dateStr}T12:00:00`);
    const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const code = daily.weather_code ? daily.weather_code[i] : 0;
    const weatherMeta = WMO_WEATHER_CODES[code] || { label: 'Clear', icon: 'sun' };
    const maxTemp = formatTemp(daily.temperature_2m_max ? daily.temperature_2m_max[i] : null);
    const minTemp = formatTemp(daily.temperature_2m_min ? daily.temperature_2m_min[i] : null);

    const card = document.createElement('article');
    card.className = `forecast-card${i === 0 ? ' is-today' : ''}`;
    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-date">${formattedDate}</span>
      <div class="forecast-icon" aria-hidden="true">
        ${getWeatherSVG(weatherMeta.icon, true)}
      </div>
      <span class="forecast-condition">${weatherMeta.label}</span>
      <div class="forecast-temps">
        <span class="forecast-max">${maxTemp}</span>
        <span class="forecast-min">${minTemp}</span>
      </div>
    `;

    container.appendChild(card);
  }
}

/* ==========================================================================
   DYNAMIC WEATHER SVG ICONS
   ========================================================================== */
function getWeatherSVG(iconType, isDay = true) {
  switch (iconType) {
    case 'sun':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="14" fill="#fbbf24" fill-opacity="0.2"></circle>
          <line x1="32" y1="6" x2="32" y2="12"></line>
          <line x1="32" y1="52" x2="32" y2="58"></line>
          <line x1="6" y1="32" x2="12" y2="32"></line>
          <line x1="52" y1="32" x2="58" y2="32"></line>
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"></line>
          <line x1="46.2" y1="46.2" x2="50.4" y2="50.4"></line>
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"></line>
          <line x1="46.2" y1="17.8" x2="50.4" y2="13.6"></line>
        </svg>
      `;

    case 'sun-cloud':
    case 'cloud-sun':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="26" cy="24" r="10" stroke="#f59e0b" stroke-width="2.5" fill="#fde68a" fill-opacity="0.3"></circle>
          <line x1="26" y1="8" x2="26" y2="11" stroke="#f59e0b" stroke-width="2.5"></line>
          <line x1="13" y1="17" x2="15.5" y2="19.5" stroke="#f59e0b" stroke-width="2.5"></line>
          <line x1="39" y1="17" x2="36.5" y2="19.5" stroke="#f59e0b" stroke-width="2.5"></line>
          <path d="M46 44a9 9 0 0 0-1.8-17.8 14 14 0 0 0-26.4 4.8A8 8 0 0 0 20 44z" stroke="#3b82f6" stroke-width="3" fill="#93c5fd" fill-opacity="0.25"></path>
        </svg>
      `;

    case 'cloud':
    case 'fog':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 46a10 10 0 0 0-2-19.8 15 15 0 0 0-28 5.3A9 9 0 0 0 20 46z" fill="#cbd5e1" fill-opacity="0.3"></path>
          ${iconType === 'fog' ? '<line x1="16" y1="52" x2="48" y2="52"></line><line x1="20" y1="58" x2="44" y2="58"></line>' : ''}
        </svg>
      `;

    case 'drizzle':
    case 'rain-light':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 38a9 9 0 0 0-2-17.8 14 14 0 0 0-26 4.8A8 8 0 0 0 22 38z" stroke="#3b82f6" stroke-width="3" fill="#bfdbfe" fill-opacity="0.3"></path>
          <line x1="24" y1="46" x2="22" y2="52" stroke="#60a5fa" stroke-width="2.5"></line>
          <line x1="34" y1="46" x2="32" y2="52" stroke="#60a5fa" stroke-width="2.5"></line>
          <line x1="44" y1="46" x2="42" y2="52" stroke="#60a5fa" stroke-width="2.5"></line>
        </svg>
      `;

    case 'rain':
    case 'rain-heavy':
    case 'rain-freeze':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 36a9 9 0 0 0-2-17.8 14 14 0 0 0-26 4.8A8 8 0 0 0 22 36z" stroke="#2563eb" stroke-width="3" fill="#93c5fd" fill-opacity="0.35"></path>
          <line x1="22" y1="44" x2="18" y2="54" stroke="#2563eb" stroke-width="3"></line>
          <line x1="32" y1="44" x2="28" y2="54" stroke="#2563eb" stroke-width="3"></line>
          <line x1="42" y1="44" x2="38" y2="54" stroke="#2563eb" stroke-width="3"></line>
        </svg>
      `;

    case 'snow':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 36a9 9 0 0 0-2-17.8 14 14 0 0 0-26 4.8A8 8 0 0 0 22 36z" stroke="#94a3b8" stroke-width="3" fill="#e2e8f0" fill-opacity="0.35"></path>
          <circle cx="22" cy="48" r="2" fill="#38bdf8"></circle>
          <circle cx="32" cy="52" r="2" fill="#38bdf8"></circle>
          <circle cx="42" cy="48" r="2" fill="#38bdf8"></circle>
        </svg>
      `;

    case 'thunder':
    case 'thunder-hail':
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 34a9 9 0 0 0-2-17.8 14 14 0 0 0-26 4.8A8 8 0 0 0 22 34z" stroke="#475569" stroke-width="3" fill="#94a3b8" fill-opacity="0.35"></path>
          <polygon points="32 38 24 50 32 50 28 62 42 46 34 46 38 38" fill="#f59e0b" stroke="#d97706" stroke-width="2"></polygon>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 64 64" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="32" r="14" fill="#3b82f6" fill-opacity="0.2"></circle>
        </svg>
      `;
  }
}

/* ==========================================================================
   BACK TO TOP SCROLLER
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
