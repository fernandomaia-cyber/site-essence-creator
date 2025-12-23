import { motion } from "framer-motion";
import { ScanSearch, Lock, FileText } from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "AI-Driven Auditing",
    description: "Real-time monitoring of regulatory changes across 150+ jurisdictions. Our AI continuously scans for updates and automatically flags relevant changes to your compliance team.",
    highlight: "150+ Jurisdictions Covered",
  },
  {
    icon: Lock,
    title: "Secure Data Vault",
    description: "Bank-grade encryption (AES-256) for sensitive legal documentation. Your data is stored in SOC2-compliant infrastructure with end-to-end encryption at rest and in transit.",
    highlight: "AES-256 Encryption",
  },
  {
    icon: FileText,
    title: "Automated Reporting",
    description: "Generate audit-ready compliance reports in one click. Customizable templates for different regulatory bodies including SEC, FCA, GDPR, and more.",
    highlight: "One-Click Reports",
  },
];

export const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            The Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-3 mb-4">
            Enterprise-Grade Compliance Infrastructure
          </h2>
          <p className="text-muted-foreground text-lg">
            Built for the most demanding legal and financial teams, our platform 
            combines AI intelligence with bulletproof security.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="h-full glass rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Highlight Badge */}
                <div className="inline-flex items-center gap-2 text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {feature.highlight}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};