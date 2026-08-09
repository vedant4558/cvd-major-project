import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import PatientDetails from "./pages/PatientDetails";
import ImageAnalysis from "./pages/ImageAnalysis";
import Prediction from "./pages/Prediction";
import Explainability from "./pages/Explainability";
import RVAG from "./pages/RVAG";
import Reports from "./pages/Reports";
import History from "./pages/History";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/app",
    Component: DashboardLayout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "upload", Component: Upload },
      { path: "patient-details", Component: PatientDetails },
      { path: "image-analysis", Component: ImageAnalysis },
      { path: "prediction", Component: Prediction },
      { path: "explainability", Component: Explainability },
      { path: "rvag", Component: RVAG },
      { path: "reports", Component: Reports },
      { path: "history", Component: History },
      { path: "settings", Component: Settings },
    ],
  },
]);
