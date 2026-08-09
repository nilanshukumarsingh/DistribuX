import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 my-4 shadow-xs">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-3 shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-sm text-rose-700 mt-0.5">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
