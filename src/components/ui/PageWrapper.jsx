import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/animations';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className={`w-full min-h-full transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
