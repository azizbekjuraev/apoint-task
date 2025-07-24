# APOINT Task - React Materials Report

A React application for displaying hierarchical materials reports with authentication and data grouping functionality.

## Features

- 🔐 **Authentication System**: Login page with token-based authentication
- 📊 **Hierarchical Table**: Collapsible table with parent -> category -> item grouping
- 📈 **Data Aggregation**: Automatic calculation of totals at all levels
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🔒 **Protected Routes**: Unauthorized users cannot access reports without login
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19** - Main framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS Grid & Flexbox** - Modern layout system
- **Vite** - Build tool and development server

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Login page component
│   ├── Login.css          # Login styles
│   ├── Reports.jsx        # Reports table component
│   └── Reports.css        # Reports styles
├── contexts/
│   └── AuthContext.jsx    # Authentication context
├── config/
│   └── api.js            # Axios configuration
├── App.jsx               # Main app component
├── App.css               # Global styles
└── main.jsx             # App entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://apialfa.apoint.uz/v1
```

Or update the base URL in `src/config/api.js`:

```javascript
axios.defaults.baseURL = 'http://apialfa.apoint.uz/v1';
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## API Endpoints

### Authentication
- **POST** `/hr/user/sign-in?include=token`
  - Body: `{ "username": "", "password": "" }`
  - Returns: `{ "token": "..." }`

### Reports
- **GET** `/reports/reports/materials?sort=name&start=YYYY-MM-DD&end=YYYY-MM-DD`
  - Requires: Authorization header with Bearer token
  - Returns: Array of material items with parent/category grouping

## Data Structure

Each material item contains:
```javascript
{
  "parent": "string",           // Parent category
  "category": "string",         // Sub-category
  "name": "string",            // Item name
  "remind_start_amount": number, // Balance at beginning (quantity)
  "remind_start_sum": number,    // Balance at beginning (sum)
  "remind_income_amount": number, // Income quantity
  "remind_income_sum": number,    // Income sum
  "remind_outgo_amount": number,  // Expense quantity
  "remind_outgo_sum": number,     // Expense sum
  "remind_end_amount": number,    // Balance at end (quantity)
  "remind_end_sum": number        // Balance at end (sum)
}
```

## Features Explained

### Authentication Flow
1. User visits any route → redirected to `/login` if not authenticated
2. User enters credentials → POST to `/hr/user/sign-in`
3. Token stored in localStorage → user redirected to `/reports`
4. All subsequent requests include Authorization header

### Table Features
- **Hierarchical Display**: Parent → Category → Item structure
- **Collapse/Expand**: Click +/- buttons to show/hide children
- **Auto Totals**: Calculates sums at parent, category, and grand total levels
- **Number Formatting**: Russian locale formatting with thousands separators
- **Responsive**: Horizontal scroll on mobile devices

### Data Processing
- Groups raw data by parent and category
- Calculates totals for each group level
- Maintains collapse state for user experience
- Handles missing or null values gracefully

## Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Base URL for API calls | Yes |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration included
- Prettier formatting recommended
- Component-based architecture
- Custom hooks for reusable logic

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure API server allows requests from your domain
2. **Authentication Fails**: Check API URL and credentials
3. **Data Not Loading**: Verify API endpoint and token validity
4. **Build Errors**: Ensure all dependencies are installed

### Debug Mode

Add to browser console for debugging:
```javascript
localStorage.setItem('debug', 'true');
```

## License

This project is created for the APOINT task assessment.
