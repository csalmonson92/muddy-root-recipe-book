"use client";

import { useEffect, useState } from "react";

export default function InstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setVisible(!standalone && localStorage.getItem("muddy-root-install-hint") !== "dismissed");
  }, []);

  if (!visible) return null;
  return <aside className="install-hint">
    <button type="button" aria-label="Dismiss install instructions" onClick={() => {
      localStorage.setItem("muddy-root-install-hint", "dismissed");
      setVisible(false);
    }}>×</button>
    <strong>Install on iPhone</strong>
    <span>Tap Safari’s Share button, then “Add to Home Screen.”</span>
  </aside>;
}
