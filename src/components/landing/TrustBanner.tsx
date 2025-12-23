import { motion } from "framer-motion";

const trustedLogos = [
  { name: "Goldman Sachs", initials: "GS" },
  { name: "Morgan Stanley", initials: "MS" },
  { name: "Skadden", initials: "SK" },
  { name: "Latham & Watkins", initials: "LW" },
  { name: "Citi", initials: "C" },
  { name: "JPMorgan", initials: "JP" },
];

export const TrustBanner = () => {
  return (
    <section className="py-16 bg-secondary/50 border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground font-medium">
            Trusted by <span className="text-primary font-semibold">500+</span> Legal & Financial Firms Worldwide
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {trustedLogos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="w-20 h-12 flex items-center justify-center rounded-lg bg-background/50 border border-border/50 group-hover:border-accent/30 transition-colors">
                <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {logo.initials}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};