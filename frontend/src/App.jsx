import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transaction";
import Budget from "./components/Budget";
import Forecast from "./components/Forecast";
import Analytics from "./components/Analytics";
import Investment from "./components/Investment";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <Layout />, // parent layout with <Outlet />
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "budget", element: <Budget /> },
      { path: "forecast", element: <Forecast /> },
      { path: "analytics", element: <Analytics /> },
      { path: "investment", element: <Investment /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
