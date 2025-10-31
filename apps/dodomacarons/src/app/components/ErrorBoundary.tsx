import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (args: { resetErrorBoundary: () => void, error: Error}) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ ...this.state, error });
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null})
  }

  override render() {

    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
      return this.props.fallback({ error: this.state.error, resetErrorBoundary: () => {
        this.resetErrorBoundary();
      } });
      }
    }

    return this.props.children;
  }
}
