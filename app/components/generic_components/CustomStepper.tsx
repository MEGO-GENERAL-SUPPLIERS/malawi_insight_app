import React from 'react';
import { Check } from 'lucide-react';

export interface StepObject {
  label: string;
  description?: string;
}

type Step = string | StepObject;

interface CustomStyles {
  circle?: React.CSSProperties;
  line?: React.CSSProperties;
  label?: React.CSSProperties;
}

interface StepperProps {
  steps?: Step[];
  activeStep?: number;
  onStepClick?: ((index: number) => void) | null;
  clickable?: boolean;
  showCompletedIcon?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  alternativeLabel?: boolean;
  className?: string;
  customStyles?: CustomStyles;
}

// Map color names to Tailwind classes
const colorMap: Record<string, { bg: string; text: string; line: string }> = {
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    line: 'bg-emerald-500',
  },
  gray: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    line: 'bg-gray-300',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    line: 'bg-blue-500',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    line: 'bg-red-500',
  },
  // Add more as needed
};

const sizeConfig: Record<'sm' | 'md' | 'lg', { circle: string; text: string; label: string; line: string; iconSize: number }> = {
  sm: {
    circle: 'w-6 h-6 text-xs',
    text: 'text-xs',
    label: 'text-xs mt-1',
    line: 'h-0.5',
    iconSize: 12,
  },
  md: {
    circle: 'w-8 h-8 text-sm',
    text: 'text-sm',
    label: 'text-sm mt-1.5',
    line: 'h-0.5',
    iconSize: 16,
  },
  lg: {
    circle: 'w-10 h-10 text-base',
    text: 'text-base',
    label: 'text-base mt-2',
    line: 'h-0.5',
    iconSize: 20,
  },
};

export const Stepper: React.FC<StepperProps> = ({
  steps = [],
  activeStep = 0,
  onStepClick = null,
  clickable = false,
  showCompletedIcon = true,
  activeColor = 'emerald',
  inactiveColor = 'gray',
  size = 'md',
  orientation = 'horizontal',
  alternativeLabel = true,
  className = '',
  customStyles = {},
}) => {
  if (steps.length === 0) return null;

  const activeClasses = colorMap[activeColor] || colorMap.emerald;
  const inactiveClasses = colorMap[inactiveColor] || colorMap.gray;

  const config = sizeConfig[size];

  const getStepState = (index: number): 'active' | 'completed' | 'inactive' => {
    if (index === activeStep) return 'active';
    if (index < activeStep) return 'completed';
    return 'inactive';
  };

  const renderStep = (step: Step, index: number) => {
    const state = getStepState(index);
    const isClickable = clickable && onStepClick && state !== 'active';

    let content: string;
    let description: string | undefined;

    if (typeof step === 'string') {
      content = step;
    } else {
      content = step.label;
      description = step.description;
    }

    const baseCircleClasses = `flex items-center justify-center rounded-full font-medium transition-colors duration-200 ${config.circle}`;
    const baseTextClasses = `${config.text} font-medium truncate`;

    let circleClass = '';
    let textColor = '';
    let cursorClass = isClickable ? 'cursor-pointer hover:opacity-90' : '';

    if (state === 'active') {
      circleClass = `${activeClasses.bg} text-white`;
      textColor = activeClasses.text;
    } else if (state === 'completed') {
      circleClass = `${activeClasses.bg} text-white`;
      textColor = activeClasses.text;
    } else {
      circleClass = `${inactiveClasses.bg} text-white`;
      textColor = inactiveClasses.text;
    }

    const circleStyle = {
      ...customStyles.circle,
    };

    const labelStyle = {
      ...customStyles.label,
    };

    return (
      <div
        key={index}
        className={`flex ${orientation === 'vertical' ? 'flex-col items-center py-2' : 'flex-col items-center'} ${cursorClass}`}
        onClick={() => isClickable && onStepClick?.(index)}
        aria-hidden={!isClickable}
      >
        {/* Circle / Icon */}
        <div
          className={`${baseCircleClasses} ${circleClass} ${orientation === 'vertical' ? 'mb-2' : ''}`}
          style={circleStyle}
        >
          {state === 'completed' && showCompletedIcon ? (
            <Check size={config.iconSize} />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Label (hidden on very small screens) */}
        <div
          className={`hidden sm:block text-center max-w- ${config.label} ${textColor} whitespace-nowrap overflow-hidden`}
          style={labelStyle}
        >
          {content}
          {description && (
            <p className={`mt-1 text-xs ${state === 'active' ? 'text-current' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderConnector = (index: number) => {
    const isLast = index === steps.length - 1;
    if (isLast) return null;

    const nextStepState = getStepState(index + 1);
    const currentStepState = getStepState(index);

    let lineColor = '';
    if (currentStepState === 'completed' && nextStepState !== 'active') {
      lineColor = activeClasses.line;
    } else {
      lineColor = inactiveClasses.line;
    }

    const lineStyle = {
      ...customStyles.line,
    };

    if (orientation === 'vertical') {
      return (
        <div
          className={`w-1 mx-auto my-1 ${lineColor} ${config.line}`}
          style={lineStyle}
        />
      );
    }

    return (
      <div
        className={`flex-1 mx-2 ${lineColor} ${config.line} self-center`}
        style={lineStyle}
      />
    );
  };

  const stepElements = steps.map((step, index) => (
    <React.Fragment key={index}>
      {renderStep(step, index)}
      {renderConnector(index)}
    </React.Fragment>
  ));

  const containerClasses = [
    'flex',
    orientation === 'horizontal' ? 'flex-row items-center w-full overflow-x-auto' : 'flex-col',
    className,
  ].join(' ');

  return (
    <div className={containerClasses}>
      {orientation === 'horizontal' && alternativeLabel ? (
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center w-full">{stepElements}</div>
          {/* Optional: space for alternative labels below (not used here since labels are in step) */}
        </div>
      ) : (
        stepElements
      )}
    </div>
  );
};
