
import React from 'react';
import { StatCard } from './StatCard';
import { FileText, Users, Activity, Upload, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react';
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Documents"
        value="156"
        description="+12 this week"
        icon={FileText}
        trend="up"
        percentage="+8.2%"
        onClick={handleDocumentsClick}
        gradient="from-blue-500 to-blue-600"
      />
      
      <StatCard
        title="Active Clients"
        value="24"
        description="+3 this month"
        icon={Users}
        trend="up"
        percentage="+14.3%"
        onClick={handleClientsClick}
        gradient="from-green-500 to-green-600"
      />
      
      <StatCard
        title="Pending Tasks"
        value="8"
        description="2 high priority"
        icon={Clock}
        trend="down"
        percentage="-25%"
        onClick={handleTasksClick}
        gradient="from-amber-500 to-orange-500"
      />
      
      <StatCard
        title="Compliance Score"
        value="98%"
        description="Excellent status"
        icon={Shield}
        trend="up"
        percentage="+2%"
        onClick={handleUploadsClick}
        gradient="from-purple-500 to-purple-600"
      />
    </div>
  );
};
