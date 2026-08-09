import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, Eye, Calendar, TrendingDown, TrendingUp, Download, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const historyData = [
    { id: 'RPT-2026-0842', patientName: 'Sarah Johnson', age: 58, date: 'June 27, 2026', risk: 'Medium', confidence: 87.3, rvag: 6 },
    { id: 'RPT-2026-0841', patientName: 'Michael Chen', age: 45, date: 'June 26, 2026', risk: 'Low', confidence: 92.1, rvag: -2 },
    { id: 'RPT-2026-0840', patientName: 'Emily Davis', age: 62, date: 'June 26, 2026', risk: 'High', confidence: 89.5, rvag: 12 },
    { id: 'RPT-2026-0839', patientName: 'Robert Wilson', age: 38, date: 'June 25, 2026', risk: 'Low', confidence: 94.2, rvag: -4 },
    { id: 'RPT-2026-0838', patientName: 'Lisa Anderson', age: 51, date: 'June 25, 2026', risk: 'Medium', confidence: 85.7, rvag: 4 },
    { id: 'RPT-2026-0837', patientName: 'James Martinez', age: 67, date: 'June 24, 2026', risk: 'High', confidence: 91.3, rvag: 15 },
    { id: 'RPT-2026-0836', patientName: 'Patricia Brown', age: 42, date: 'June 24, 2026', risk: 'Low', confidence: 93.8, rvag: -1 },
    { id: 'RPT-2026-0835', patientName: 'David Lee', age: 55, date: 'June 23, 2026', risk: 'Medium', confidence: 88.4, rvag: 7 },
  ];

  const filtered = historyData.filter(
    (r) =>
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()),
  );

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'High': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: historyData.length,
    low: historyData.filter((r) => r.risk === 'Low').length,
    medium: historyData.filter((r) => r.risk === 'Medium').length,
    high: historyData.filter((r) => r.risk === 'High').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Browse and manage past cardiovascular risk assessments
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-[#141d30]' },
          { label: 'Low Risk', value: stats.low, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Medium Risk', value: stats.medium, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'High Risk', value: stats.high, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
            <Card className={`border-0 shadow-sm ${s.bg}`}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by patient name or report ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white dark:bg-[#141d30] border-[rgba(99,120,210,0.2)] dark:border-white/10 dark:text-white dark:placeholder:text-gray-500 rounded-xl"
          />
        </div>
      </motion.div>

      {/* History cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 dark:text-white">
              {filtered.length} Assessment{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Click <strong>View</strong> to open the full analysis report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{search}"</p>
                </div>
              ) : (
                filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                    className="group p-4 bg-[#f7f8ff] dark:bg-white/5 rounded-xl hover:bg-[#eef0ff] dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Patient info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.patientName}</h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">Age {item.age}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              {item.rvag > 0
                                ? <TrendingUp className="w-3 h-3 text-orange-500" />
                                : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                              RVAG: {item.rvag > 0 ? '+' : ''}{item.rvag}y
                            </span>
                            <span className="text-gray-400 dark:text-gray-600">{item.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Risk + actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <Badge className={`${getRiskStyle(item.risk)} text-xs`}>{item.risk} Risk</Badge>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.confidence}% confidence</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-sm"
                            onClick={() => navigate('/app/image-analysis')}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
                            onClick={() => navigate('/app/reports')}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
