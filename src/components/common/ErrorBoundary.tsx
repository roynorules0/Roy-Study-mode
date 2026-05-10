import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] text-white font-sans">
          <div className="max-w-md w-full p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight mb-2">Something went wrong</h1>
              <p className="opacity-60 text-sm leading-relaxed">
                The application encountered an unexpected error. This might be due to corrupted local data.
              </p>
            </div>
            
            <div className="p-4 rounded-2xl bg-black/40 text-left overflow-auto max-h-40">
              <code className="text-[10px] text-rose-400 font-mono">
                {this.state.error?.message || 'Unknown Error'}
              </code>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <RefreshCw size={18} />
                Try Refreshing
              </button>
              
              <button 
                onClick={this.handleReset}
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-bold text-sm hover:text-white transition-colors"
              >
                Clear Cache & Reset App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
