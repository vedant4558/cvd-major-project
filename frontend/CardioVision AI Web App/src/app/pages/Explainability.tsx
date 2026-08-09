import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Brain, Eye, Download, Info, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Explainability() {
  const navigate = useNavigate();

  const shapData = [
    { feature: 'Vessel Tortuosity', importance: 0.28, fill: '#3b82f6', plain: 'Curviness of retinal vessels' },
    { feature: 'AVR Ratio', importance: 0.24, fill: '#14b8a6', plain: 'Artery-to-vein width ratio' },
    { feature: 'Vessel Density', importance: 0.18, fill: '#8b5cf6', plain: 'Coverage of the retina by vessels' },
    { feature: 'CRVE', importance: 0.15, fill: '#f59e0b', plain: 'Size of retinal veins' },
    { feature: 'Age', importance: 0.08, fill: '#ef4444', plain: 'Patient age (clinical factor)' },
    { feature: 'Blood Pressure', importance: 0.07, fill: '#ec4899', plain: 'Systolic/diastolic reading' },
  ];

  const insights = [
    {
      icon: '🔴',
      title: 'High Vessel Tortuosity (28%)',
      desc: 'Your retinal vessels are more twisted than expected for your age. This is the strongest sign of cardiovascular stress found in your scan.',
      severity: 'rose',
    },
    {
      icon: '🟡',
      title: 'Reduced AVR Ratio (24%)',
      desc: 'Your arteries appear narrower relative to your veins. This narrowing pattern is commonly associated with high blood pressure.',
      severity: 'amber',
    },
    {
      icon: '🟡',
      title: 'Moderate Vessel Density (18%)',
      desc: 'The density of blood vessels in your retina is slightly below the ideal range, suggesting reduced microvascular supply.',
      severity: 'amber',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explainable AI</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Understanding why the AI predicted <strong>Medium Cardiovascular Risk</strong>
        </p>
      </motion.div>

      {/* Plain-language summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 dark:bg-[#141d30]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  What the AI found in plain language
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The AI examined your retinal photograph and identified two main warning signs:
                  the blood vessels in your eye are <strong>more twisted than normal</strong> and
                  the arteries appear <strong>narrower relative to the veins</strong>.
                  These two patterns together account for over half of the risk prediction.
                  The good news is that these are <strong>manageable risk factors</strong> —
                  lifestyle changes and regular monitoring can slow or reverse this progression.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grad-CAM + SHAP side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grad-CAM */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-0 shadow-sm dark:bg-[#141d30] h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-gray-900 dark:text-white">Grad-CAM Attention Map</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Red/orange = areas the AI focused on most when making its decision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden relative">
                {/* Base retinal */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-800 p-8 opacity-65">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <circle cx="200" cy="200" r="180" fill="#8B4513" opacity="0.3" />
                    <circle cx="200" cy="200" r="160" fill="#A0522D" opacity="0.4" />
                    <circle cx="140" cy="200" r="45" fill="#FFE4B5" />
                    <circle cx="140" cy="200" r="30" fill="#FFDAB9" />
                    <circle cx="260" cy="200" r="35" fill="#8B0000" opacity="0.3" />
                    <g stroke="#DC143C" strokeWidth="4" fill="none" opacity="0.9">
                      <path d="M 140 155 Q 180 100 230 80" />
                      <path d="M 140 185 Q 210 175 280 170" />
                      <path d="M 140 215 Q 210 225 280 230" />
                      <path d="M 140 245 Q 180 300 230 320" />
                    </g>
                    <g stroke="#8B0000" strokeWidth="5" fill="none" opacity="0.8">
                      <path d="M 140 175 Q 185 145 240 130" />
                      <path d="M 140 200 Q 200 200 270 200" />
                      <path d="M 140 225 Q 185 255 240 270" />
                    </g>
                  </svg>
                </div>
                {/* Heatmap overlay */}
                <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                  <ellipse cx="220" cy="150" rx="65" ry="45" fill="#ff0000" opacity="0.55" />
                  <ellipse cx="245" cy="200" rx="55" ry="55" fill="#ff4500" opacity="0.45" />
                  <ellipse cx="215" cy="255" rx="60" ry="38" fill="#ff6347" opacity="0.5" />
                  <ellipse cx="185" cy="182" rx="42" ry="32" fill="#ffa500" opacity="0.38" />
                  <ellipse cx="195" cy="225" rx="48" ry="42" fill="#ff8c00" opacity="0.32" />
                  <ellipse cx="145" cy="200" rx="38" ry="38" fill="#ffff00" opacity="0.22" />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between px-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-red-500 opacity-80" />
                  <span>High attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-orange-400 opacity-80" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-yellow-400 opacity-80" />
                  <span>Low attention</span>
                </div>
              </div>

              {/* Plain language */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  The AI concentrated on the <strong>blood vessel branching areas</strong> near the
                  optic disc (bright circle) and along the major vessel pathways. These zones showed
                  the most irregular vessel patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SHAP chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-0 shadow-sm dark:bg-[#141d30] h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                <CardTitle className="text-gray-900 dark:text-white">Feature Importance (SHAP)</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                How much each factor contributed to the Medium Risk prediction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 110 }}>
                  <XAxis type="number" domain={[0, 0.35]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={105} />
                  <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Contribution']} />
                  <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                    {shapData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-violet-800 dark:text-violet-400">
                  <strong>85% of the prediction</strong> is driven by retinal vessel measurements
                  (tortuosity, AVR, density, CRVE). Only 15% comes from clinical inputs like age and
                  blood pressure — showing the model primarily relies on objective retinal features.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Key insights in plain language */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Risk Factors — Explained Simply</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
            >
              <Card className={`border-0 shadow-sm h-full ${
                ins.severity === 'rose'
                  ? 'bg-rose-50 dark:bg-rose-900/20'
                  : 'bg-amber-50 dark:bg-amber-900/20'
              }`}>
                <CardContent className="p-5">
                  <div className="text-3xl mb-3">{ins.icon}</div>
                  <h3 className={`font-semibold mb-2 ${
                    ins.severity === 'rose'
                      ? 'text-rose-900 dark:text-rose-300'
                      : 'text-amber-900 dark:text-amber-300'
                  }`}>{ins.title}</h3>
                  <p className={`text-sm leading-relaxed ${
                    ins.severity === 'rose'
                      ? 'text-rose-800 dark:text-rose-400'
                      : 'text-amber-800 dark:text-amber-400'
                  }`}>{ins.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Clinical interpretation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
        <Card className="border-0 shadow-sm bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-violet-900 dark:text-violet-300">Clinical Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-violet-800 dark:text-violet-400 text-sm leading-relaxed">
            <p>
              The Grad-CAM map highlights <strong>irregular vessel branching zones</strong> near the optic disc
              as primary attention areas — regions where tortuosity and calibre abnormalities are most visible.
            </p>
            <p>
              SHAP analysis confirms that <strong>vessel tortuosity (28%) and AVR (24%)</strong> together
              drive over half the prediction, while retinal vessel metrics collectively account for 85%.
              This means the model's decision is grounded in objective retinal measurements, not
              clinical assumptions.
            </p>
            <div className="mt-3 p-3 bg-white/60 dark:bg-white/5 rounded-xl">
              <p className="font-semibold text-violet-900 dark:text-violet-300 mb-1">What this means for the patient:</p>
              <p>
                A medium-risk classification signals the need for proactive monitoring, not immediate alarm.
                Targeted lifestyle adjustments (blood pressure control, diet, exercise) can meaningfully
                reduce risk. Repeat retinal imaging in 6-12 months is recommended to track changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row justify-end gap-3"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/app/image-analysis')}
          className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
        >
          ← Back to Image Analysis
        </Button>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
          onClick={() => navigate('/app/reports')}
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF Report
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
