// ===========================================================================================
// MAIN.JSX — The entry point of the React frontend application.
// This file mounts the root React component (<App />) into the DOM.
// It's the first file that runs when the browser loads the Vite-built bundle.
// ===========================================================================================

// Import StrictMode from React — a development-only wrapper that:
//   1. Runs effects twice to catch bugs with cleanup functions.
//   2. Warns about deprecated APIs and unsafe lifecycle methods.
//   3. Has NO effect in production builds.
import { StrictMode } from 'react'

// Import createRoot from React 18's new root API.
// createRoot replaces the old ReactDOM.render() and enables concurrent features.
// It takes a DOM element and returns a root object with a .render() method.
import { createRoot } from 'react-dom/client'

// Import the root App component — contains the router, context providers, and all pages.
import App from './App.jsx'

// Import the global SCSS stylesheet — sets up CSS variables, fonts, reset, and design tokens.
// This import is processed by Vite's SCSS plugin and injected as a <style> tag.
import "./style.scss"

// Mount the React app into the DOM.
// document.getElementById('root') finds the <div id="root"> in index.html.
// createRoot creates a React root at that DOM node.
// .render() renders the <App /> component tree into that root.
// <StrictMode> wraps the app for development checks (removed in production).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
