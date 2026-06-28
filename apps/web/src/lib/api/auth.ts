import { PerfilUsuario } from '@stuv/shared';
import { api } from './client';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
}

export async function loginRequest(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, senha });
  return data;
}
