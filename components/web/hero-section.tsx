"use client";

import { motion } from "motion/react";
import Navbar from "@/components/web/navbar";

const words = ["Upload.", "Share.", "Done."];

export default function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-2 pt-6 pb-16 text-center bg-linear-to-b from-muted/40 to-background dark:from-background dark:to-background ">
      <Navbar />

      {/* Headline */}
      <h1 className="mt-12 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="mr-3 inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
      >
        Upload files or folders and share with anyone using a single link. Files
        auto-delete after 24 hours.
      </motion.p>
    </section>
  );
}
