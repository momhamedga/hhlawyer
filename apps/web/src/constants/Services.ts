import { Scale, Building2, Gavel, FileSignature, Wallet } from 'lucide-react';
import { ServiceItem } from '@/types/Services';
import { serviceContent } from '@/i18n/service-content';

const ar = serviceContent.ar;

export const LAW_SERVICES: ServiceItem[] = [
  {
    id: 'criminal',
    title: ar.criminal.title,
    desc: ar.criminal.description,
    icon: Gavel,
    color: 'from-red/30 to-red/10 border-red/20 text-red hover:shadow-[0_0_30px_5px_rgba(255,100,100,0.3)]',
    gridSpan: 'grid-cols-2 lg:grid-cols-1 grid-rows-2 lg:grid-rows-1 col-span-2 lg:col-span-2',
    features: ar.criminal.features,
  },
  {
    id: 'commercial',
    title: ar.commercial.title,
    desc: ar.commercial.description,
    icon: Building2,
    color: 'from-blue/30 to-blue/10 border-blue/20 text-blue hover:shadow-[0_0_30px_5px_rgba(100,100,255,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: ar.commercial.features,
  },
  {
    id: 'civil',
    title: ar.civil.title,
    desc: ar.civil.description,
    icon: Scale,
    color: 'from-gold/30 to-gold/10 border-gold/20 text-gold hover:shadow-[0_0_30px_5px_rgba(212,175,55,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: ar.civil.features,
  },
  {
    id: 'notary',
    title: ar.notary.title,
    desc: ar.notary.description,
    icon: FileSignature,
    color: 'from-white/30 to-white/10 border-white/20 text-white hover:shadow-[0_0_30px_5px_rgba(255,255,255,0.3)]',
    gridSpan: 'col-span-2 lg:col-span-2 row-span-1',
    features: ar.notary.features,
  },
  {
    id: 'taxes',
    title: ar.taxes.title,
    desc: ar.taxes.description,
    icon: Wallet,
    color: 'from-green/30 to-green/10 border-green/20 text-green hover:shadow-[0_0_30px_5px_rgba(100,255,100,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: ar.taxes.features,
  }
];
