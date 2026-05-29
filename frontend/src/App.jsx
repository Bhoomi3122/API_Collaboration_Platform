import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import AllWorkspacesPage from "./components/workspace/AllWorkspacesPage";
import WorkspacePage from "./components/workspace/WorkspacePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<AllWorkspacesPage />} />
        <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
      </Routes>
    </Router>
  );
}

export default App;