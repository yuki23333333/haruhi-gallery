import React, { Component, ErrorInfo, ReactNode } from 'react';
import WhiteCard from './ui/WhiteCard';
import AppleButton from './ui/AppleButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
          <WhiteCard padding="xl" className="max-w-lg w-full bg-[#F5F5F7]">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <svg
                  className="mx-auto w-16 h-16 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-apple-text mb-3">
                出错了
              </h1>
              <p className="text-apple-text/60 mb-6">
                应用程序遇到了意外错误，请尝试刷新页面
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-red-500">
                      <summary className="cursor-pointer mb-2">查看错误详情</summary>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <AppleButton
                  variant="primary"
                  size="md"
                  onClick={this.handleReload}
                >
                  刷新页面
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  size="md"
                  onClick={this.handleReset}
                >
                  返回首页
                </AppleButton>
              </div>
            </div>
          </WhiteCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
