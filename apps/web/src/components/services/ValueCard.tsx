'use client';
import { motion } from 'framer-motion';
import { ValueCardProps } from '@/types/WhyUs';

export const ValueCard = ({ title, desc, icon: Icon, gradient, index }: ValueCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -8 }}
    className="group relative p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-md overflow-hidden transition-all duration-500"
  >
    {/* تأثير النيون الخلفي (Glow) */}
    <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />

    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-500">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-gold transition-colors">
      {title}
    </h3>
    <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
      {desc}
    </p>

    {/* خط ضوئي سفلي صغير */}
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gold group-hover:w-full transition-all duration-700" />
  </motion.div>
);