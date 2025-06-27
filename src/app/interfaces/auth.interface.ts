export interface LoginRequest {
  user: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    user: string;
    rol: string;
    verify: boolean;
  };
}

export interface RegisterUserRequest {
  people: {
    name: string;
    lastname: string;
    phone?: string;
    birthdate?: string;
    email?: string;
    typeDni: {
      id: number;
    };
    dni: string;
  };
  user?: string;
  password?: string;
  rol?: {
    id: number;
  };
  verify?: boolean;
}

export interface UpdateUserRequest {
  people?: {
    name?: string;
    lastname?: string;
    phone?: string;
    birthdate?: string;
    email?: string;
    typeDni?: {
      id: number;
    };
    dni?: string;
  };
  user?: string;
  password?: string;
  rol?: {
    id: number;
  };
  verify?: boolean;
} 