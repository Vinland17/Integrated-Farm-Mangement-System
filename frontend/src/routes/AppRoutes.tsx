import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Farms } from '../pages/Farms';
import { Fields } from '../pages/Fields';
import { Crops } from '../pages/Crops';
import { Soil } from '../pages/Soil';
import { Weather } from '../pages/Weather';
import { Inventory } from '../pages/Inventory';
import { Workers } from '../pages/Workers';
import { Finance } from '../pages/Finance';
import { Harvest } from '../pages/Harvest';
import { AIRecommendations } from '../pages/AIRecommendations';
import { DiseaseDetection } from '../pages/DiseaseDetection';
import { Alerts } from '../pages/Alerts';
import { Reports } from '../pages/Reports';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/soil" element={<Soil />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/harvest" element={<Harvest />} />
          <Route path="/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
