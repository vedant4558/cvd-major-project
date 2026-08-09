import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { motion } from 'motion/react';

export default function PatientDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodPressure: '',
    diabetes: '',
    smoking: '',
    familyHistory: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    const ageNum = Number(formData.age);
    if (!formData.age || Number.isNaN(ageNum) || ageNum <= 0 || ageNum > 120) errs.age = 'Enter a valid age (1-120)';
    if (!formData.gender) errs.gender = 'Select gender';
    if (formData.bloodPressure) {
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!bpRegex.test(formData.bloodPressure)) errs.bloodPressure = 'Format should be systolic/diastolic (e.g. 120/80)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    navigate('/app/upload');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter patient information for comprehensive risk assessment
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm dark:bg-[#141d30]">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Patient Information</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Demographic and clinical data for risk stratification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter patient name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    className="dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
                  />
                  {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodPressure" className="text-gray-700 dark:text-gray-300">Blood Pressure (mmHg)</Label>
                <Input
                  id="bloodPressure"
                  placeholder="e.g., 120/80"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  className="dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
                />
                {errors.bloodPressure && <p className="text-xs text-rose-500 mt-1">{errors.bloodPressure}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300">Diabetes Status</Label>
                <RadioGroup
                  value={formData.diabetes}
                  onValueChange={(value) => setFormData({ ...formData, diabetes: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diabetes-no" />
                    <Label htmlFor="diabetes-no" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      No Diabetes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type1" id="diabetes-type1" />
                    <Label htmlFor="diabetes-type1" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Type 1 Diabetes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="type2" id="diabetes-type2" />
                    <Label htmlFor="diabetes-type2" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Type 2 Diabetes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300">Smoking Status</Label>
                <RadioGroup
                  value={formData.smoking}
                  onValueChange={(value) => setFormData({ ...formData, smoking: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="smoking-never" />
                    <Label htmlFor="smoking-never" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Never Smoked
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="smoking-former" />
                    <Label htmlFor="smoking-former" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Former Smoker
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="smoking-current" />
                    <Label htmlFor="smoking-current" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Current Smoker
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300">Family History of Cardiovascular Disease</Label>
                <RadioGroup
                  value={formData.familyHistory}
                  onValueChange={(value) => setFormData({ ...formData, familyHistory: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="family-no" />
                    <Label htmlFor="family-no" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      No Family History
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="family-yes" />
                    <Label htmlFor="family-yes" className="font-normal cursor-pointer text-gray-700 dark:text-gray-300">
                      Family History Present
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-[rgba(99,120,210,0.2)] dark:border-[rgba(148,163,220,0.2)] dark:text-gray-300 dark:hover:bg-white/10"
                  onClick={() => navigate('/')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
                >
                  Continue to Upload Image
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
