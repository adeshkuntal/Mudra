import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transaction";
import Budget from "./components/Budget";
import Forecast from "./components/Forecast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // parent layout with <Outlet />
    children: [
      { index: true, element: <Dashboard /> }, // default route
      { path: "dashboard", element: <Dashboard /> },
      { path: "transactions", element: <Transactions /> },
      { path: "budget", element: <Budget /> },
      { path: "forecast", element: <Forecast /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
