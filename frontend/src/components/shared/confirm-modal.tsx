import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
};

export const ConfirmModal = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
}: ConfirmModalProps) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-panel w-full max-w-md rounded-[28px] p-6"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
        >
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

