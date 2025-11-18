import { Component, ReactNode } from 'react'

interface Safe3DWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

interface Safe3DWrapperState {
  hasError: boolean
  error?: Error
}

function isR3FError(error: Error): boolean {
  const message = error.message || ''
  const stack = error.stack || ''
  return (
    message.includes('R3F') ||
    message.includes('data-component-loc') ||
    message.includes('__r3f') ||
    message.includes('Cannot set "data-component-loc-end"') ||
    message.includes('child.object is undefined') ||
    message.includes('addEventListener') && message.includes('null') ||
    stack.includes('@react-three/fiber') ||
    stack.includes('react-three')
  )
}

export class Safe3DWrapper extends Component<Safe3DWrapperProps, Safe3DWrapperState> {
  constructor(props: Safe3DWrapperProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    if (isR3FError(error)) {
      console.warn('[Safe3DWrapper] R3F error suppressed:', error.message)
      return { hasError: false }
    }
    
    console.error('[Safe3DWrapper] Caught 3D rendering error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (isR3FError(error)) {
      console.warn('[Safe3DWrapper] React Three Fiber error suppressed:', error.message, errorInfo)
      return
    }
    
    console.error('[Safe3DWrapper] Caught error:', error, errorInfo)
  }

  componentWillUnmount() {
    try {
      console.log('[Safe3DWrapper] Cleaning up 3D wrapper')
    } catch (error) {
      console.warn('[Safe3DWrapper] Cleanup error:', error)
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
