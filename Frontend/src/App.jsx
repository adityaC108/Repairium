import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Routes */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;