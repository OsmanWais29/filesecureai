
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Document Management System</h1>
          <p className="text-xl text-muted-foreground">
            Securely store, manage, and view your important documents
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Store Documents</h2>
            <p className="mb-4 text-muted-foreground">
              Upload and securely store all your important documents in one place.
            </p>
            <Link to="/documents">
              <Button variant="outline">View Documents</Button>
            </Link>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Quick Preview</h2>
            <p className="mb-4 text-muted-foreground">
              Easily preview documents without downloading them.
            </p>
            <Link to="/documents">
              <Button variant="outline">Browse Files</Button>
            </Link>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Manage Access</h2>
            <p className="mb-4 text-muted-foreground">
              Control who can view and edit your documents.
            </p>
            <Link to="/profile">
              <Button variant="outline">Account Settings</Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
          <p className="mb-6 text-muted-foreground">
            Create an account to start managing your documents or log in to access your files.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
