/**
 * WizardLayout component
 * 
 * Step-by-step wizard navigation for multi-page forms.
 * Validates each step before allowing navigation to the next.
 */

'use client';

import React, { useState } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';

export interface WizardStep {
  /** Step identifier */
  id: string;
  
  /** Step title */
  title: string;
  
  /** Step description */
  description?: string;
  
  /** Field keys in this step */
  fields: string[];
  
  /** Step content */
  content: React.ReactNode;
  
  /** 
   * Allow navigation away from this step even if invalid
   * If false (default), validation must pass before proceeding
   * If true, user can navigate to other steps with incomplete data
   */
  allowIncomplete?: boolean;
}

export interface WizardLayoutProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  
  /** Form errors for validation */
  errors?: FieldErrors;
  
  /** Function to trigger validation for specific fields */
  validateFields?: (fields: string[]) => Promise<boolean>;
  
  /** Form data for checking if fields have values */
  formData?: FieldValues;
  
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void;
  
  /** Callback when wizard completes */
  onComplete?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

export default function WizardLayout({
  steps,
  errors = {},
  validateFields,
  formData = {},
  onStepChange,
  onComplete,
  className = '',
}: WizardLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  /**
   * Check if a step has any validation errors
   */
  const hasStepErrors = (step: WizardStep): boolean => {
    return step.fields.some((fieldKey) => {
      if (errors[fieldKey]) return true;
      
      const nestedKeys = Object.keys(errors).filter((key) =>
        key.startsWith(fieldKey + '.')
      );
      return nestedKeys.length > 0;
    });
  };

  /**
   * Check if a step is complete (all fields filled)
   */
  const isStepComplete = (step: WizardStep): boolean => {
    return step.fields.every((fieldKey) => {
      const value = formData[fieldKey];
      return value !== undefined && value !== null && value !== '';
    });
  };

  /**
   * Navigate to next step with optional validation
   */
  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    
    // Only validate if the step requires completion (allowIncomplete is false/undefined)
    if (!currentStepData.allowIncomplete && validateFields) {
      const isValid = await validateFields(currentStepData.fields);
      if (!isValid) {
        return; // Don't proceed if validation fails and step requires completion
      }
    }

    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      setVisitedSteps(new Set([...visitedSteps, nextStep]));
      onStepChange?.(nextStep);
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  /**
   * Check if all steps are valid (for enabling Complete button)
   */
  const areAllStepsValid = (): boolean => {
    return steps.every((step) => !hasStepErrors(step));
  };

  /**
   * Complete wizard (on last step)
   */
  const handleComplete = async () => {
    const currentStepData = steps[currentStep];
    
    // Validate final step if it requires completion
    if (!currentStepData.allowIncomplete && validateFields) {
      const isValid = await validateFields(currentStepData.fields);
      if (!isValid) {
        return;
      }
    }

    // Check if all steps are valid before completing
    if (!areAllStepsValid()) {
      return; // Don't complete if any step has errors
    }

    onComplete?.();
  };

  if (steps.length === 0) {
    return null;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const allStepsValid = areAllStepsValid();

  return (
    <div className={`w-full ${className}`}>
      {/* Step Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isVisited = visitedSteps.has(index);
              const isCompleted = index < currentStep;
              const hasErrors = hasStepErrors(step);
              const complete = isStepComplete(step);

              return (
                <li
                  key={step.id}
                  className={`relative ${
                    index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
                  }`}
                >
                  {/* Connector line */}
                  {index !== steps.length - 1 && (
                    <div
                      className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full"
                      aria-hidden="true"
                    >
                      <div
                        className={`h-full ${
                          isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}

                  <div className="relative flex items-center group">
                    {/* Step circle */}
                    <span
                      className={`
                        relative flex h-8 w-8 items-center justify-center rounded-full border-2
                        ${
                          isActive
                            ? hasErrors
                              ? 'border-red-500 bg-white'
                              : 'border-blue-600 bg-white'
                            : isCompleted && !hasErrors
                            ? 'border-blue-600 bg-blue-600'
                            : hasErrors && isVisited
                            ? 'border-red-500 bg-red-50'
                            : hasErrors
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-300 bg-white'
                        }
                      `}
                    >
                      {isCompleted && !hasErrors ? (
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : hasErrors ? (
                        <svg
                          className={`h-5 w-5 ${isVisited ? 'text-red-500' : 'text-orange-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </span>

                    {/* Step label */}
                    <span className="ml-4 min-w-0">
                      <span
                        className={`block text-sm font-medium ${
                          isActive
                            ? hasErrors
                              ? 'text-red-600'
                              : 'text-blue-600'
                            : isCompleted && !hasErrors
                            ? 'text-gray-900'
                            : hasErrors && isVisited
                            ? 'text-red-600'
                            : hasErrors
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.description && (
                        <span className={`block text-xs ${
                          hasErrors && isVisited
                            ? 'text-red-500'
                            : hasErrors
                            ? 'text-orange-500'
                            : 'text-gray-500'
                        }`}>
                          {step.description}
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-sm text-gray-600 mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>

        <div>{currentStepData.content}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${
              isFirstStep
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!allStepsValid}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                allStepsValid
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }
            `}
            title={!allStepsValid ? 'Please complete all steps before submitting' : ''}
          >
            Complete
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
