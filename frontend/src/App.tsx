import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { RequireAuth, RequireProfileOnly } from "./components/Guards";
import AppShell from "./components/AppShell";

import Landing from "./pages/Landing";
import SignIn from "./pages/auth/SignIn";
import Onboarding from "./pages/onboarding/Onboarding";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import CareerExplorer from "./pages/CareerExplorer";
import CareerDetail from "./pages/CareerDetail";
import CareerCompare from "./pages/CareerCompare";
import CareerQuiz from "./pages/CareerQuiz";
import Skills from "./pages/Skills";
import Resources from "./pages/Resources";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Mentor from "./pages/Mentor";
import StudyPlanner from "./pages/StudyPlanner";
import Internship from "./pages/Internship";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/onboarding" element={<RequireProfileOnly><Onboarding /></RequireProfileOnly>} />

              <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="roadmap" element={<Roadmap />} />
                <Route path="careers" element={<CareerExplorer />} />
                <Route path="careers/quiz" element={<CareerQuiz />} />
                <Route path="careers/compare/:idA/:idB" element={<CareerCompare />} />
                <Route path="careers/:id" element={<CareerDetail />} />
                <Route path="skills" element={<Skills />} />
                <Route path="resources" element={<Resources />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="mentor" element={<Mentor />} />
                <Route path="planner" element={<StudyPlanner />} />
                <Route path="internship" element={<Internship />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
