// src/components/PageContainer.jsx
// Doggerz: Accessible, responsive page wrapper
// Usage: <PageContainer>...</PageContainer>

import React from "react";
import PropTypes from "prop-types";

/**
 * PageContainer: Provides consistent layout, padding, and ARIA landmarks for pages.
 * - Adds .doggerz-scroll-page for scrollable content
 * - Sets role="main" and aria-label for accessibility
 */
export default function PageContainer({ children, className = "" }) {
  return (
    <section
      className={`doggerz-scroll-page ${className}`.trim()}
      role="main"
      aria-label="Page content"
      tabIndex={-1}
    >
      {children}
    </section>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
