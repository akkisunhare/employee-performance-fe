// export interface Priority {
//   _id: string;
//   name: string;
//   owner: string;
//   team: string;
//   quarter: string;
//   startWeek: WeekInterval;
//   endWeek: WeekInterval;
//   createdBy: string;
//   description: string;

//   type: 'individual' | 'team' | 'company';
//   status: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable';
//   createdAt?: Date;
//   updatedAt?: Date;
//   weeklyStatus?: Array<{
//     _id?: string;
//     updateStartWeek: string;
//     updateEndWeek: string;
//     updateStatus: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable';
//     updateDescription?: string;
//   }>;
//   weekStatusdata?: Array<{
//     week: string;
//     status: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable' | 'Not able to store';
//     description?: string;
//   }>;
//   quarterStartDate: string| null,
//   quarterEndDate:string| null,
// }

export type PriorityStatus = 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable';

export interface Priority {
  _id?: string;
  name: string;
  owner: string | { _id: string; name: string }; // Can be ObjectId string or populated object
  team?: string | { _id: string; name: string }; // Optional, can be ObjectId string or populated object
  quarter: string;
  startWeek: {
    intervalIndex: number;
    intervalName: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  endWeek: {
    intervalIndex: number;
    intervalName: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  createdBy?: string | Types.ObjectId;
  description: string;
  organizationId?: string;
  type: 'individual' | 'team' | 'company';
  status: PriorityStatus
  createdAt?: Date;
  updatedAt?: Date;
  weeklyStatus?: Array<{
    _id?: string | Types.ObjectId;
    updateStartWeek: string;
    updateEndWeek: string;
    updateStatus: PriorityStatus
    updateDescription?: string;
    lastUpdatedBy?: string | Types.ObjectId;
    lastUpdatedAt?: Date;
  }>;
  weekStatusdata?: WeekStatusData[];
  quarterStartDate: Date | string;
  quarterEndDate: Date | string;
  priorityCreateRole?: string;
  ownerRole?: string;
  isDeleted?: boolean;
  deletedBy?: string | Types.ObjectId;
  deletedAt?: Date;
  __v?: number;
}
export interface WeekStatusUpdate {
  intervalIndex: number;  // The week number (e.g., 11 for Week 11)
  status: 'Not yet started' | 'On track' | 'Behind schedule' | 'Complete' | 'Not applicable' | 'Not able to store';
  description?: string;   // Optional description update
}
export interface WeekStatusData {
  intervalIndex: number;
  intervalName: string;
  startDate: Date;
  endDate: Date;
  status: PriorityStatus | 'Not able to store';
  description?: string;
  lastUpdatedBy?: Types.ObjectId;
  lastUpdatedAt?: Date;
}

export interface WeekInterval {
  intervalIndex: number;
  intervalName: string;
  startDate: Date | string;
  endDate: Date | string;
}

export interface CreatePriorityDto {
  name: string;
  owner: string;
  team: string;
  quarter: string;
  startWeek: WeekInterval;
  endWeek: WeekInterval;
  description: string;
   quarterStartDate?: string;
  quarterEndDate?: string;
  
  
  type: 'individual' | 'team' | 'company';
  status: PriorityStatus
  weekStatusdata?: Array<{
    week: string;
    status: PriorityStatus
    description?: string;
  }>;
  weeklyStatus?: Array<{
    _id?: string;
    updateStartWeek: string;
    updateEndWeek: string;
    updateStatus: PriorityStatus
    updateDescription?: string;
  }>;
}
