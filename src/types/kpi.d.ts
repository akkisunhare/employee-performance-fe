export type KpiType = "individual" | "team" | "company";
export type DivisionType = "standalone" | "cumulative";
export type MeasurementUnit = "number" | "percentage";
export type Frequency = "daily" | "weekly" | "monthly" | "quarterly";

export interface Option {
  id: string;
  name: string;
}

export interface KpiDetails {
  id: string;
  name: string;
  measurementUnit: MeasurementUnit;
  divisionType: DivisionType;
  quarter: string;
  frequency: Frequency;
}
export interface Interval {
  label: string;
  startDate: string;
  endDate: string;
}

interface BaseKpiFormData {
  id?: string;
  name: string;
  description?: string;
  ownerId: Option;
  measurementUnit: MeasurementUnit;
  targetValue: Number;
  currentValue?: string;
  divisionType: DivisionType;
  quarter?: string;
  frequency?: Frequency;
  parentKpiId?: string;
  inheritedFields?: {
    measurementUnit?: boolean;
    divisionType?: boolean;
    quarter?: boolean;
    frequency?: boolean;
  };

  breakdown?: Record<string, string>;
}

// Individual KPI specific properties
interface IndividualKpiFormData extends BaseKpiFormData {
  kpiType: "individual";
  // Individual KPIs can be linked to team KPIs
}

// Team KPI specific properties
export interface TeamKpiFormData extends BaseKpiFormData {
  kpiType: "team";
  teamId: string;
  assigneeIds: Option[];
  // Team KPI breakdown maps member IDs to KPI names
  breakdown: Record<string, string>;
}

// Company KPI specific properties
export interface CompanyKpiFormData extends BaseKpiFormData {
  kpiType: "company";
  teamIds: Option[];
  // Company KPI breakdown maps team IDs to KPI names
  breakdown: Record<string, string>;
}

// Discriminated union type
export type KpiFormData =
  | IndividualKpiFormData
  | TeamKpiFormData
  | CompanyKpiFormData;

export interface WeeklyData {
  [week: string]: string;
}

export interface BreakdownItem {
  id: string;
  name: string;
  kpiName?: string;
  contribution: string;
  intervalBreakDown:any[]
  actualValue?: number;
  weeks?: WeeklyData;
  reduce(arg0: (sum: any, item: any) => any, arg1: number): unknown;
}

// Define the interface for the breakdown data
export interface IntervalBreakdown {
  intervalIndex: number;
  intervalName: string;
  startDate: Date;
  endDate: Date;
  intervalContribution: number;
  intervalTarget: number;
}

export interface BreakdownData {
  id: string;
  name: string;
  kpiName: string;
  contribution: string;
  frequency: string;
  intervalBreakDown: IntervalBreakdown[];
  kpiId?: string;
}
export interface Quarter {
  _id: string;
  year: string;
  quarter: string;
  start_date: string;
  end_date: string;
}
export type Frequency = "weekly" | "monthly" | "quarterly";

export type KPIConfig = {
  kpiType: 'individual' | 'team' | 'company';
  targetValue: number;
  divisionType: 'standalone' | 'cumulative';
  frequency: Frequency;
  quarter: string;
  quarterEndDate:string;
  quarterStartDate:string;
};

export type BreakdownDataProp = {
  items: BreakdownItem[]; // replace `any` with your breakdown item type
  // exitParentBreakdown: IntervalBreakdown[]; // replace with actual type
};

export interface QuarterResponse {
  startDate: string; // ISO date string
  endDate: string;
  label: string; // e.g., "Q1 2025"
}

export type BreakdownHandlers = {
  onKpiNameChange: (id: string, value: string) => void;
  onBreakdownValueChange: (itemId: string, intervalIndex: number, value: string) => void;
  onValidationChange: (isValid: boolean) => void;
};

export type BreakdownSetters = {
  // setParentBreakdown: (value: any) => void;
  setNewBreakdown: (value: any) => void;
  setRemainingContribution: (value: number) => void;
};

export type BreakdownFlags = {
  isEditMode: boolean;
  isSubmit: boolean;
  isLinked:boolean
};