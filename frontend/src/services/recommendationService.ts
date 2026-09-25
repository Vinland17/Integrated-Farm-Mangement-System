import api from './api';
import { DecisionSupportItem, Alert } from '../types';

export const MOCK_DECISION_SUPPORT: DecisionSupportItem[] = [
  {
    id: 'dec-101',
    title: 'Irrigation Advisory: Delay Scheduled Watering',
    category: 'Irrigation & Weather',
    priority: 'High',
    factors: [
      { label: 'Soil Moisture', value: '28% (Adequate)' },
      { label: 'Rainfall Forecast', value: '45 mm expected in 24 hrs' },
      { label: 'Crop Stage', value: 'Tomato - Flowering' },
    ],
    recommendedAction: 'HOLD IRRIGATION FOR FIELD A & FIELD B',
    reasoning: 'Heavy rainfall event (>45mm) predicted within 24 hours. Delaying automated irrigation prevents soil waterlogging, root asphyxiation, and fertilizer leaching.',
  },
  {
    id: 'dec-102',
    title: 'Fungicide Spraying Advisory: Tomato Early Blight',
    category: 'Disease Mitigation',
    priority: 'High',
    factors: [
      { label: 'Image AI Detection', value: 'Alternaria solani (94% confidence)' },
      { label: 'Relative Humidity', value: '88% (High spore risk)' },
      { label: 'Affected Field', value: 'Field A - Tomato Plot' },
    ],
    recommendedAction: 'APPLY COPPER HYDROXIDE SPRAY WITHIN 48 HOURS',
    reasoning: 'Fungal leaf spot detected in middle canopy. High humidity elevates spore propagation. Preventive fungicide application mitigates 35% potential yield drop.',
  },
  {
    id: 'dec-103',
    title: 'Inventory Reorder Alert: Urea Fertilizer',
    category: 'Supply & Resource',
    priority: 'Medium',
    factors: [
      { label: 'Current Stock', value: '12 bags (600 kg)' },
      { label: 'Threshold Level', value: '20 bags (1000 kg)' },
      { label: 'Scheduled Demand', value: '15 bags required next week' },
    ],
    recommendedAction: 'PLACE REORDER WITH AGRICORP SUPPLIES',
    reasoning: 'Stock is 40% below safety buffer. Lead time for delivery is 3 business days; reordering now avoids top-dressing delays.',
  },
  {
    id: 'dec-104',
    title: 'Harvest Window Alert: Wheat Belt Field D',
    category: 'Harvest Operations',
    priority: 'Low',
    factors: [
      { label: 'Grain Moisture', value: '13.5% (Ideal)' },
      { label: 'Days since Planting', value: '115 Days' },
      { label: 'Weather Window', value: 'Clear skies for 5 days' },
    ],
    recommendedAction: 'SCHEDULE COMBINE HARVESTER FOR AUG 20',
    reasoning: 'Durum wheat maturity indicators reached 98%. Combining before upcoming rain cycle preserves Grade A grain quality.',
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    title: 'Severe Rainfall Forecast Alert',
    description: 'Meteorological department predicts 45mm precipitation starting tomorrow evening.',
    category: 'Weather',
    priority: 'High',
    isRead: false,
    timestamp: '10 mins ago',
    fieldId: 'fld-101',
  },
  {
    id: 'alt-02',
    title: 'Early Blight Detected in Field A',
    description: 'Diagnostic leaf image scan flagged Moderate Alternaria solani infestation.',
    category: 'Disease',
    priority: 'High',
    isRead: false,
    timestamp: '45 mins ago',
    fieldId: 'fld-101',
  },
  {
    id: 'alt-03',
    title: 'Urea Fertilizer Low Stock',
    description: 'Inventory levels fell below safety threshold of 20 bags.',
    category: 'Inventory',
    priority: 'Medium',
    isRead: true,
    timestamp: '3 hours ago',
  },
  {
    id: 'alt-04',
    title: 'Soil Nitrogen Depletion Warning',
    description: 'Field B nitrogen level measured 35 mg/kg (below recommended 50 mg/kg).',
    category: 'Irrigation',
    priority: 'Medium',
    isRead: true,
    timestamp: 'Yesterday',
    fieldId: 'fld-102',
  },
  {
    id: 'alt-05',
    title: 'Wheat Harvest Window Open',
    description: 'Field D crop moisture optimal for grain harvesting.',
    category: 'Harvest',
    priority: 'Low',
    isRead: true,
    timestamp: '2 days ago',
    fieldId: 'fld-201',
  },
];

export const recommendationService = {
  getDecisionSupport: async (): Promise<DecisionSupportItem[]> => {
    try {
      const res = await api.get('/recommendations');
      return res.data;
    } catch {
      return MOCK_DECISION_SUPPORT;
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const res = await api.get('/alerts');
      return res.data;
    } catch {
      return MOCK_ALERTS;
    }
  },

  markAlertRead: async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/alerts/${id}/read`);
      return true;
    } catch {
      const target = MOCK_ALERTS.find((a) => a.id === id);
      if (target) target.isRead = true;
      return true;
    }
  },
};
