import Settings from "./views/Settings";
import Render from "./views/Render";

export function App() {
  const path = window.location.pathname;

  if (path === "/settings") return <Settings />;
  if (path === "/render") return <Render />;

  return <div>Invalid mount point: {path}</div>;
}
