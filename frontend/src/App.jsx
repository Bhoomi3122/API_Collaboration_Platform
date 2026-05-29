import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import AllWorkspacesPage from "./components/workspace/AllWorkspacesPage";
import WorkspacePage from "./components/workspace/WorkspacePage";
import CollectionDetails from "./components/request/CollectionDetails";

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
        <Route path="/collection/:collectionId" element={<CollectionDetails />} />
        <Route
          path="/collection-test"
          element={<CollectionDetails />}
        />
      </Routes>
    </Router>
  );
}

export default App;