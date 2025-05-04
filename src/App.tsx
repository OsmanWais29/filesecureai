import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import ActivityPage from './pages/ActivityPage';
import { MainLayout } from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import IncomeExpenseForm from './components/activity/form/IncomeExpenseForm';
import ConverterPage from './pages/ConverterPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout><DashboardPage /></MainLayout>,
  },
  {
    path: "/activities",
    element: <MainLayout><ActivityPage /></MainLayout>,
  },
  {
    path: "/activities/new",
    element: <MainLayout><IncomeExpenseForm /></MainLayout>,
  },
  {
    path: "/converter",
    element: <ConverterPage />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
