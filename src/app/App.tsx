import { RouterProvider } from "react-router-dom";
import "../App.css";
import { useAppContext } from "./context";
import { AppProviders } from "./providers";
import { router } from "./router";

function Notice() {
  const { notice } = useAppContext();
  return notice ? <div className="toast" role="status">{notice}</div> : null;
}

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Notice />
    </AppProviders>
  );
}