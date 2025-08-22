# Skincare E-commerce Platform

A full-stack skincare e-commerce application built with React (TypeScript) frontend and PHP backend with MySQL database.

## Features

- Product catalog with detailed product pages
- User authentication and registration
- Shopping cart functionality
- Wishlist management
- Customer reviews with ratings and before/after images
- Responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Icons for UI icons
- React Toastify for notifications

**Backend:**
- PHP with MySQL
- RESTful API endpoints
- File upload handling for images
- CORS enabled for cross-origin requests

**Database:**
- MySQL with Docker containerization

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Bun (JavaScript runtime and package manager)

### Installation & Setup

1. **Start the backend services (PHP + MySQL)**
   ```bash
   docker compose up --build
   ```

2. **Navigate to the frontend directory**
   ```bash
   cd Skincare-Frontend
   ```

3. **Install frontend dependencies**
   ```bash
   bun i
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost` (port 80)

## Project Structure

```
├── Skincare-Frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   └── assets/            # Static assets
├── review/                    # Review API endpoints
├── db/                        # Database configuration
└── docker-compose.yml         # Docker services configuration
```

## API Endpoints

- `GET /review/show.php?pid={productId}` - Get reviews for a product
- `POST /review/add.php` - Add a new review
- `GET /product-detail.php?id={productId}` - Get product details
- `POST /wishlist/add.php` - Add item to wishlist

## Development

The frontend uses Vite's hot module replacement for fast development. Changes to React components will be reflected immediately in the browser.

The backend API is containerized with Docker and includes CORS headers for development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
