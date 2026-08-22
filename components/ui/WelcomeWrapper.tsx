"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";

export default function WelcomeWrapper({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Để tránh lỗi Hydration của Next.js, ta phải set state sau khi component mount
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowWelcome(false);
    sessionStorage.setItem("hasSeenWelcome", "true");
  };

  // Tránh flash màn hình welcome nếu đã xem rồi bằng cách không render WelcomeScreen
  // nếu ban đầu chưa check xong sessionStorage thì render mặc định showWelcome là true
  // Khi hydration xảy ra, nếu hasSeenWelcome là true thì setShowWelcome(false)
  // Thực tế Framer Motion sẽ xử lý việc gỡ bỏ an toàn qua AnimatePresence trong component con

  return (
    <>
      {showWelcome && <WelcomeScreen onLoadingComplete={handleLoadingComplete} />}
      {children}
    </>
  );
}
