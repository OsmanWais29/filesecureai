
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
import DocumentViewerPage from './pages/DocumentViewerPage';
import { ThemeProvider } from './components/ui/theme-provider';
import Index from './pages/Index';

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
    element: <MainLayout><ConverterPage /></MainLayout>,
  },
  {
    path: "/document-viewer/:documentId",
    element: <DocumentViewerPage />,
  },
  {
    path: "/index",
    element: <Index />,
  }
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
