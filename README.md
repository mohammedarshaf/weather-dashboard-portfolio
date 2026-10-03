# M. Shahul Hameed - Portfolio & Real-Time Weather Dashboard

A modern, responsive multi-page web application featuring:
1. **Personal Portfolio**: Academic profile, AI/Data Science projects, technical skills, internships, and contact form.
2. **Real-Time Weather Dashboard**: Live atmospheric data powered by the free Open-Meteo API.

---

## Features

### 1. Portfolio Showcase
- **Semantic HTML5 & Modern CSS**: Layouts architected with CSS Grid, Flexbox, custom CSS variables, and fluid typography.
- **Interactive Capabilities**: Dynamic Light / Dark theme toggling, scroll spy, animated skill progress bars, and mobile navigation drawer.
- **Projects**: Highlights applied AI work such as MediBot (rural health triage) and semantic responsive web engineering.

### 2. Real-Time Weather Dashboard (`weather.html`)
- **Live Meteorological Data**: Fetches real-time temperature, relative humidity, wind velocity, apparent temperature, precipitation, and coordinates.
- **Global City Search**: Search any city worldwide via the Open-Meteo Geocoding API.
- **Quick City Selection**: Instant access to major cities (Madurai, Chennai, Bengaluru, Mumbai, Delhi, London, Tokyo, New York, Dubai).
- **Default City**: Automatically initializes with Madurai's live meteorological conditions.
- **7-Day Weather Outlook**: Multi-day forecast with daily highs, lows, and dynamic SVG condition icons.
- **°C / °F Unit Toggle**: Seamless switching between Celsius and Fahrenheit.
- **Error & Loading States**: Friendly error notifications for non-existent cities or network issues, and animated loading indicators.
- **Theme Synchronization**: Theme preferences (Light / Dark) persist across both pages via `localStorage`.

---

## Project Structure

```text
├── index.html          # Portfolio main entry point
├── style.css           # Portfolio styling system
├── script.js           # Portfolio interactive script
├── weather.html        # Real-time Weather Dashboard page
├── weather.css         # Dedicated Weather Dashboard styling
├── weather.js          # Open-Meteo API integration & dashboard logic
├── vite.config.ts      # Vite multi-page configuration (index.html & weather.html)
├── package.json        # Project metadata, scripts, and dependencies
├── tsconfig.json       # TypeScript configuration
├── metadata.json       # AI Studio app metadata
└── .gitignore          # Git ignore rules (node_modules, dist, etc.)
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or 20+ recommended)
- [npm](https://www.npmjs.com/)

### Installation & Run

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd weather-dashboard-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser:
   - **Portfolio**: [http://localhost:3000/](http://localhost:3000/)
   - **Weather Dashboard**: [http://localhost:3000/weather.html](http://localhost:3000/weather.html)

4. Build for production:
   ```bash
   npm run build
   ```
   Generates optimized multi-page output inside the `dist/` directory.

---

## Technologies Used
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+ async/await & Fetch API)
- **API**: [Open-Meteo Weather Forecast & Geocoding API](https://open-meteo.com/) (Free, no API key required)
- **Tooling & Bundler**: Vite (Multi-page configuration)
