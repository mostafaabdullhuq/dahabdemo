export interface IJwtDecode {
    user_id: number;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    is_superuser: boolean;
    exp: number;
    // optional fields
    image?: string;
    business?: number;
    business_admin?: boolean;
    business_name?: string;
  }

