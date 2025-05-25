
import React from 'react';
import { StatCard } from './StatCard';
import { FileText, Users, Activity, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StatsGrid = () => {
  const navigate = useNavigate();

  const handleDocumentsClick = () => {
    navigate('/documents');
  };

  const handleClientsClick = () => {
    navigate('/crm');
  };

  const handleTasksClick = () => {
    navigate('/crm', { state: { activeTab: 'tasks' } });
  };

  const handleUploadsClick = () => {
    navigate('/documents', { state: { showUpload: true } });
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="Documents"
        value="24"
        description="+2 this week"
        icon={FileText}
        onClick={handleDocumentsClick}
      />
      
      <StatCard
        title="Clients"
        value="12"
        description="+1 this week"
        icon={Users}
        onClick={handleClientsClick}
      />
      
      <StatCard
        title="Tasks"
        value="8"
        description="-3 today"
        icon={Activity}
        onClick={handleTasksClick}
      />
      
      <StatCard
        title="This Month"
        value="32"
        description="Files uploaded"
        icon={Upload}
        onClick={handleUploadsClick}
      />
    </div>
  );
};
