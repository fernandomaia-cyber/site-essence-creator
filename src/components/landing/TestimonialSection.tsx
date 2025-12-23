import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "Kappi reduced our compliance review time by 73% and helped us identify regulatory risks we didn't even know existed. The ROI was evident within the first quarter.",
    author: "Sarah Chen",
    title: "Chief Compliance Officer",
    company: "Fortune 500 Financial Institution",
    metric: "73% Time Saved",
  },
  {
    quote: "The AI-driven auditing feature is a game-changer. We're now ahead of regulatory changes instead of constantly playing catch-up. Our audit preparation has never been smoother.",
    author: "Michael Reynolds",
    title: "General Counsel",
    company: "Top 50 Law Firm",
    metric: "Zero Audit Findings",
  },
  {
    quote: "Security was our top concern, and Kappi exceeded every expectation. The SOC2 compliance and bank-grade encryption gave our board complete confidence in the platform.",
    author: "Jennifer Walsh",
    title: "VP of Risk Management",
    company: "Global Investment Bank",
    metric: "100% Security Score",
  },
];

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            Trusted by Industry Leaders
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-dark rounded-2xl p-8 md:p-12"
              >
                <Quote className="w-12 h-12 text-accent/50 mb-6" />
                
                <blockquote className="text-xl md:text-2xl text-primary-foreground/90 font-medium leading-relaxed mb-8">
                  "{current.quote}"
                </blockquote>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="font-semibold text-primary-foreground">
                      {current.author}
                    </div>
                    <div className="text-primary-foreground/70 text-sm">
                      {current.title}
                    </div>
                    <div className="text-primary-foreground/50 text-sm">
                      {current.company}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
                    <span className="text-accent font-bold">{current.metric}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-accent w-6"
                        : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};