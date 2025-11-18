import { Component, ReactNode } from 'react'

interface Safe3DWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

interface Safe3DWrapperState {
  hasError: boolean
  error?: Error
}

export class Safe3DWrapper extends Component<Safe3DWrapperProps, Safe3DWrapperState> {
  constructor(props: Safe3DWrapperProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[Safe3DWrapper] Caught 3D rendering error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (error.message.includes('R3F') || 
        error.message.includes('data-component-loc') ||
        error.message.includes('__r3f')) {
      console.error('[Safe3DWrapper] React Three Fiber error suppressed:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null
    }

    return this.props.children
  }
}

export default Safe3DWrapper
