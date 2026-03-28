# SolarIMS - PV Smart Monitor

**SolarIMS** is a comprehensive, real-time solar energy monitoring and AI-powered power prediction platform. Designed to optimize the efficiency of photovoltaic (PV) systems, it bridges the gap between hardware data (IoT) and actionable insights (Machine Learning).

---

## 🎯 Purpose of the Project

The primary goal of SolarIMS is to provide solar plant operators and homeowners with a **smart monitoring solution** that doesn't just show current data, but actively predicts future performance and identifies systemic issues before they lead to downtime.

By leveraging historical sensor data and environmental variables, SolarIMS helps in:
- **Maximizing Yield:** Understanding patterns to optimize energy consumption and storage.
- **Predictive Maintenance:** Using AI to detect faults (e.g., panel degradation, shading, or inverter issues).
- **Informed Planning:** Providing hourly and daily energy forecasts to manage grid interactions.

## 🚀 Key Features

- **Real-time Monitoring:** Live tracking of power output, voltage, current, and environmental factors.
- **AI Energy Forecasting:** Hourly and daily energy production predictions using trained ML models.
- **Intelligent Fault Detection:** Automatic identification of system anomalies and potential hardware failures.
- **Interactive Dashboard:** Beautifully visualized data using dynamic charts and graphs.
- **Automated Workflows:** Background jobs (via Inngest/Cron) to keep AI models and predictions up-to-date.
- **Secure Access:** Enterprise-grade authentication powered by Clerk.

## 🛠️ Tech Stack

### Frontend & UI
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Background Jobs:** [Inngest](https://www.inngest.com/)

---

## 📂 Project Structure

```text
SolarIMS/
├── solar/              # Core Next.js Application
│   ├── app/            # Application routes & layouts
│   ├── actions/        # Server actions (AI, Dashboard, Faults)
│   ├── components/     # UI components & Shared blocks
│   ├── lib/            # Configuration (Prisma, DB utilities)
│   ├── prisma/         # Database schema & migrations
│   └── scripts/        # Data processing & setup scripts
└── .gitignore          # Root-level git rules
```

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase account & Project URL/Key
- Clerk API Keys

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amanpal0601/SolarIMS.git
   cd SolarIMS/solar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `solar/` directory and add your keys (refer to `.env.example` if available).

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Author
**Aman Pal** - [GitHub](https://github.com/Amanpal0601)

---
*Developed as part of an advanced solar energy management research initiative.*
