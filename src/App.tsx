import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppNavabr from "./components/AppNavabr";
import AppSidebar from "./components/AppSidebar";
import KpiDetailPage from "./pages/KpiDetailPage";
import KPIs from "./pages/KPIs";
import TeamsPage from "./pages/Team";
import UnauthorizedPage from "./pages/Unauthorized";
import Users from "./pages/Users";
import PriorityDetails from "./pages/PriorityDetails";
import Priorities from "./pages/Priorities";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { Permission, PermissionsProvider } from "./contexts/PermissionsContext";
import Login from "./pages/Login";
import OrganizationSelect from "./pages/OrganizationSelect";
import Signup from "./pages/Signup";
import QuarterSettings from "./pages/QuarterSettings";
import AppFooter from "./components/AppFooter";
import { SelectedUserQuarterProvider } from "@/contexts/SelectedUserQuarterContext";
// import Dashboard from "./pages/Dashboard";
import DashboardNew from "./pages/DashboardNew";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-screen bg-black flex gap-4">
      <AppSidebar />
      <div className="flex flex-col w-full px-4 overflow-hidden">
        <AppNavabr />
        {children}
        <Toaster />
        <AppFooter/>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SelectedUserQuarterProvider>
    <AuthProvider>
      <OrganizationProvider>
        <PermissionsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      {/* <Dashboard /> */}
                      <DashboardNew />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kpis"
                element={
                  <ProtectedRoute
                    requiredPermissions={[
                      Permission.VIEW_INDIVIDUAL_KPI,
                    ]}
                  >
                    <Layout>
                      <KPIs />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute
                    requiredPermissions={[
                      Permission.VIEW_TEAMS
                    ]}
                  >
                    <Layout>
                      <TeamsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute
                    requiredPermissions={[
                      Permission.VIEW_USERS
                    ]}
                  >
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
              path="/priorities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Priorities />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
                path="/kpi/:id"
                element={
                  <ProtectedRoute
                    requiredPermissions={[
                      Permission.VIEW_INDIVIDUAL_KPI
                    ]}
                  >
                    <Layout>
                      <KpiDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
              path="/priority/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PriorityDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
                path="/select-organization"
                element={
                  <ProtectedRoute>
                    <OrganizationSelect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                  <Layout>
                    {/* <Settings />
                     */}
                     <QuarterSettings /> 
                  </Layout>
                </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </PermissionsProvider>
      </OrganizationProvider>
    </AuthProvider>
    </SelectedUserQuarterProvider>
  );
}
