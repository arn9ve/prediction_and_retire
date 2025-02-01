# ETF Investment Calculator

A modern web application built with Next.js that helps users calculate and visualize their potential investment returns with ETFs (Exchange-Traded Funds).

## Features

- 📊 Real-time ETF data from Yahoo Finance
- 💰 Investment return calculations with Monte Carlo simulations
- 🌍 Multi-currency support with automatic currency conversion
- 📱 Responsive design that works on all devices
- 📈 Interactive charts showing investment growth
- 🌐 Automatic location detection and currency selection
- 🎯 Support for various ETF types:
  - S&P 500 ETFs
  - Nasdaq-100 ETFs
  - Total Market ETFs

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Charts**: Custom Line Chart component
- **State Management**: React Hooks
- **API Integration**: Yahoo Finance API
- **Animations**: Framer Motion

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── etf-market-data/  # ETF market data endpoint
│   │   └── yahoo-finance/    # Yahoo Finance proxy endpoint
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # UI components
│   └── etf-select.tsx    # ETF selection component
├── lib/                  # Utility functions
│   ├── monte-carlo.ts    # Monte Carlo simulation
│   └── yahoo-finance.ts  # Yahoo Finance API integration
├── types/                # TypeScript type definitions
└── data/                 # Static data and configurations
```

## Features in Detail

### ETF Data
- Real-time market data fetching from Yahoo Finance
- Historical performance data
- Volume and price information
- Automatic growth rate calculations

### Investment Calculations
- Monthly deposit projections
- Compound interest calculations
- Monte Carlo simulations for risk assessment
- Inflation-adjusted future values

### Currency Support
- Automatic currency detection based on location
- Real-time currency conversion
- Support for major world currencies (USD, EUR, GBP, etc.)

### User Interface
- Clean and modern design
- Interactive charts
- Responsive layout
- Smooth animations
- Tooltips for better user guidance

## Recent Updates

- Fixed API endpoint issues
- Improved type definitions for ETF data
- Enhanced error handling for API calls
- Added proper null value handling
- Updated currency conversion logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
