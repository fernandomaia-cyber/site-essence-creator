import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp, Shield } from "lucide-react";

export const ComplianceHealthDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Main Dashboard Card */}
      <div className="glass rounded-2xl p-6 shadow-2xl border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Compliance Health Score</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            Live
          </span>
        </div>

        {/* Main Score Ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="hsl(var(--accent))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 264" }}
                animate={{ strokeDasharray: "238 264" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-4xl font-bold text-primary"
              >
                94%
              </motion.span>
              <span className="text-xs text-muted-foreground">Compliant</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            label="Policies Active"
            value="127"
            delay={0.8}
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            label="Pending Reviews"
            value="3"
            delay={0.9}
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4 text-accent" />}
            label="Risk Reduction"
            value="↓ 47%"
            delay={1.0}
          />
          <MetricCard
            icon={<Shield className="w-4 h-4 text-primary" />}
            label="Audits Passed"
            value="12/12"
            delay={1.1}
          />
        </div>

        {/* Real-time Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-primary font-medium">
              New: GDPR Article 17 update detected
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating decoration */}
      <div className="absolute -z-10 top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute -z-10 bottom-10 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
    </motion.div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="p-3 bg-secondary/50 rounded-lg"
  >
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="text-lg font-semibold text-primary">{value}</span>
  </motion.div>
);