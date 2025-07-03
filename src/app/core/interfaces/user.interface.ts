
export interface User {
  user_id: number;
  username: string;
  branch: number[];
  business: number | null;
  business_admin: boolean | null;
  business_name: string | null;
  email: string;
  exp: number;
  iat: number;
  image: string | null;
  is_superuser: boolean;
  jti: string;
  permissions: number[];
  roles: number[];
  token_type: string;
}