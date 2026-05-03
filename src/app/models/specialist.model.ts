export interface Specialist {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  bio?: string;
  email: string;
  createdAt: string;
  area: {
    id: number;
    name: string;
  };
}