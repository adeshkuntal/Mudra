import React from "react";
import { Button } from "./UI/Button";
import { Card, CardContent } from "./UI/Card";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Lock, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  BarChart3,
  ArrowRight,
  Check
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Smart categorization and predictive cashflow forecasting powered by advanced ML models",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data stays secure with encryption and optional local AI processing",
    },
    {
      icon: TrendingUp,
      title: "Smart Forecasting",
      description: "Predict your financial future with accurate income and expense projections",
    },
    {
      icon: Zap,
      title: "Automated Management",
      description: "Track subscriptions, detect anomalies, and automate recurring bill payments",
    },
    {
      icon: ShieldCheck,
      title: "Bank-Level Security",
      description: "Multi-factor authentication and encrypted data storage keep your finances safe",
    },
    {
      icon: BarChart3,
      title: "Actionable Analytics",
      description: "Get personalized recommendations with clear explanations of every insight",
    },
  ];

  const benefits = [
    "Automatic transaction categorization",
    "Real-time expense tracking",
    "Savings goal management",
    "Bill payment reminders",
    "Fraud detection alerts",
    "Multi-currency support",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="logo"
                className="h-10 w-10 rounded-xl object-cover shadow border border-gray-200"
              />
              <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Mudra</h1>
            </div>
            <Button onClick={() => navigate('/login')} variant="default">
              Start Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-95" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Take Control of Your Financial Future
            </h2>
            <p className="text-xl text-white/90 mb-8">
              AI-powered finance management that learns from your habits and helps you save smarter
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="default"
                onClick={() => navigate('/login')}
                className="text-lg"
              >
                Start Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register')}
                className="text-lg border-white/30 text-black hover:bg-white/10"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powerful Features, Simple Interface
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your money intelligently, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Why Choose Mudra?
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                We combine cutting-edge AI with bank-level security to give you complete control over your financial life.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">Total Balance</span>
                      <span className="text-2xl font-bold">₹45,230.50</span>
                    </div>
                    <div className="h-px bg-white/20" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/70 mb-1">Income</p>
                        <p className="text-lg font-semibold text-green-300">+₹75,000</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/70 mb-1">Expenses</p>
                        <p className="text-lg font-semibold text-red-300">-₹42,500</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving smarter with AI-powered insights
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/login')}
            className="text-lg bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600">
              © 2024 Mudra. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-800 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-800 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-800 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
