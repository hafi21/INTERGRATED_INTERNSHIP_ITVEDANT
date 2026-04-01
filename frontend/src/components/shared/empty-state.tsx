import { Button } from "./button";

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="glass-panel rounded-[32px] px-6 py-12 text-center">
    <h3 className="text-2xl font-semibold text-ink">{title}</h3>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
    {actionLabel && onAction ? (
      <Button className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);

