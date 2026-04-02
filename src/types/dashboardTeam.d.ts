export interface GetTeamsResponse {
  teams: {
    _id: string;
    name: string;
    createdBy: {
      _id: string;
      name: string;
    };
    owner: {
      id: string;
      name: string;
      _id: string;
    };
    memberIds: {
      _id: string;
      name: string;
    }[];
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
  totals: {
    quarterlyGoal: number;
    qtdGoal: number;
    qtdAchieved: number;
    weeklyGoal: number;
    goalAchieved: number;
    currentWeekAchieved: number;
  };
  length: number;
  breakdownTotals: {
    intervalIndex: number;
    intervalName: string;
    intervalContribution: number;
    intervalTarget: number;
  }[];
  meter: {
    qtdAchieved: number;
    quarterlyGoal: number;
    weeklyGoal: number;
    goalAchieved: number;
  };
}



