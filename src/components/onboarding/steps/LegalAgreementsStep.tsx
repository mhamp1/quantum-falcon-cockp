/**
 * Step 4: Legal agreements modal
 * 
 * Requirements:
 * - Make all 4 checkboxes VISIBLE and clickable (currently invisible in prod)
 * - Add a glowing neon "I ACCEPT & CONTINUE" button that only enables when all 4 checkboxes are checked
 * - After accept → proceed to step 5
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import RiskDisclosureModal from '@/components/legal/RiskDisclosureModal';

interface LegalAgreementsStepProps {
  onComplete: () => void;
}

export default function LegalAgreementsStep({ onComplete }: LegalAgreementsStepProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = () => {
    setIsOpen(false);
    // Small delay for smooth transition
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <RiskDisclosureModal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing without acceptance
      onAccept={handleAccept}
      version="2025-11-23"
    />
  );
}

