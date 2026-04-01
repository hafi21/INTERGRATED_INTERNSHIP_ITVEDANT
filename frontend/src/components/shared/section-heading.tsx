import { motion } from "framer-motion";

export const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.5 }}
    className="max-w-2xl"
  >
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-brand-600">
      {eyebrow}
    </p>
    <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
    <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
  </motion.div>
);

