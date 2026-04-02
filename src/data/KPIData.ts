import type { Option, KpiDetails } from "@/types/kpi";

export const teamMembers: Option[] = [
  { id: "1", name: "email@gmail.com" },
  { id: "2", name: "Adarsh Jain" },
  { id: "3", name: "Varun Kumar" },
  { id: "4", name: "John Doe" },
  { id: "5", name: "Jane Smith" },
  { id: "6", name: "Bob Johnson" },
  { id: "7", name: "Alice Williams" },
  { id: "8", name: "Michael Brown" },
  { id: "9", name: "Sarah Davis" },
];

export const teams: Option[] = [
  { id: "1", name: "New Team" },
  { id: "2", name: "New Team 2" },
  { id: "3", name: "Engineering" },
  { id: "4", name: "Marketing" },
  { id: "5", name: "Sales" },
  { id: "6", name: "Product" },
  { id: "7", name: "Design" },
  { id: "8", name: "Customer Support" },
];

// Map teams to members for visualization
export const teamToMembers: Record<string, Option[]> = {
  "1": [teamMembers[0], teamMembers[1], teamMembers[2]],
  "2": [teamMembers[3], teamMembers[4]],
  "3": [teamMembers[5], teamMembers[6], teamMembers[7]],
  "4": [teamMembers[8], teamMembers[0]],
  "5": [teamMembers[1], teamMembers[2], teamMembers[3]],
  "6": [teamMembers[4], teamMembers[5]],
  "7": [teamMembers[6], teamMembers[7]],
  "8": [teamMembers[8], teamMembers[0], teamMembers[1]],
};

// Updated to only include number and percentage
export const measurementUnits = [
  { id: "number", name: "Number" },
  { id: "percentage", name: "Percentage" },
];

// Updated to only include quarters
export const quarters = [
  { id: "q1-2025", name: "Q1 2025" },
  { id: "q2-2025", name: "Q2 2025" },
  { id: "q3-2025", name: "Q3 2025" },
  { id: "q4-2025", name: "Q4 2025" },
  { id: "q1-2026", name: "Q1 2026" },
  { id: "q2-2026", name: "Q2 2026" },
];

// Updated to only include specified frequencies
export const frequencies = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "quarterly", name: "Quarterly" },
];

// Detailed company KPIs with all inheritable properties
export const companyKpiDetails: Record<string, KpiDetails> = {
  "company-kpi-1": {
    id: "company-kpi-1",
    name: "Revenue Growth",
    measurementUnit: "percentage",
    divisionType: "cumulative",
    quarter: "q2-2025",
    frequency: "monthly",
  },
  "company-kpi-2": {
    id: "company-kpi-2",
    name: "Customer Satisfaction",
    measurementUnit: "number",
    divisionType: "standalone",
    quarter: "q1-2025",
    frequency: "quarterly",
  },
  "company-kpi-3": {
    id: "company-kpi-3",
    name: "Market Expansion",
    measurementUnit: "number",
    divisionType: "cumulative",
    quarter: "q3-2025",
    frequency: "monthly",
  },
};

// Detailed team KPIs with all inheritable properties
export const teamKpiDetails: Record<string, KpiDetails> = {
  "team-kpi-1": {
    id: "team-kpi-1",
    name: "Sprint Velocity",
    measurementUnit: "number",
    divisionType: "cumulative",
    quarter: "q1-2025",
    frequency: "weekly",
  },
  "team-kpi-2": {
    id: "team-kpi-2",
    name: "Bug Resolution Time",
    measurementUnit: "number",
    divisionType: "standalone",
    quarter: "q2-2025",
    frequency: "weekly",
  },
  "team-kpi-3": {
    id: "team-kpi-3",
    name: "Feature Delivery",
    measurementUnit: "number",
    divisionType: "cumulative",
    quarter: "q1-2025",
    frequency: "monthly",
  },
};

export const companyKpis = Object.values(companyKpiDetails).map((kpi) => ({
  id: kpi.id,
  name: kpi.name,
}));
export const teamKpis = Object.values(teamKpiDetails).map((kpi) => ({
  id: kpi.id,
  name: kpi.name,
}));
