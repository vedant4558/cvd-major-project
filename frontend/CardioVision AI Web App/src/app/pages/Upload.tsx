import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload as UploadIcon, Image, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Upload() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const useSampleImage = () => {
    setUploadedImage('/sample-retinal.jpg');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Retinal Image</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload a fundus photograph for cardiovascular risk analysis
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm dark:bg-[#141d30]">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Upload Image</CardTitle>
              <CardDescription className="dark:text-gray-400">Drag and drop or click to select</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-[rgba(99,120,210,0.3)] dark:border-[rgba(148,163,220,0.2)] hover:border-blue-400 hover:bg-[#eef0ff] dark:hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  accept="image/*"
                />
                <UploadIcon className="w-16 h-16 mx-auto text-blue-400 dark:text-blue-500 mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Drop your retinal image here
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Supported formats: JPG, PNG, TIFF
                </p>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full border-[rgba(99,120,210,0.2)] dark:border-[rgba(148,163,220,0.2)] dark:text-gray-300 dark:hover:bg-white/10"
                  onClick={useSampleImage}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Use Sample Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm dark:bg-[#141d30]">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Image Preview</CardTitle>
              <CardDescription className="dark:text-gray-400">Uploaded retinal fundus image</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 dark:bg-white/10 rounded-xl overflow-hidden">
                    {uploadedImage === '/sample-retinal.jpg' ? (
                      <div className="w-full h-full bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 p-8">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                          <circle cx="200" cy="200" r="180" fill="#8B4513" opacity="0.3" />
                          <circle cx="200" cy="200" r="160" fill="#A0522D" opacity="0.4" />
                          <circle cx="140" cy="200" r="45" fill="#FFE4B5" />
                          <circle cx="140" cy="200" r="30" fill="#FFDAB9" />
                          <circle cx="260" cy="200" r="35" fill="#8B0000" opacity="0.3" />
                          <g stroke="#DC143C" strokeWidth="4" fill="none" opacity="0.9">
                            <path d="M 140 155 Q 180 100 230 80" />
                            <path d="M 140 165 Q 190 130 250 110" />
                            <path d="M 140 185 Q 210 175 280 170" />
                            <path d="M 140 215 Q 210 225 280 230" />
                            <path d="M 140 235 Q 190 270 250 290" />
                            <path d="M 140 245 Q 180 300 230 320" />
                          </g>
                          <g stroke="#8B0000" strokeWidth="5" fill="none" opacity="0.8">
                            <path d="M 140 160 Q 175 110 220 90" />
                            <path d="M 140 175 Q 185 145 240 130" />
                            <path d="M 140 200 Q 200 200 270 200" />
                            <path d="M 140 225 Q 185 255 240 270" />
                            <path d="M 140 240 Q 175 290 220 310" />
                          </g>
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={uploadedImage}
                        alt="Uploaded retinal"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                      Image uploaded successfully
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white shadow-md"
                    onClick={() => navigate('/app/patient-details')}
                  >
                    Continue to Patient Details
                  </Button>
                </div>
              ) : (
                <div className="aspect-square bg-[#f7f8ff] dark:bg-white/5 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-16 h-16 mx-auto text-blue-300 dark:text-blue-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No image uploaded yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Image Requirements</h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>High-quality retinal fundus photograph (color image preferred)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Clear view of optic disc and macula</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Minimal artifacts or reflections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Minimum resolution: 512x512 pixels</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
