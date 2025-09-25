# CryptoPortfolio

A comprehensive cryptocurrency portfolio management application built with Next.js 15, Supabase, and TypeScript. Track your crypto transactions, analyze holdings, and monitor portfolio performance with real-time data.

## 🚀 Features

### 📊 Portfolio Management

- **Real-time Holdings Tracking**: View your current crypto holdings with live price updates
- **Portfolio Summary**: Total portfolio value, cost basis, profit/loss calculations
- **Performance Analytics**: Detailed P&L analysis with percentage calculations
- **CSV Export**: Export portfolio holdings and summaries to CSV format

<img width="1811" height="866" alt="image" src="https://github.com/user-attachments/assets/9cad4c23-0656-43a9-80b8-772c7892b906" />


### 💰 Transaction Management

- **CSV Import**: Bulk import transactions from CSV files
- **Transaction History**: Complete transaction history with filtering and pagination
- **Edit/Delete**: Modify or remove individual transactions
- **Duplicate Prevention**: Automatic duplicate transaction detection

<img width="1793" height="861" alt="image" src="https://github.com/user-attachments/assets/12fa5bf4-0899-4ed4-97a9-8bca56368316" />


### 📈 Analytics & Reporting

- **Audit Logs**: Complete audit trail of all user actions
- **Leaderboard**: Compare portfolio performance with other users
- **Filtering**: Advanced filtering by symbol, type, date range, and file name
- **Real-time Updates**: Live price updates from integrated price tracking

<img width="1562" height="554" alt="image" src="https://github.com/user-attachments/assets/6ae75085-e503-4161-9f3a-e19b9a15884d" />


### 🔐 Security & Authentication

- **User Authentication**: Secure login/signup with Supabase Auth
- **Row Level Security**: Database-level security ensuring users only see their own data
- **Audit Trail**: Complete logging of all CRUD operations

<img width="1770" height="914" alt="image" src="https://github.com/user-attachments/assets/3cf8c002-82f7-42b3-887e-83faa58ea79e" />


### 🎨 User Experience

- **Modern UI**: Clean, responsive design with dark/light theme support
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Notifications**: Toast notifications for user feedback
- **Loading States**: Smooth loading experiences with skeleton components

## 📋 Pre-Installation

### 1. Account Setup

#### Supabase Account

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → API to get your project URL and anon key
4. Go to Settings → Database to get your service role key

#### CoinGecko Account (Optional)

1. Go to [coingecko.com](https://coingecko.com) and sign up
2. Go to API section and generate a free API key
3. Free tier allows 10-50 calls/minute

### 2. Supabase Database Setup

Before running the application, you need to set up your Supabase database. Run the following SQL scripts in your Supabase SQL editor in this exact order:

#### Step 1: Core Schema

```sql
-- Run: src/schema/supabase-schema.sql
-- Creates the main transactions table with indexes and RLS policies
```

#### Step 2: Price Tracking

```sql
-- Run: src/schema/supabase-price-tracking.sql
-- Creates token_prices table and price management functions
```

#### Step 3: Audit Logging

```sql
-- Run: src/schema/supabase-audit-logs.sql
-- Creates audit_logs table and audit trigger functions
```

#### Step 4: Holdings Calculation

```sql
-- Run: src/schema/supabase-holdings-function.sql
-- Creates get_user_holdings function for portfolio calculations
```

#### Step 5: Leaderboard

```sql
-- Run: src/schema/supabase-leaderboard-function.sql
-- Creates get_leaderboard function for user rankings
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
COINGECKO_API_KEY=your_coingecko_api_key
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account and project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CryptoPortfolio
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Supabase credentials
```

### 4. Run Database Migrations

Execute the SQL scripts in your Supabase SQL editor in the order specified in the Pre-Installation section.

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### Start Production Server

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Connect your GitHub repository to Vercel
2. Add your environment variables in Vercel dashboard
3. Deploy automatically on every push

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **State Management**: SWR for data fetching
- **Forms**: React Hook Form + Zod validation
- **CSV Processing**: PapaParse
- **Icons**: Lucide React
- **Notifications**: Sonner
