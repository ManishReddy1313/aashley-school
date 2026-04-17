import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep loader for 1.8 seconds to satisfy "1-2 seconds" request
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -20,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#11325f]"
          style={{
            background: "radial-gradient(circle at center, #1a457a 0%, #11325f 100%)"
          }}
        >
          {/* Subtle gold top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark opacity-50" />
          
          <div className="relative">
            {/* Pulsing ring background */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.3, 1.5],
                opacity: [0, 0.15, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-x-[-50%] inset-y-[-50%] rounded-full bg-gold/20 blur-2xl"
            />
            
            {/* Main Logo Container - Transparent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              <img 
                src="/aashley_logo_white.png" 
                alt="Aashley School Logo" 
                className="h-40 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              />
              
              {/* Progress Bar under logo - Muted and Sleek */}
              <div className="w-48 h-0.5 bg-white/5 mt-10 overflow-hidden relative">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-8 text-center"
            >
              <span className="text-gold/80 font-serif font-black tracking-[0.4em] uppercase text-[10px] block">
                Aashley International School
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
