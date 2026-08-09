import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Eye, Sun, Moon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Simplified landing page: keep single CTA and hero image

  return (
    <div className="min-h-screen bg-[#f7f8ff] dark:bg-[#0c1121] flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(99,120,210,0.13)] dark:border-[rgba(148,163,220,0.12)] bg-white/80 dark:bg-[#141d30]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">CardioVision AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-white/10 rounded-xl"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              onClick={() => navigate('/app/patient-details')}
              className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 container mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Final Year Engineering Project · 2026
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Cardiovascular Risk from{' '}
              <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                Retinal Images
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              CardioVision AI analyses retinal fundus photographs to provide an explainable
              cardiovascular risk assessment. Get started to create a patient record and run an analysis.
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/app/patient-details')}
              className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Right: Illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[rgba(99,120,210,0.15)] dark:border-[rgba(148,163,220,0.1)]">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/60 dark:to-teal-950/60 p-10 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-300">Retinal image preview placeholder</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl opacity-20 blur-xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Removed extra feature/stat sections to keep homepage focused */}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-[#0a1018] text-white py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">CardioVision AI</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 CardioVision AI · Final Year Engineering Project
          </p>
        </div>
      </footer>
    </div>
  );
}
