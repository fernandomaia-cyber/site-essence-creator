import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const benefits = [
  "14-day free trial",
  "No credit card required",
  "Full platform access",
];

export const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your work email");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thanks! We'll be in touch shortly.");
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 md:p-12 text-center border border-border/50 shadow-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Limited Time Offer
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Ready to Automate Your Compliance?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 500+ firms who trust Kappi for their compliance and risk management needs.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background border-border text-primary placeholder:text-muted-foreground"
                />
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 whitespace-nowrap glow-accent"
                >
                  {isLoading ? "Sending..." : "Get Started"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};