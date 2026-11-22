import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Forever Finds ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16 text-charcoal">
          <div className="max-w-lg border border-beige bg-cream-dark/50 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-taupe">Application Notice</p>
            <h1 className="mt-3 font-editorial text-3xl font-medium text-charcoal">
              Something Interrupted This View
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-soft break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="mt-6 bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-cream hover:bg-charcoal-soft cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
