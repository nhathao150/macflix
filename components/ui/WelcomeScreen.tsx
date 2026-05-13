"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Code, User, Github, Globe, LucideIcon } from 'lucide-react';

const IconButton = ({ Icon }: { Icon: LucideIcon }) => (
  <motion.div
    className="p-4 rounded-full bg-black/40 border border-purple-500/30 cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:border-purple-500/60"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-6 h-6 text-white/90" />
  </motion.div>
);

const WelcomeScreen = ({ onLoadingComplete }: { onLoadingComplete?: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.4 }
    }
  };

  const textContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 }
    }
  };

  const welcomeWords = "Welcome To".split(" ");
  const macflixLetters = "Macflix".split("");

  return (
    <AnimatePresence onExitComplete={onLoadingComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#130428] overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Subtle central glow */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(107,33,168,0.2)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center px-4">
            {/* Icons */}
            <motion.div className="flex gap-6 mb-2" variants={itemVariants} exit="exit">
              <IconButton Icon={Code} />
              <IconButton Icon={User} />
              <IconButton Icon={Github} />
            </motion.div>

            {/* Typography */}
            <motion.div className="flex flex-col gap-2 items-center" variants={textContainerVariants}>
              {/* Welcome To - Hiệu ứng từng từ */}
              <div className="flex gap-3 overflow-hidden">
                {welcomeWords.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="text-4xl md:text-5xl font-bold text-white tracking-wide inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              {/* Macflix - Hiệu ứng từng chữ cái */}
              <div className="flex overflow-hidden mt-2">
                {macflixLetters.map((letter, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Bottom Section */}
            <motion.div
              variants={itemVariants}
              exit="exit"
              className="mt-8 flex items-center gap-2 text-purple-400/80 font-medium transition-opacity drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            >
              <Globe className="w-5 h-5 animate-pulse" />
              <span className="tracking-wider">macflix.vn</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
