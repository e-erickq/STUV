import { PerfilUsuario } from '@stuv/shared';
import { api } from './client';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm: string;
}

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

export interface UpdateUsuarioData {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: PerfilUsuario;
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios');
  return data;
}

export async function createUsuario(body: CreateUsuarioData): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios', body);
  return data;
}

export async function updateUsuario(id: string, body: UpdateUsuarioData): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}`, body);
  return data;
}
