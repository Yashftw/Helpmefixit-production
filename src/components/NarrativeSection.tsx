import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface NarrativeSectionProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reversed?: boolean;
  badge?: string;
}

const NarrativeSection = ({ title, description, image, imageAlt, reversed, badge }: NarrativeSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-32 overflow-hidden">
      <div className={`container flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20 px-4`}>
        <motion.div
          initial={{ opacity: 0, x: reversed ? 40 : -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 max-w-lg"
        >
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full glass-surface text-xs font-medium text-primary mb-4">
              {badge}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: reversed ? -40 : 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="flex-1 max-w-sm"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              width={800}
              height={600}
              className="relative rounded-2xl shadow-card w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NarrativeSection;
