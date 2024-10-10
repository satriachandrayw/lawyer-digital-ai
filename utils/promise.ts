export const retryWithExponentialBackoff = async (fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0
  while (retries < maxRetries) {
    try {
      return await fn()
    }
    catch (error) {
      retries++
      if (retries === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries)))
    }
  }
}
