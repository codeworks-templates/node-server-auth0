export { };
declare global {
  namespace Express {
    export interface Request {
      userInfo?: User;
    }
  }
}

type User = {
  id: string;
  email: string;
  picture: string;
  subs: string[];
}