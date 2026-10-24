import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function ExploreArrow() {
  return (
    <motion.div
      className="mt-6 flex flex-col items-center gap-2 text-slate-500"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.18 }}
          >
            <ChevronDown className="h-5 w-5 text-sky-600" />
          </motion.div>
        ))}
      </div>
      <div className="text-sm font-medium tracking-[0.12em] text-slate-600 uppercase">
        Explore Stocks, IPOs & Mutual Funds
      </div>
    </motion.div>
  )
}
