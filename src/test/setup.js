import '@testing-library/jest-dom/vitest'

// jsdom lacks matchMedia; dnd-kit / some libs probe it.
window.matchMedia ||= () => ({
  matches: false, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent() { return false },
})
