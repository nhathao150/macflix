"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";

export default function WelcomeWrapper({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Để tránh việc hiện lại Intro mỗi khi navigate, ta dùng sessionStorage
    // Kiểm tra xem user đã xem màn hình welcome trong phiên làm việc này chưa
    
    // TẠM TẮT ĐỂ TEST (F5 SẼ LUÔN HIỆN)
    /*
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
    */
  }, []);

  const handleLoadingComplete = () => {
    setShowWelcome(false);
    // TẠM TẮT ĐỂ TEST
    // sessionStorage.setItem("hasSeenWelcome", "true");
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
