import React from 'react'

/**
 * Performance optimization utilities for ReelHunter
 */

// Debounce function for search inputs and other frequent operations
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }
}

// Throttle function for scroll events and animations
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization for expensive calculations
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map()
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map()

  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now())
  }

  static endMeasurement(name: string): number {
    const start = this.measurements.get(name)
    if (!start) {
      console.warn(`No start time found for measurement: ${name}`)
      return 0
    }
    
    const duration = performance.now() - start
    this.measurements.delete(name)
    
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  static async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasurement(name)
    try {
      const result = await operation()
      const duration = this.endMeasurement(name)
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      this.endMeasurement(name)
      throw error
    }
  }
}

// Lazy loading utilities
export function createLazyComponent<T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Virtual scrolling helper for large lists
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  itemCount: number
  overscan?: number
}

export function calculateVirtualScrollItems(
  scrollTop: number,
  options: VirtualScrollOptions
): { startIndex: number; endIndex: number; totalHeight: number } {
  const { itemHeight, containerHeight, itemCount, overscan = 5 } = options
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleItemCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(itemCount - 1, startIndex + visibleItemCount + overscan * 2)
  const totalHeight = itemCount * itemHeight
  
  return { startIndex, endIndex, totalHeight }
}

// Image optimization utilities
export function optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
  if (!url) return ''
  
  // For external images, you might use a service like Cloudinary or ImageKit
  // For now, we'll return the original URL
  const params = new URLSearchParams()
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  params.append('q', quality.toString())
  
  const separator = url.includes('?') ? '&' : '?'
  return params.toString() ? `${url}${separator}${params.toString()}` : url
}

// Bundle size optimization - lazy load heavy dependencies
export async function lazyLoadHeavyDependency(dependencyName: string) {
  switch (dependencyName) {
    case 'chart':
      // Lazy load charting library
      return await import('lucide-react').then(module => module.BarChart3)
    default:
      throw new Error(`Unknown dependency: ${dependencyName}`)
  }
}

// Network optimization
export class NetworkOptimizer {
  private static requestCache = new Map<string, { data: unknown; timestamp: number }>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static async cachedFetch<T>(
    url: string,
    options?: RequestInit,
    cacheTTL = this.CACHE_TTL
  ): Promise<T> {
    const cacheKey = `${url}_${JSON.stringify(options)}`
    const cached = this.requestCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      console.log(`[NetworkOptimizer] Cache hit for: ${url}`)
      return cached.data as T
    }
    
    console.log(`[NetworkOptimizer] Cache miss, fetching: ${url}`)
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json() as T
      this.requestCache.set(cacheKey, { data, timestamp: Date.now() })
      
      // Clean up old cache entries
      this.cleanupCache()
      
      return data
    } catch (error) {
      console.error(`[NetworkOptimizer] Fetch failed for ${url}:`, error)
      throw error
    }
  }

  private static cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.requestCache.delete(key)
      }
    }
  }

  static clearCache(): void {
    this.requestCache.clear()
    console.log('[NetworkOptimizer] Cache cleared')
  }
}

// Error boundary performance optimization
export function createOptimizedErrorBoundary(fallbackComponent: React.ComponentType) {
  return class OptimizedErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      console.error('[OptimizedErrorBoundary] Error caught:', error, errorInfo)
      // Log to error reporting service here
    }

    render(): React.ReactNode {
      if (this.state.hasError) {
        return React.createElement(fallbackComponent)
      }

      return this.props.children
    }
  }
}

// Memory optimization for large datasets
export class DataManager<T> {
  private data: T[] = []
  private pageSize: number
  private currentPage = 0

  constructor(pageSize = 50) {
    this.pageSize = pageSize
  }

  setData(data: T[]): void {
    this.data = data
    this.currentPage = 0
  }

  getCurrentPage(): T[] {
    const start = this.currentPage * this.pageSize
    const end = start + this.pageSize
    return this.data.slice(start, end)
  }

  hasNextPage(): boolean {
    return (this.currentPage + 1) * this.pageSize < this.data.length
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0
  }

  nextPage(): T[] {
    if (this.hasNextPage()) {
      this.currentPage++
    }
    return this.getCurrentPage()
  }

  previousPage(): T[] {
    if (this.hasPreviousPage()) {
      this.currentPage--
    }
    return this.getCurrentPage()
  }

  getTotalPages(): number {
    return Math.ceil(this.data.length / this.pageSize)
  }

  getCurrentPageNumber(): number {
    return this.currentPage + 1
  }
} 