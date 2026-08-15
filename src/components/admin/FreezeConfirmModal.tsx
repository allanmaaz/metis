import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

interface FreezeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFreeze: (reason: string) => Promise<{ success: boolean; error?: string }>;
}

export const FreezeConfirmModal: React.FC<FreezeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmFreeze,
}) => {
  const [reason, setReason] = useState('Emergency market halt due to technical verification');
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeze = async () => {
    setIsLoading(true);
    const res = await onConfirmFreeze(reason);
    setIsLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <AlertOctagon className="w-6 h-6 text-rose-500" />
          <span>EMERGENCY MARKET FREEZE</span>
        </div>
      }
      subtitle="Immediately halt all trading across all teams"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <ShieldAlert className="w-5 h-5" />
            CRITICAL ACTION
          </div>
          <p>
            Activating the Emergency Freeze will instantly block <strong>ALL</strong> buy and sell transactions submitted by any team.
          </p>
          <p>
            Use this during wrong price updates, suspected glitches, or event announcements. The freeze is recorded in the permanent audit log.
          </p>
        </div>

        <div>
          <Input
            label="Freeze Reason (Required)"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for halting market..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isLoading}
            onClick={handleFreeze}
            leftIcon={<AlertOctagon className="w-4 h-4" />}
          >
            FREEZE MARKET
          </Button>
        </div>
      </div>
    </Modal>
  );
};
