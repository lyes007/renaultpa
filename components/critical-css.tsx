export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical CSS for above-the-fold content */
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: white;
          margin-bottom: 1.5rem;
        }
        
        .hero-slogan {
          font-size: 1.125rem;
          color: white;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        /* Prevent layout shift */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        /* Optimize font loading */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-display: swap;
        }
        
        /* Critical button styles */
        button {
          font-family: inherit;
          font-display: swap;
        }
        
        /* Prevent FOUC */
        .min-h-screen {
          min-height: 100vh;
        }
        
        /* Optimize images */
        img {
          max-width: 100%;
          height: auto;
        }
      `
    }} />
  )
}
