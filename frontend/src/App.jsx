import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx'; // This remains your dashboard
import Login from './pages/Login.jsx';
import EmailVerify from './pages/EmailVerify.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PlantsDashboard from './pages/PlantsDashboard';
import PlantDetail from './pages/PlantDetail';
import './styles/designSystem.css';
import './App.css';
import EnhancedPlantGallery from './components/PlantGallery';
import AddPlantFlow from './components/AddPlant/AddPlantFlow';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './components/ProfilePage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import RewardsPage from './pages/RewardsPage';
import DiseaseDetection from './pages/DiseaseDetection.jsx';


import { PlantChatProvider } from './components/PlantChatContext';
import { NotificationProvider } from './components/Notifications/NotificationContext';
import { PlantProvider } from './context/PlantContext';
import { RewardsProvider } from './context/RewardsContext';
import RewardToast from './components/Rewards/RewardToast';

// Test components
import PlantHealthCheck from './pages/plantHealth.jsx';
import ChatNavigation from './components/Navigation/ChatNavigation.jsx';


// Animated page transitions
const PageTransition = ({ children }) => {
    const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      <div className="fixed bottom-8 right-8 z-50">
        <ChatNavigation />
      </div>
    </AnimatePresence>
  );
};

function App() {
    return (
        <RewardsProvider>
            <PlantProvider>
                <NotificationProvider>
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <RewardToast />
                    <Routes>
                        {/* Public landing page */}

                        {/* Auth routes - no layout */}
                        <Route path="/login" element={
                            <PageTransition>
                                <Login />
                            </PageTransition>
                        } />

                        <Route path="/email-verify" element={
                            <PageTransition>
                                <EmailVerify />
                            </PageTransition>
                        } />
                        <Route path="/reset-password" element={
                            <PageTransition>
                                <ResetPassword />
                            </PageTransition>
                        } />

                        {/* Main app routes with layout - Home is now the dashboard */}
                        <Route element={<Layout />}>
                            <Route path="/" element={
                                <PageTransition>
                                    <Home />
                                </PageTransition>
                            } />
                            <Route path="/plants" element={
                                <PageTransition>
                                    <PlantsDashboard />
                                </PageTransition>
                            } />
                            {/* ... other routes within the Layout ... */}
                            <Route path="/plants/:plantId" element={
                                <PageTransition>
                                    <PlantDetail />
                                </PageTransition>
                            } />
                            <Route path="/plants/add" element={
                                <PageTransition>
                                    <AddPlantFlow />
                                </PageTransition>
                            } />
                            <Route path="/notifications" element={
                                <PageTransition>
                                    <NotificationsPage />
                                </PageTransition>
                            } />
                            <Route path="/profile" element={
                                <PageTransition>
                                    <ProfilePage />
                                </PageTransition>
                            } />
                            <Route path="/gallery" element={
                                <PageTransition>
                                    <EnhancedPlantGallery />
                                </PageTransition>
                            } />
                            <Route path="/rewards" element={
                                <PageTransition>
                                    <RewardsPage />
                                </PageTransition>
                            } />
                            <Route path="/chat" element={
                                <PageTransition>
                                    <PlantChatProvider>
                                        <ChatPage />
                                    </PlantChatProvider>
                                </PageTransition>
                            } />
                            <Route path="/profile/settings" element={
                                <PageTransition>
                                    <ProfileSettingsPage />
                                </PageTransition>
                            } />
                            <Route path="/health" element={
                                <PageTransition>
                                    <PlantHealthCheck />
                                </PageTransition>
                            } />
                            <Route path="/disease" element={
                                <PageTransition>
                                    <DiseaseDetection />
                                </PageTransition>
                            } />
                        </Route>
                    </Routes>
                </NotificationProvider>
            </PlantProvider>
        </RewardsProvider>
    );
}

export default App;