'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ComplexAnimatedButton() {
  const [isClicked, setIsClicked] = useState(false);

  // Variantes d'animation pour le bouton
  const buttonVariants = {
    initial: { scale: 1, backgroundColor: "hsl(200, 80%, 50%)" },
    hover: { backgroundColor: "hsl(160, 100%, 40%)", scale: 1.05 },
    clicked: { scale: 0.9, backgroundColor: "hsl(300, 70%, 50%)" },
  };

  return (
    <motion.div
      // Animation de clic (réduction temporaire et couleur)
      initial="initial"
      whileHover="hover"
      whileTap="clicked"
      variants={buttonVariants}
    >
      <Button
        variant="default"
        onClick={() => setIsClicked(!isClicked)}
      >
        {isClicked ? "Complété 🎉" : "Cliquez ici"}
      </Button>
    </motion.div>
  );
}
