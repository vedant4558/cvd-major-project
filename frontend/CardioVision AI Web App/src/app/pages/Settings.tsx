import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your application preferences and configuration
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" defaultValue="Dr. John" className="dark:bg-white/5 dark:border-white/10 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" defaultValue="Smith" className="dark:bg-white/5 dark:border-white/10 dark:text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                defaultValue="dr.smith@cardiovision.ai"
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-gray-700 dark:text-gray-300">Institution</Label>
              <Input
                id="institution"
                placeholder="Enter institution name"
                defaultValue="Metropolitan Hospital"
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive analysis completion alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="dark:bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">High-Risk Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Immediate notification for high-risk cases</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="dark:bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Summary of weekly analyses</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Model Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <SettingsIcon className="w-5 h-5" />
              AI Model Configuration
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Adjust model parameters and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelVersion" className="text-gray-700 dark:text-gray-300">Model Version</Label>
              <Select defaultValue="v2.1">
                <SelectTrigger id="modelVersion" className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1.0">Version 1.0 (Stable)</SelectItem>
                  <SelectItem value="v2.0">Version 2.0 (Enhanced)</SelectItem>
                  <SelectItem value="v2.1">Version 2.1 (Latest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidenceThreshold" className="text-gray-700 dark:text-gray-300">Confidence Threshold (%)</Label>
              <Input
                id="confidenceThreshold"
                type="number"
                min="0"
                max="100"
                defaultValue="75"
                className="dark:bg-white/5 dark:border-white/10 dark:text-white"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Minimum confidence for prediction acceptance
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Enable Explainability</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate Grad-CAM and SHAP visualizations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Display Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Palette className="w-5 h-5" />
              Display Preferences
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Customize the application appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-gray-700 dark:text-gray-300">Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                <SelectTrigger id="theme" className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-gray-700 dark:text-gray-300">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language" className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Manage application data and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f7f8ff] dark:bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export Analysis Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download all analysis records as CSV</p>
              </div>
              <Button variant="outline" className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">Export</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#f7f8ff] dark:bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Clear Cache</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove temporary files and cached data</p>
              </div>
              <Button variant="outline" className="dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">Clear</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Protect your data and maintain compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Anonymize Patient Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove identifiable information from exports</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="dark:bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <Separator className="dark:bg-white/10" />
            <div>
              <Button variant="outline" className="w-full mb-2 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10">
                Change Password
              </Button>
              <Button variant="outline" className="w-full text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:border-white/20 dark:hover:bg-rose-900/20">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 dark:bg-[#141d30]">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CardioVision AI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Version 2.1.0</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © 2026 CardioVision AI. Final Year Engineering Project.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
