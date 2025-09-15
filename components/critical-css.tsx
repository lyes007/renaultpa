"use client"

export function CriticalCSS() {
  return (
    <style jsx global>{`
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
      
      /* Critical layout styles */
      .flex {
        display: flex;
      }
      
      .flex-col {
        flex-direction: column;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-center {
        justify-content: center;
      }
      
      .text-center {
        text-align: center;
      }
      
      .w-full {
        width: 100%;
      }
      
      .h-full {
        height: 100%;
      }
      
      /* Critical spacing */
      .py-8 {
        padding-top: 2rem;
        padding-bottom: 2rem;
      }
      
      .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .mb-6 {
        margin-bottom: 1.5rem;
      }
      
      .mb-8 {
        margin-bottom: 2rem;
      }
      
      /* Critical colors */
      .text-white {
        color: white;
      }
      
      .bg-white {
        background-color: white;
      }
      
      /* Critical positioning */
      .relative {
        position: relative;
      }
      
      .absolute {
        position: absolute;
      }
      
      .inset-0 {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      
      /* Critical z-index */
      .z-10 {
        z-index: 10;
      }
      
      /* Critical overflow */
      .overflow-hidden {
        overflow: hidden;
      }
      
      /* Critical border radius */
      .rounded-lg {
        border-radius: 0.5rem;
      }
      
      /* Critical shadows */
      .shadow-sm {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      
      /* Critical backdrop */
      .backdrop-blur-sm {
        backdrop-filter: blur(4px);
      }
      
      /* Critical border */
      .border {
        border-width: 1px;
      }
      
      .border-white\/20 {
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      /* Critical background */
      .bg-white\/10 {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      /* Critical gradient */
      .bg-gradient-to-br {
        background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
      }
      
      .from-background {
        --tw-gradient-from: hsl(var(--background));
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(255, 255, 255, 0));
      }
      
      .to-muted\/20 {
        --tw-gradient-to: hsl(var(--muted) / 0.2);
      }
    `}</style>
  )
}
