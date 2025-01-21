import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { UploadPage } from './pages/UploadPage';
import ConvertPage from './pages/ConvertPage';
import { Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { ThemeToggle } from './components/ThemeToggle';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Image className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              Convertify
            </h1>
          </motion.div>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            Transform your images with ease
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<UploadPage />} />
            <Route path="/convert" element={<ConvertPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="!bg-white/80 dark:!bg-secondary-800/80 !backdrop-blur-md !shadow-lg !text-xs"
        bodyClassName="!text-secondary-700 dark:!text-secondary-200 !font-sans !text-xs"
        progressClassName="!bg-primary-500"
        limit={3}
      />

      <ThemeToggle />
    </div>
  );
}

export default App;