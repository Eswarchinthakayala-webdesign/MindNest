import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import AppLayout from './layout/app-layout';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CollectionPage from './pages/CollectionPage';
import CollectionDetails from './pages/CollectionDetails';
import CreateJournal from './pages/CreateJournal';
import ViewJournal from './pages/ViewJournal';
import EditJournal from './pages/EditJournal';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import { AuthProvider } from './context/auth-context';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />
      }
    ]
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },

  {
    path: "/dashboard/journal",
    element: (
      <ProtectedRoute>
        <JournalPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/collections",
    element: (
      <ProtectedRoute>
        <CollectionPage />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/collections/:id",
    element: (
      <ProtectedRoute>
        <CollectionDetails />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/collections/:collectionId/new",
    element: (
      <ProtectedRoute>
        <CreateJournal />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/journal/new",
    element: (
      <ProtectedRoute>
        <CreateJournal />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/collections/:collectionId/journal/:journalId",
    element: (
      <ProtectedRoute>
        <ViewJournal />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/collections/:collectionId/edit/:journalId",
    element: (
      <ProtectedRoute>
        <EditJournal />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard/analytics",
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    )
  },

]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;