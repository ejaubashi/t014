// Opt-in diagnostics only: no telemetry requests, tracking IDs, or stored visitor data.
import { onCLS, onINP, onLCP } from "web-vitals";
const publish = (metric) => {
  const detail = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  };
  window.dispatchEvent(new CustomEvent("portfolio:metric", { detail }));
  console.info("[Portfolio metrics]", detail);
};
onCLS(publish);
onINP(publish);
onLCP(publish);
