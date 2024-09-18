"use client";

import { useEffect } from "react";

const LayoutFix = () => {
  useEffect(() => {
    const wrapper = document.getElementById("main-wrapper");
    if (wrapper) {
      const observer = new MutationObserver(() => {
        wrapper.style.height = "";
        wrapper.style.minHeight = "";
      });

      observer.observe(wrapper, {
        attributes: true,
        attributeFilter: ["style"],
      });

      return () => observer.disconnect();
    }
  }, []);

  return null;
};

export default LayoutFix;
