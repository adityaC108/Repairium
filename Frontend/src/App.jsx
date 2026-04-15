import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/home/Footer";

function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster position="top-right" />
  <Navbar />
      {/* Routes */}
      <AppRoutes />
  <Footer />
    </BrowserRouter>
  );
}

export default App;