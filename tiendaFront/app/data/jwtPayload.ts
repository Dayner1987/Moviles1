//app/data/jwtPayload.ts
export interface JwtPayload {
  id: number;
  role: string;
  name: string;
  email?: string;
}
