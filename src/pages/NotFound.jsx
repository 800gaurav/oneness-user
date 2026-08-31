import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Cake } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-surface))] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-accent))] rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Cake className="w-16 h-16 text-[rgb(var(--color-brown))]" />
          </div>
          <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[rgb(var(--color-brown))] mb-4">Page Not Found</h2>
          <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-all hover:scale-105 shadow-lg font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[rgb(var(--color-brown))] rounded-xl hover:bg-gray-50 transition-all hover:scale-105 border-2 border-[rgb(var(--color-brown))] font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
