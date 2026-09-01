import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cake, Users, Megaphone, Bell, Sparkles, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is authenticated, show dashboard link instead of login
  const authLink = isAuthenticated ? '/admin' : '/admin/login';
  const authText = isAuthenticated ? 'Dashboard' : 'Login';
  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Store birthdays, anniversaries, and special dates. Never miss an important celebration.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Megaphone,
      title: 'WhatsApp Campaigns',
      description: 'Create and send bulk campaigns in 1-2 clicks. Reach all your customers instantly.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Bell,
      title: 'Auto Reminders',
      description: 'Automatically send birthday and anniversary wishes with special offers.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Sparkles,
      title: 'Smart Templates',
      description: 'Pre-built message templates for birthdays, festivals, and promotions.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: TrendingUp,
      title: 'Sales Analytics',
      description: 'Track orders, revenue, and customer growth with beautiful dashboards.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Cake,
      title: 'Bakery Focused',
      description: 'Built specifically for local bakeries. Simple, powerful, and easy to use.',
      color: 'from-red-500 to-red-600',
    },
  ];

  const benefits = [
    'Increase repeat customers by 40%',
    'Save 5+ hours per week on marketing',
    'Boost sales with personalized offers',
    'Never miss a birthday or anniversary',
    'Professional WhatsApp marketing',
    'Easy to use - no technical skills needed',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-surface))] to-white">
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border))] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-accent))] rounded-xl flex items-center justify-center">
                <Cake className="w-6 h-6 text-[rgb(var(--color-brown))]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[rgb(var(--color-brown))]">Oneness Bakery</h1>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] font-semibold">Roorkee's Premier Eggless Bakery</p>
              </div>
            </div>
            <Link
              to={authLink}
              className="px-6 py-2 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-colors font-medium"
            >
              {authText}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-pink))] rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[rgb(var(--color-brown))]" />
            <span className="text-sm font-medium text-[rgb(var(--color-brown))]">Premium Bakery CRM & Marketing Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[rgb(var(--color-brown))] mb-6">
            Grow Your Bakery with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-brown))] to-[rgb(var(--color-gold))]">
              Smart WhatsApp Marketing
            </span>
          </h1>
          <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8 max-w-3xl mx-auto">
            Manage customers, send automated birthday wishes, and run powerful WhatsApp campaigns - all in one simple platform built for local bakeries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-8 py-4 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-lg font-medium text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 bg-white text-[rgb(var(--color-brown))] rounded-xl hover:bg-gray-50 transition-colors border-2 border-[rgb(var(--color-brown))] font-medium text-lg">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { label: 'Active Bakeries', value: '500+' },
            { label: 'Messages Sent', value: '1M+' },
            { label: 'Customer Satisfaction', value: '98%' },
            { label: 'Time Saved', value: '5hrs/week' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-[rgb(var(--color-border))] text-center">
              <h3 className="text-3xl font-bold text-[rgb(var(--color-brown))] mb-2">{stat.value}</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[rgb(var(--color-brown))] mb-4">Everything You Need to Grow</h2>
          <p className="text-xl text-[rgb(var(--color-text-secondary))]">Powerful features designed specifically for bakery owners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-[rgb(var(--color-border))] hover:shadow-lg transition-shadow"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-3">{feature.title}</h3>
              <p className="text-[rgb(var(--color-text-secondary))]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-[rgb(var(--color-brown))] to-[rgb(var(--color-light-brown))] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Why Bakery Owners Love Us</h2>
              <p className="text-xl text-white/90 mb-8">
                Join hundreds of successful bakeries using BakeryCRM to automate their marketing and grow their business.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="bg-white rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[rgb(var(--color-pink))] rounded-full"></div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--color-text-primary))]">Priya Sharma</p>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">Sweet Delights, Mumbai</p>
                  </div>
                </div>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  "BakeryCRM transformed my business! I now send automated birthday wishes to all my customers and my repeat orders increased by 45%. It's so easy to use!"
                </p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[rgb(var(--color-gold))] rounded-full"></div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--color-text-primary))]">Rahul Verma</p>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">Cake Paradise, Delhi</p>
                  </div>
                </div>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  "The WhatsApp campaigns feature is amazing! I can reach 1000+ customers in just 2 clicks. My sales doubled in 3 months!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-surface))] rounded-3xl p-12 text-center border border-[rgb(var(--color-border))]">
          <h2 className="text-4xl font-bold text-[rgb(var(--color-brown))] mb-4">Ready to Grow Your Bakery?</h2>
          <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8">
            Start your free trial today. No credit card required.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-lg font-medium text-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--color-border))] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/oneness_logo_2.png" alt="Oneness Bakery" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              © {new Date().getFullYear()} Oneness Bakery. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
