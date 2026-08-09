import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

export default function Prediction() {
  const navigate = useNavigate();

  const riskLevel = 'Medium';
  const confidence = 87.3;
  const probabilities = {
    low: 18.2,
    medium: 68.5,
    high: 13.3,
  };

  const probabilityData = [
    { risk: 'Low', value: probabilities.low, fill: '#10b981' },
    { risk: 'Medium', value: probabilities.medium, fill: '#f59e0b' },
    { risk: 'High', value: probabilities.high, fill: '#ef4444' },
  ];

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'Low':
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
      case 'Medium':
        return <AlertCircle className="w-16 h-16 text-amber-500" />;
      case 'High':
        return <AlertTriangle className="w-16 h-16 text-rose-500" />;
      default:
        return null;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low': return 'from-emerald-500 to-green-400';
      case 'Medium': return 'from-amber-500 to-orange-400';
      case 'High': return 'from-rose-500 to-red-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case 'Low': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40';
      case 'Medium': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40';
      case 'High': return 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/40';
      default: return 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10';
    }
  };

  const getRiskTextColor = () => {
    switch (riskLevel) {
      case 'Low': return 'text-emerald-900 dark:text-emerald-300';
      case 'Medium': return 'text-amber-900 dark:text-amber-300';
      case 'High': return 'text-rose-900 dark:text-rose-300';
      default: return 'text-gray-900 dark:text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Prediction Results</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Deep learning-based cardiovascular risk assessment
        </p>
      </motion.div>

      {/* Main Prediction Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className={`border-2 shadow-lg ${getRiskBgColor()}`}>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">{getRiskIcon()}</div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Cardiovascular Risk Level
                </p>
                <h2
                  className={`text-5xl font-bold bg-gradient-to-r ${getRiskColor()} bg-clip-text text-transparent`}
                >
                  {riskLevel} Risk
                </h2>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Model Confidence
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{confidence}%</span>
                </div>
                <Progress value={confidence} className="h-3" />
              </div>

              <p className={`text-lg ${getRiskTextColor()} max-w-2xl mx-auto`}>
                Based on retinal vascular analysis and clinical parameters, the AI model predicts a
                <strong> {riskLevel.toLowerCase()} risk</strong> of cardiovascular events within the
                next 5-10 years.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Probability Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Risk Probability Distribution</CardTitle>
            <CardDescription className="dark:text-gray-400">Model output probabilities for each risk category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: 'Probability (%)', color: '#3b82f6' },
              }}
              className="h-[300px]"
            >
              <Bar
                data={probabilityData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </Bar>
            </ChartContainer>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Low Risk</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {probabilities.low}%
                </p>
              </div>
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Medium Risk</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {probabilities.medium}%
                </p>
              </div>
              <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <p className="text-sm font-semibold text-rose-900 dark:text-rose-300">High Risk</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {probabilities.high}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clinical Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-300">Clinical Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Regular monitoring of blood pressure and lipid profiles recommended</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Lifestyle modifications including diet and exercise may reduce risk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Follow-up retinal imaging in 6-12 months to track vascular changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Consult with cardiologist for comprehensive cardiovascular assessment</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
          onClick={() => navigate('/app/explainability')}
        >
          View Explainability Analysis
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
