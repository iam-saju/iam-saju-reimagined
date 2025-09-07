// Override react-day-picker module to prevent Jest type conflicts
declare module 'react-day-picker' {
  export * from 'react-day-picker/dist/index';
}

// Suppress Jest type requirements for this package
declare global {
  namespace jest {
    // Empty namespace to satisfy type requirements
  }
}
