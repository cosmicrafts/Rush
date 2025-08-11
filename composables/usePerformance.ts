// Performance monitoring utility for Cosmic Rush
export const usePerformance = () => {
  const marks = new Map<string, number>()
  const measures = new Map<string, number[]>()
  
  // Performance mark utility
  const mark = (name: string) => {
    if (process.env.NODE_ENV === 'development') {
      marks.set(name, performance.now())
    }
  }
  
  // Performance measure utility
  const measure = (name: string, startMark: string, endMark: string) => {
    if (process.env.NODE_ENV === 'development') {
      const start = marks.get(startMark)
      const end = marks.get(endMark)
      
      if (start && end) {
        const duration = end - start
        if (!measures.has(name)) {
          measures.set(name, [])
        }
        measures.get(name)!.push(duration)
        
        // Log performance data
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
        
        // Clean up marks
        marks.delete(startMark)
        marks.delete(endMark)
        
        return duration
      }
    }
    return 0
  }
  
  // Get average performance for a measure
  const getAverageMeasure = (name: string) => {
    const measureData = measures.get(name)
    if (measureData && measureData.length > 0) {
      const average = measureData.reduce((sum, val) => sum + val, 0) / measureData.length
      return average
    }
    return 0
  }
  
  // Clear all performance data
  const clear = () => {
    marks.clear()
    measures.clear()
  }
  
  // Debounce utility for performance
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }
  
  // Throttle utility for performance
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // Cache utility for expensive operations
  const createCache = <T>(duration: number = 30000) => {
    const cache = new Map<string, { data: T; timestamp: number }>()
    
    const get = (key: string): T | null => {
      const cached = cache.get(key)
      if (cached && Date.now() - cached.timestamp < duration) {
        return cached.data
      }
      return null
    }
    
    const set = (key: string, data: T) => {
      cache.set(key, { data, timestamp: Date.now() })
    }
    
    const clear = () => cache.clear()
    
    return { get, set, clear }
  }
  
  // Batch operations utility
  const createBatchProcessor = <T>(
    processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    delay: number = 100
  ) => {
    let queue: T[] = []
    let processing = false
    
    const add = async (item: T) => {
      queue.push(item)
      
      if (!processing) {
        processing = true
        await processBatch()
      }
    }
    
    const processBatch = async () => {
      while (queue.length > 0) {
        const batch = queue.splice(0, batchSize)
        await processor(batch)
        
        if (queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      processing = false
    }
    
    return { add, processBatch }
  }
  
  return {
    mark,
    measure,
    getAverageMeasure,
    clear,
    debounce,
    throttle,
    createCache,
    createBatchProcessor
  }
}
