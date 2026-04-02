export interface Team {
  _id: string;
  name: string;
  createdBy: string;
  owner: {
    id: string;
    name: string;
    _id: string;
  };
  memberIds: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    avatar: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
} 