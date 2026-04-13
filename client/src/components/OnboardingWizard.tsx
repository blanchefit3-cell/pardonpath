import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSkipped, setHasSkipped] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      number: 1,
      title: "Welcome to PardonPath",
      description: "Your journey to a clean slate starts here",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            PardonPath guides you through the record suspension process with AI-powered assistance and expert paralegal support.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">AI-Powered Eligibility Check</p>
                <p className="text-sm text-muted-foreground">Instant assessment of your eligibility</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Expert Paralegal Review</p>
                <p className="text-sm text-muted-foreground">Professional guidance every step of the way</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Real-Time Status Tracking</p>
                <p className="text-sm text-muted-foreground">Monitor your application progress</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: "Check Your Eligibility",
      description: "Answer a few quick questions",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Our AI-powered system will instantly determine if you're eligible for a record suspension based on your criminal record details.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Takes 5-10 minutes</p>
                <p className="text-sm text-blue-700">No personal information is stored during this check</p>
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setLocation("/login");
              onClose();
            }}
          >
            Start Eligibility Check
          </Button>
        </div>
      ),
    },
    {
      number: 3,
      title: "Upload Your Documents",
      description: "Secure document submission",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Upload your supporting documents securely. Our AI will review them for completeness and accuracy.
          </p>
          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
            <p className="font-medium text-foreground text-sm">Required Documents:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Police certificate</li>
              <li>• Court records</li>
              <li>• ID documentation</li>
              <li>• Employment/character references</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">PIPEDA Compliant</p>
                <p className="text-sm text-green-700">Your documents are encrypted and securely stored</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Choose Your Service Level",
      description: "Select the support you need",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Select the service level that fits your needs and budget.
          </p>
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition">
              <p className="font-medium text-foreground">DIY - $199</p>
              <p className="text-sm text-muted-foreground">Self-guided with AI assistance</p>
            </div>
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <p className="font-medium text-foreground">Done-With-You - $599</p>
              <p className="text-sm text-muted-foreground">Expert guidance & paralegal support</p>
            </div>
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition">
              <p className="font-medium text-foreground">Done-For-You - $1,199</p>
              <p className="text-sm text-muted-foreground">Complete hands-off service</p>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setLocation("/pricing");
              onClose();
            }}
          >
            View Pricing Details
          </Button>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setHasSkipped(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <span>Step {currentStep} of {totalSteps}</span>
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Skip
              </button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {currentStep} of {totalSteps} steps
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>

            <div className="py-6">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
            >
              {currentStep === totalSteps ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
