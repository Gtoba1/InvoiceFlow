import { Service } from '@/types';
import { generateId } from './utils';

export const DEFAULT_SERVICES: Service[] = [
  {
    id: generateId(),
    name: 'Data Analysis',
    description: 'Comprehensive data analysis including data cleaning, exploration, and statistical insights.',
    rate: 75000,
    terms: 'All data provided by the client will be kept strictly confidential. Raw data will be returned or deleted upon project completion. Deliverables include a written report and/or presentation of findings.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Data Visualization',
    description: 'Interactive charts, dashboards, and visual representations of complex data.',
    rate: 60000,
    terms: 'Visualizations are delivered in the agreed format (PNG, PDF, interactive HTML). Client retains full ownership of all delivered visualizations upon full payment.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Power BI Dashboard',
    description: 'Professional Power BI dashboard development with interactive reports and KPI tracking.',
    rate: 150000,
    terms: 'Includes up to 2 rounds of revisions. Client must provide access to the required data sources. Ongoing maintenance or additional pages are billed separately. Full ownership of the .pbix file is transferred upon full payment.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'SQL Development',
    description: 'Database design, query optimization, stored procedures, and data pipeline development.',
    rate: 80000,
    terms: 'All database scripts and documentation are delivered upon completion. Client is responsible for testing in their production environment. Bug fixes within 7 days of delivery are included at no extra charge.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Excel Automation',
    description: 'Advanced Excel solutions including macros, VBA automation, and complex formulas.',
    rate: 50000,
    terms: 'Delivered as an unlocked Excel file. Includes a user guide for the automated features. Client is responsible for ensuring compatibility with their version of Microsoft Excel.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Tutoring / Training',
    description: 'One-on-one or group training sessions on data tools, Excel, SQL, or Power BI.',
    rate: 25000,
    terms: 'Sessions are scheduled by mutual agreement. A minimum of 24 hours notice is required for cancellations. Missed sessions without notice will be charged in full. Session recordings may be shared with the client upon request.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'PowerPoint Design',
    description: 'Professional presentation design with custom graphics, animations, and branded templates.',
    rate: 45000,
    terms: 'Includes up to 2 rounds of revisions. Client must provide brand assets (logos, colours, fonts) before work begins. Final files are delivered in .pptx format. Rush delivery (under 48 hours) attracts a 30% surcharge.',
    createdAt: new Date().toISOString(),
  },
];
