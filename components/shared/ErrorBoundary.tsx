'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium text-sm">Something went wrong</p>
          <p className="text-red-500 text-xs mt-1">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-xs text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
