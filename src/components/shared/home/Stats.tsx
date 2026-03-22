'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { STATS_DATA } from '@/constants/stats';

export const Stats: React.FC = () => {
  return (
    <section className="relative py-12 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {STATS_DATA.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center group hover:border-gold/30 transition-all duration-500 hover:-translate-y-2 shadow-xl"
            >
              <div className="mb-4 p-3 rounded-2xl bg-gold/5 group-hover:bg-gold/10 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
                {stat.icon}
              </div>

              <div className="flex items-baseline gap-1 mb-1 font-almarai">
                <span className="text-3xl md:text-5xl font-black text-white group-hover:text-gold transition-colors">
                  {stat.value}
                </span>
                <span className="text-gold font-bold text-xl md:text-2xl">
                  {stat.suffix}
                </span>
              </div>

              <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-wider group-hover:text-white/80 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};