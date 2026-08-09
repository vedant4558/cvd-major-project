import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, Calendar, User, Activity, FileText, CheckCircle2, Brain } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export default function Reports() {
  const navigate = useNavigate();

  const reportData = {
    patient: { name: 'Sarah Johnson', age: 58, gender: 'Female', id: 'PT-2026-0248', date: 'June 27, 2026' },
    clinical: { bloodPressure: '138/88 mmHg', diabetes: 'Type 2 Diabetes', smoking: 'Former Smoker', familyHistory: 'Yes' },
    biomarkers: { CRAE: '142.8 μm', CRVE: '218.4 μm', AVR: '0.654', Density: '12.8%', Tortuosity: '1.24', 'Branching Angle': '78.2°' },
    prediction: { risk: 'Medium', confidence: 87.3, lowProb: 18.2, mediumProb: 68.5, highProb: 13.3 },
    rvag: { chronological: 58, predicted: 64, gap: 6 },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header with prominent Download button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete cardiovascular risk assessment for {reportData.patient.name}
            </p>
          </div>

          {/* Prominent Download PDF button */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-base rounded-xl"
            onClick={() => window.print()}
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF Report
          </Button>
        </div>

        {/* Secondary download row */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" size="sm" className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">
            <FileText className="w-4 h-4 mr-1.5" />
            Export as CSV
          </Button>
          <Button variant="outline" size="sm" className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">
            <Brain className="w-4 h-4 mr-1.5" />
            View Explainable AI
          </Button>
        </div>
      </motion.div>

      {/* Report header banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-500 to-teal-400 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">CardioVision AI</h2>
                <p className="text-blue-100 text-sm">Cardiovascular Risk Assessment Report</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100">Report ID</p>
                <p className="font-bold">RPT-2026-0842</p>
                <p className="text-xs text-blue-100 mt-1">{reportData.patient.date}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <User className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-100">Patient</p>
                  <p className="font-semibold">{reportData.patient.name}</p>
                  <p className="text-xs text-blue-100">Age {reportData.patient.age} · {reportData.patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <Activity className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-100">Risk Classification</p>
                  <p className="font-bold text-lg">{reportData.prediction.risk} Risk</p>
                  <p className="text-xs text-blue-100">{reportData.prediction.confidence}% confidence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prediction + RVAG highlights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Low Risk</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{reportData.prediction.lowProb}%</p>
          </div>
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center ring-2 ring-amber-300 dark:ring-amber-600">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Medium Risk ✓</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{reportData.prediction.mediumProb}%</p>
          </div>
          <div className="p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-center">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">High Risk</p>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">{reportData.prediction.highProb}%</p>
          </div>
        </div>
      </motion.div>

      {/* Patient + clinical info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Patient & Clinical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                {[
                  ['Patient ID', reportData.patient.id],
                  ['Age', `${reportData.patient.age} years`],
                  ['Gender', reportData.patient.gender],
                  ['Date', reportData.patient.date],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[rgba(99,120,210,0.1)] dark:border-white/10">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  ['Blood Pressure', reportData.clinical.bloodPressure],
                  ['Diabetes', reportData.clinical.diabetes],
                  ['Smoking', reportData.clinical.smoking],
                  ['Family History CVD', reportData.clinical.familyHistory],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[rgba(99,120,210,0.1)] dark:border-white/10">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Retinal images */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Retinal Imaging</CardTitle>
            <CardDescription className="dark:text-gray-400">Fundus photograph and Grad-CAM attention overlay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">Original Fundus Image</p>
                <div className="aspect-video bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 rounded-xl p-5 flex items-center justify-center">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <circle cx="200" cy="150" r="130" fill="#8B4513" opacity="0.3" />
                    <circle cx="200" cy="150" r="115" fill="#A0522D" opacity="0.4" />
                    <circle cx="145" cy="150" r="38" fill="#FFE4B5" />
                    <circle cx="145" cy="150" r="25" fill="#FFDAB9" />
                    <g stroke="#DC143C" strokeWidth="3.5" fill="none" opacity="0.9">
                      <path d="M 145 112 Q 175 70 220 55" />
                      <path d="M 145 138 Q 195 130 255 128" />
                      <path d="M 145 162 Q 195 170 255 172" />
                      <path d="M 145 188 Q 175 230 220 245" />
                    </g>
                    <g stroke="#8B0000" strokeWidth="4.5" fill="none" opacity="0.8">
                      <path d="M 145 125 Q 180 100 215 90" />
                      <path d="M 145 150 Q 195 150 255 150" />
                      <path d="M 145 175 Q 180 200 215 210" />
                    </g>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">Grad-CAM Heatmap</p>
                <div className="aspect-video rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-800 p-5 opacity-60 flex items-center justify-center">
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      <circle cx="200" cy="150" r="130" fill="#8B4513" opacity="0.3" />
                      <g stroke="#DC143C" strokeWidth="3" fill="none" opacity="0.9">
                        <path d="M 145 138 Q 195 130 255 128" />
                        <path d="M 145 162 Q 195 170 255 172" />
                      </g>
                    </svg>
                  </div>
                  <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
                    <ellipse cx="215" cy="112" rx="60" ry="35" fill="#ff0000" opacity="0.5" />
                    <ellipse cx="230" cy="150" rx="50" ry="44" fill="#ff4500" opacity="0.42" />
                    <ellipse cx="210" cy="190" rx="55" ry="32" fill="#ff6347" opacity="0.46" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Biomarkers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Retinal Biomarkers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(reportData.biomarkers).map(([key, value]) => (
                <div key={key} className="p-3 bg-[#f7f8ff] dark:bg-white/5 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-1">{key}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* RVAG */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Retinal Vascular Age Gap (RVAG)</CardTitle>
            <CardDescription className="dark:text-gray-400">Biological aging biomarker derived from retinal vessel analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide mb-1">Chronological Age</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{reportData.rvag.chronological}</p>
                <p className="text-xs text-blue-500 dark:text-blue-500 mt-0.5">years</p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-center">
                <p className="text-xs text-violet-700 dark:text-violet-400 font-semibold uppercase tracking-wide mb-1">Predicted Retinal Age</p>
                <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">{reportData.rvag.predicted}</p>
                <p className="text-xs text-violet-500 dark:text-violet-500 mt-0.5">years</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold uppercase tracking-wide mb-1">Age Gap (RVAG)</p>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">+{reportData.rvag.gap}</p>
                <p className="text-xs text-orange-500 dark:text-orange-500 mt-0.5">years older</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Summary & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-800 dark:text-gray-300 text-sm leading-relaxed">
            <p>
              The patient presents with <strong>medium cardiovascular risk</strong> (87.3% confidence) driven
              primarily by elevated vessel tortuosity (+RVAG of 6 years) and reduced AVR ratio — classic markers
              of early hypertensive microvascular changes.
            </p>
            <div className="p-4 bg-white dark:bg-white/5 rounded-xl">
              <p className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                Recommended Clinical Actions
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {[
                  'Regular blood pressure and lipid monitoring (every 3-6 months)',
                  'Lifestyle modifications: Mediterranean diet, ≥150 min/week aerobic exercise',
                  'Smoking cessation support if applicable',
                  'Follow-up retinal imaging in 6-12 months to track vascular changes',
                  'Cardiology referral for comprehensive cardiovascular risk management',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Download CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 justify-between items-center p-6 bg-white dark:bg-[#141d30] rounded-2xl shadow-md border border-[rgba(99,120,210,0.1)] dark:border-white/10"
      >
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Ready to save this report?</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Download a complete PDF for clinical records or patient handout</p>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-lg hover:shadow-xl transition-all px-8 rounded-xl flex-shrink-0"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF Report
        </Button>
      </motion.div>

      {/* Back nav */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate('/app/explainability')}
          className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
        >
          ← Back to Explainable AI
        </Button>
      </div>
    </div>
  );
}
