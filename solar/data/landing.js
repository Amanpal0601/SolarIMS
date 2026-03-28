import {
  BarChart3,
  Sun,
  Activity,
  Cpu,
  Zap,
  ShieldCheck,
} from "lucide-react";

// ==========================
// Stats Data
// ==========================
export const statsData = [
  {
    value: "50+",
    label: "Solar Readings Tracked",
  },
  {
    value: "5K+",
    label: "Real-Time Data Points Logged",
  },
  {
    value: "70%",
    label: "Monitoring Accuracy",
  },
  {
    value: "AI Powered",
    label: "Smart Energy Forecasting",
  },
];

// ==========================
// Features Data
// ==========================
export const featuresData = [
  {
    icon: <Activity className="h-8 w-8 text-cyan-500" />,
    title: "Real-Time Monitoring",
    description:
      "Track voltage, current, power output, irradiance, and temperature from your solar panels in real time.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-cyan-500" />,
    title: "Advanced Analytics Dashboard",
    description:
      "Visualize historical trends and performance metrics with interactive charts and smart insights.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-cyan-500" />,
    title: "AI Power Prediction",
    description:
      "Predict solar energy output for the next 1, 5, and 10 minutes using intelligent machine learning models.",
  },
  {
    icon: <Sun className="h-8 w-8 text-cyan-500" />,
    title: "Irradiance & Weather Integration",
    description:
      "Combine sunlight intensity and environmental data to improve forecasting accuracy.",
  },
  {
    icon: <Zap className="h-8 w-8 text-cyan-500" />,
    title: "Smart Anomaly Detection",
    description:
      "Automatically detect abnormal panel behavior and performance drops before they become critical.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-cyan-500" />,
    title: "Secure Cloud Infrastructure",
    description:
      "Built with Firebase-powered authentication and secure cloud storage for reliable system access.",
  },
];

// ==========================
// How It Works Data
// ==========================
export const howItWorksData = [
  {
    icon: <Sun className="h-8 w-8 text-cyan-500" />,
    title: "1. Connect Solar Sensors",
    description:
      "ESP32-based IoT devices collect real-time solar panel data including voltage, current, and temperature.",
  },
  {
    icon: <Activity className="h-8 w-8 text-cyan-500" />,
    title: "2. Monitor & Store Data",
    description:
      "Sensor data is securely transmitted to the cloud and visualized on the SolarIMS dashboard.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-cyan-500" />,
    title: "3. Predict & Optimize",
    description:
      "AI models analyze the data and predict short-term energy output to optimize system performance.",
  },
];

// ==========================
// Testimonials Data
// ==========================
export const testimonialsData = [
  {
    name: "Amit Verma",
    role: "Solar Plant Operator",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    quote:
      "SolarIMS gives us real-time insights into our solar farm performance. The AI predictions help us plan energy distribution efficiently.",
  },
  {
    name: "Neha Sharma",
    role: "Renewable Energy Engineer",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    quote:
      "The anomaly detection feature has reduced unexpected panel failures and improved our overall plant efficiency.",
  },
  {
    name: "Rahul Mehta",
    role: "Energy Consultant",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    quote:
      "SolarIMS combines IoT and AI beautifully. The dashboard is clean, powerful, and perfect for modern solar monitoring.",
  },
];


