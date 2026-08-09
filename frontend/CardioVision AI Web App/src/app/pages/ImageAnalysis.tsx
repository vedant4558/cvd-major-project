import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CheckCircle2, ArrowRight, Brain, AlertCircle, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function ImageAnalysis() {
  const navigate = useNavigate();

  const biomarkers = [
    { label: 'CRAE', full: 'Central Retinal Arteriolar Equivalent', value: '142.8 μm', status: 'Normal', desc: 'Measures the calibre of retinal arterioles' },
    { label: 'CRVE', full: 'Central Retinal Venular Equivalent', value: '218.4 μm', status: 'Normal', desc: 'Measures the calibre of retinal venules' },
    { label: 'AVR', full: 'Arteriovenous Ratio', value: '0.654', status: 'Normal', desc: 'Ratio of artery to vein width — lower values indicate narrowing' },
    { label: 'Vessel Density', full: 'Vascular Network Density', value: '12.8%', status: 'Moderate', desc: 'Proportion of image area covered by vessels' },
    { label: 'Tortuosity', full: 'Vessel Tortuosity Index', value: '1.24', status: 'Elevated', desc: 'Curviness of vessels — higher values indicate stress' },
    { label: 'Branching Angle', full: 'Mean Branching Angle', value: '78.2°', status: 'Normal', desc: 'Average angle at vessel branch points' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Normal': return { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-400' };
      case 'Moderate': return { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' };
      case 'Elevated': return { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', dot: 'bg-rose-400' };
      default: return { badge: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300', dot: 'bg-gray-400' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Image Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Retinal vessel segmentation, biomarker extraction, and cardiovascular risk prediction
        </p>
      </motion.div>

      {/* Images + Prediction side by side */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: image trio */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="border-0 shadow-sm dark:bg-[#141d30]">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-900 dark:text-white">Retinal Image Processing</CardTitle>
                <CardDescription className="dark:text-gray-400">Original → Preprocessed → Vessel Segmentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {/* Original */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 text-center">Original</p>
                    <div className="aspect-square bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 rounded-xl overflow-hidden p-3">
                      <svg viewBox="0 0 300 300" className="w-full h-full">
                        <circle cx="150" cy="150" r="135" fill="#8B4513" opacity="0.3" />
                        <circle cx="150" cy="150" r="120" fill="#A0522D" opacity="0.4" />
                        <circle cx="105" cy="150" r="34" fill="#FFE4B5" />
                        <circle cx="105" cy="150" r="22" fill="#FFDAB9" />
                        <circle cx="195" cy="150" r="26" fill="#8B0000" opacity="0.3" />
                        <g stroke="#DC143C" strokeWidth="3" fill="none" opacity="0.9">
                          <path d="M 105 116 Q 135 75 172 60" />
                          <path d="M 105 139 Q 157 131 210 128" />
                          <path d="M 105 161 Q 157 169 210 173" />
                          <path d="M 105 184 Q 135 225 172 240" />
                        </g>
                        <g stroke="#8B0000" strokeWidth="4" fill="none" opacity="0.8">
                          <path d="M 105 131 Q 139 109 180 98" />
                          <path d="M 105 150 Q 150 150 203 150" />
                          <path d="M 105 169 Q 139 191 180 203" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  {/* Preprocessed */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 text-center">Preprocessed</p>
                    <div className="aspect-square bg-gradient-to-br from-orange-900 via-red-800 to-amber-700 rounded-xl overflow-hidden p-3">
                      <svg viewBox="0 0 300 300" className="w-full h-full">
                        <circle cx="150" cy="150" r="135" fill="#A0522D" opacity="0.4" />
                        <circle cx="150" cy="150" r="120" fill="#CD853F" opacity="0.5" />
                        <circle cx="105" cy="150" r="34" fill="#FFEBCD" />
                        <circle cx="105" cy="150" r="22" fill="#FFE4B5" />
                        <circle cx="195" cy="150" r="26" fill="#A52A2A" opacity="0.4" />
                        <g stroke="#FF6347" strokeWidth="3" fill="none" opacity="0.95">
                          <path d="M 105 116 Q 135 75 172 60" />
                          <path d="M 105 139 Q 157 131 210 128" />
                          <path d="M 105 161 Q 157 169 210 173" />
                          <path d="M 105 184 Q 135 225 172 240" />
                        </g>
                        <g stroke="#B22222" strokeWidth="4" fill="none" opacity="0.85">
                          <path d="M 105 131 Q 139 109 180 98" />
                          <path d="M 105 150 Q 150 150 203 150" />
                          <path d="M 105 169 Q 139 191 180 203" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  {/* Segmentation */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 text-center">Segmentation</p>
                    <div className="aspect-square bg-black rounded-xl overflow-hidden p-3">
                      <svg viewBox="0 0 300 300" className="w-full h-full">
                        <g stroke="#00ff00" strokeWidth="2.5" fill="none" opacity="1">
                          <path d="M 105 116 Q 135 75 172 60" />
                          <path d="M 105 124 Q 143 98 188 83" />
                          <path d="M 105 139 Q 157 131 210 128" />
                          <path d="M 105 161 Q 157 169 210 173" />
                          <path d="M 105 176 Q 143 203 188 218" />
                          <path d="M 105 184 Q 135 225 172 240" />
                          <path d="M 105 131 Q 139 109 180 98" />
                          <path d="M 105 150 Q 150 150 203 150" />
                          <path d="M 105 169 Q 139 191 180 203" />
                        </g>
                        <circle cx="105" cy="150" r="34" stroke="#00ff00" strokeWidth="1.5" fill="none" />
                        <circle cx="195" cy="150" r="26" stroke="#00ff00" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Processing pipeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="border-0 shadow-sm dark:bg-[#141d30]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-900 dark:text-white">Processing Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { step: 'Image Preprocessing & Enhancement', progress: 100 },
                  { step: 'Retinal Vessel Segmentation', progress: 100 },
                  { step: 'Biomarker Feature Extraction', progress: 100 },
                  { step: 'Cardiovascular Risk Classification', progress: 100 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{item.step}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Prediction result */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            {/* Risk prediction card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 dark:bg-[#141d30] border-2 border-amber-200 dark:border-amber-700/40">
              <CardContent className="p-6 text-center space-y-4">
                <AlertCircle className="w-14 h-14 text-amber-500 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                    AI Risk Prediction
                  </p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
                    Medium Risk
                  </h2>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Model Confidence</span>
                    <span className="font-bold text-gray-900 dark:text-white">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2.5" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'Low', val: '18.2%', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
                    { label: 'Medium', val: '68.5%', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-600' },
                    { label: 'High', val: '13.3%', cls: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' },
                  ].map((r) => (
                    <div key={r.label} className={`p-2 rounded-lg text-center ${r.cls}`}>
                      <p className="text-[10px] font-semibold uppercase">{r.label}</p>
                      <p className="text-sm font-bold mt-0.5">{r.val}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RVAG */}
            <Card className="border-0 shadow-sm dark:bg-[#141d30] mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">Retinal Vascular Age Gap</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-0.5">+6 years</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Predicted age: 64 · Actual: 58</p>
                  </div>
                  <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-500">+6</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="space-y-2 mt-4">
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
                onClick={() => navigate('/app/explainability')}
              >
                <Brain className="w-4 h-4 mr-2" />
                View Explainable AI
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                onClick={() => navigate('/app/reports')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Biomarkers table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white">Extracted Retinal Biomarkers</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Six quantitative vascular measurements used for risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {biomarkers.map((b, i) => {
                const style = getStatusStyle(b.status);
                return (
                  <div key={i} className="p-4 bg-[#f7f8ff] dark:bg-white/5 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{b.label}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate hidden md:block">{b.full}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{b.desc}</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{b.value}</p>
                      </div>
                      <Badge className={`${style.badge} flex-shrink-0 mt-0.5`}>{b.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[rgba(99,120,210,0.1)] dark:border-white/10">
              {[
                { label: 'Normal', dot: 'bg-emerald-400' },
                { label: 'Moderate — monitor', dot: 'bg-amber-400' },
                { label: 'Elevated — attention required', dot: 'bg-rose-400' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom nav */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end gap-3"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/app/upload')}
          className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
        >
          ← Back to Upload
        </Button>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
          onClick={() => navigate('/app/explainability')}
        >
          View Explainable AI
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
