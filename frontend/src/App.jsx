import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transaction";
import Budget from "./components/Budget";
import Forecast from "./components/Forecast";
import Analytics from "./components/Analytics";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Layout />, // parent layout with <Outlet />
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "budget", element: <Budget /> },
      { path: "forecast", element: <Forecast /> },
      { path: "analytics", element: <Analytics /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
