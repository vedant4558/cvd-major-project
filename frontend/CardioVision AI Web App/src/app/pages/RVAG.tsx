import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function RVAG() {
  const navigate = useNavigate();

  const chronologicalAge = 58;
  const predictedRetinalAge = 64;
  const rvag = predictedRetinalAge - chronologicalAge;

  const gaugePercentage = 50 + (rvag * 5);

  const getRVAGInterpretation = () => {
    if (rvag < -5) return { level: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (rvag < 0) return { level: 'Good', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (rvag < 5) return { level: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
    if (rvag < 10) return { level: 'Elevated', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' };
    return { level: 'High', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20' };
  };

  const interpretation = getRVAGInterpretation();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RVAG Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Retinal Vascular Age Gap — A biomarker of biological aging
        </p>
      </motion.div>

      {/* Main RVAG Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg dark:bg-[#141d30]">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Circular Gauge */}
              <div className="relative">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-sm mx-auto">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    className="dark:stroke-white/10"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="20"
                    strokeDasharray={`${(gaugePercentage / 100) * 502.4} 502.4`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <text x="100" y="85" textAnchor="middle" className="text-4xl font-bold" fill="#1f2937">
                    +{rvag}
                  </text>
                  <text x="100" y="110" textAnchor="middle" className="text-sm" fill="#6b7280">
                    years
                  </text>
                </svg>
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">RVAG Status</p>
                  <p className={`text-2xl font-bold ${interpretation.color}`}>
                    {interpretation.level}
                  </p>
                </div>
              </div>

              {/* Age Information */}
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Chronological Age
                  </p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{chronologicalAge} years</p>
                </div>

                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                  <p className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-1">
                    Predicted Retinal Age
                  </p>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">{predictedRetinalAge} years</p>
                </div>

                <div className={`p-4 rounded-xl ${interpretation.bgColor}`}>
                  <p className={`text-sm font-semibold mb-1 ${interpretation.color}`}>
                    Retinal Vascular Age Gap
                  </p>
                  <p className={`text-4xl font-bold ${interpretation.color}`}>
                    +{rvag} years
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* What is RVAG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5" />
              Understanding RVAG
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Retinal Vascular Age Gap explained</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Retinal Vascular Age Gap (RVAG)</strong> is the difference between a person's
              predicted retinal vascular age and their chronological age. It serves as a biomarker
              of biological aging and cardiovascular health.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/40">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Negative RVAG</h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-400">
                  Retinal vessels appear younger than chronological age — indicates better cardiovascular health
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/40">
                <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Zero RVAG</h4>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Retinal age matches chronological age — normal aging process
                </p>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-700/40">
                <h4 className="font-semibold text-rose-900 dark:text-rose-300 mb-2">Positive RVAG</h4>
                <p className="text-sm text-rose-800 dark:text-rose-400">
                  Retinal vessels appear older — accelerated vascular aging and increased CV risk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Patient Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className={`border-0 shadow-sm border-2 ${interpretation.bgColor}`}>
          <CardHeader>
            <CardTitle className={interpretation.color}>Patient-Specific Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-800 dark:text-gray-300">
              <p>
                The patient's retinal vasculature shows characteristics of a {predictedRetinalAge}-year-old
                individual, despite a chronological age of {chronologicalAge} years. This creates a
                positive RVAG of <strong>+{rvag} years</strong>.
              </p>

              <p>
                A positive RVAG of {rvag} years indicates <strong>accelerated vascular aging</strong>,
                which is associated with:
              </p>

              <ul className="space-y-2 ml-4">
                <li className={`flex items-start gap-2 ${interpretation.color}`}>
                  <span>•</span>
                  <span className="text-gray-800 dark:text-gray-300">Increased risk of cardiovascular events</span>
                </li>
                <li className={`flex items-start gap-2 ${interpretation.color}`}>
                  <span>•</span>
                  <span className="text-gray-800 dark:text-gray-300">Early signs of microvascular damage</span>
                </li>
                <li className={`flex items-start gap-2 ${interpretation.color}`}>
                  <span>•</span>
                  <span className="text-gray-800 dark:text-gray-300">Potential hypertensive or metabolic stress on blood vessels</span>
                </li>
                <li className={`flex items-start gap-2 ${interpretation.color}`}>
                  <span>•</span>
                  <span className="text-gray-800 dark:text-gray-300">Need for proactive cardiovascular risk management</span>
                </li>
              </ul>

              <div className="mt-4 p-4 bg-white dark:bg-white/5 rounded-xl border-2 border-current">
                <p className="font-semibold mb-2 text-gray-900 dark:text-white">Clinical Recommendation:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Given the moderate RVAG, lifestyle interventions and regular cardiovascular
                  monitoring are recommended. Reducing modifiable risk factors may help slow
                  vascular aging progression.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Research Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 dark:bg-[#141d30]">
          <CardContent className="p-6">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">Research Evidence</h3>
            <p className="text-indigo-800 dark:text-indigo-400 text-sm mb-3">
              Studies have shown that RVAG is independently associated with cardiovascular mortality,
              stroke risk, and coronary artery disease. Each additional year of RVAG increases
              cardiovascular risk by approximately 3-5%.
            </p>
            <p className="text-indigo-800 dark:text-indigo-400 text-sm">
              The retinal vasculature provides a unique window into systemic vascular health, making
              RVAG a valuable non-invasive biomarker for early cardiovascular risk detection.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
          onClick={() => navigate('/app/reports')}
        >
          Generate Full Report
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
