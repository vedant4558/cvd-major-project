import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Users, Activity, Brain, AlertCircle, ArrowRight, Eye, Upload,
  User, Microscope, Calendar, TrendingUp, TrendingDown, Download,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const navigate = useNavigate();

  const summaryCards = [
    { icon: Users, title: 'Total Patients', value: '248', change: '+12%', pos: true, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Activity, title: 'Analyses Completed', value: '342', change: '+18%', pos: true, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { icon: Brain, title: 'AI Predictions', value: '298', change: '+8%', pos: true, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { icon: AlertCircle, title: 'High Risk Cases', value: '42', change: '-5%', pos: false, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  const quickActions = [
    { icon: User, label: 'New Patient', desc: 'Enter patient details', path: '/app/patient-details', color: 'from-blue-500 to-blue-600' },
    { icon: Upload, label: 'Upload Image', desc: 'Submit fundus photograph', path: '/app/upload', color: 'from-teal-500 to-teal-600' },
    { icon: Microscope, label: 'Image Analysis', desc: 'View current analysis', path: '/app/image-analysis', color: 'from-violet-500 to-violet-600' },
    { icon: Brain, label: 'Explainable AI', desc: 'Review AI decisions', path: '/app/explainability', color: 'from-rose-500 to-rose-600' },
  ];

  const recentAnalyses = [
    { name: 'Sarah Johnson', age: 58, risk: 'Medium', confidence: 87.3, date: '2 hours ago', rvag: +6, id: 'RPT-2026-0842' },
    { name: 'Michael Chen', age: 45, risk: 'Low', confidence: 92.1, date: '5 hours ago', rvag: -2, id: 'RPT-2026-0841' },
    { name: 'Emily Davis', age: 62, risk: 'High', confidence: 89.5, date: '1 day ago', rvag: +12, id: 'RPT-2026-0840' },
    { name: 'Robert Wilson', age: 38, risk: 'Low', confidence: 94.2, date: '1 day ago', rvag: -4, id: 'RPT-2026-0839' },
    { name: 'Lisa Anderson', age: 51, risk: 'Medium', confidence: 85.7, date: '2 days ago', rvag: +4, id: 'RPT-2026-0838' },
  ];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'High': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of cardiovascular risk assessments and patient analyses
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
            <Card className="border-0 shadow-sm dark:bg-[#141d30]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${card.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="group p-5 bg-white dark:bg-[#141d30] rounded-2xl shadow-sm border border-[rgba(99,120,210,0.1)] dark:border-white/5 hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all text-left"
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{action.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Current Analysis Snapshot */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30] overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Current Analysis</CardTitle>
                <CardDescription className="dark:text-gray-400">Most recent patient: Sarah Johnson · PT-2026-0248</CardDescription>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-sm"
                onClick={() => navigate('/app/image-analysis')}
              >
                View Analysis
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Retinal image thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 rounded-xl overflow-hidden p-4 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  <circle cx="150" cy="150" r="135" fill="#8B4513" opacity="0.3" />
                  <circle cx="150" cy="150" r="120" fill="#A0522D" opacity="0.4" />
                  <circle cx="105" cy="150" r="34" fill="#FFE4B5" />
                  <circle cx="105" cy="150" r="22" fill="#FFDAB9" />
                  <circle cx="195" cy="150" r="26" fill="#8B0000" opacity="0.3" />
                  <g stroke="#DC143C" strokeWidth="3" fill="none" opacity="0.9">
                    <path d="M 105 116 Q 135 75 172 60" />
                    <path d="M 105 124 Q 143 98 188 83" />
                    <path d="M 105 139 Q 157 131 210 128" />
                    <path d="M 105 161 Q 157 169 210 173" />
                    <path d="M 105 176 Q 143 203 188 218" />
                    <path d="M 105 184 Q 135 225 172 240" />
                  </g>
                  <g stroke="#8B0000" strokeWidth="4" fill="none" opacity="0.8">
                    <path d="M 105 120 Q 131 83 165 68" />
                    <path d="M 105 131 Q 139 109 180 98" />
                    <path d="M 105 150 Q 150 150 203 150" />
                    <path d="M 105 169 Q 139 191 180 203" />
                    <path d="M 105 180 Q 131 218 165 233" />
                  </g>
                </svg>
              </div>

              {/* Prediction summary */}
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Risk Level</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">Medium Risk</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500">87.3% confidence</p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Retinal Age Gap</p>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-0.5">+6 years</p>
                  <p className="text-xs text-violet-600/70 dark:text-violet-500">Elevated vascular aging</p>
                </div>
              </div>

              {/* Key biomarkers */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">Key Biomarkers</p>
                {[
                  { label: 'AVR Ratio', value: '0.654', ok: true },
                  { label: 'Tortuosity', value: '1.24', ok: false },
                  { label: 'Vessel Density', value: '12.8%', ok: null },
                  { label: 'Branching Angle', value: '78.2°', ok: true },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-[#f7f8ff] dark:bg-white/5 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{b.value}</span>
                      <span className={`w-2 h-2 rounded-full ${b.ok === true ? 'bg-emerald-400' : b.ok === false ? 'bg-rose-400' : 'bg-amber-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                onClick={() => navigate('/app/explainability')}
              >
                <Brain className="w-4 h-4 mr-1.5" />
                Explainable AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                onClick={() => navigate('/app/reports')}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Analysis History</CardTitle>
                <CardDescription className="dark:text-gray-400">Recent cardiovascular risk assessments</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/history')}
                className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAnalyses.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-[#f7f8ff] dark:bg-white/5 rounded-xl hover:bg-[#eef0ff] dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                        <span>·</span>
                        {item.rvag > 0
                          ? <TrendingUp className="w-3 h-3 text-orange-500" />
                          : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                        RVAG {item.rvag > 0 ? '+' : ''}{item.rvag}y
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${getRiskBadge(item.risk)}`}>{item.risk}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                      onClick={() => navigate('/app/image-analysis')}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
