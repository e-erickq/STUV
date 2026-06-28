import { zodResolver } from '@hookform/resolvers/zod';
import { PerfilUsuario } from '@stuv/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../contexts/AuthContext';
import {
  type CreateUsuarioData,
  type UpdateUsuarioData,
  type Usuario,
  createUsuario,
  fetchUsuarios,
  updateUsuario,
} from '../../lib/api/usuarios';

// --- Helpers ---
const perfilLabel: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  GERENTE: 'Gerente',
  TESTADOR: 'Testador',
};

const perfilBadgeVariant: Record<PerfilUsuario, 'admin' | 'gerente' | 'testador'> = {
  ADMINISTRADOR: 'admin',
  GERENTE: 'gerente',
  TESTADOR: 'testador',
};

// --- Schemas ---
const createSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  perfil: z.nativeEnum(PerfilUsuario),
});

const updateSchema = z.object({
  nome: z.string().min(2).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  senha: z.string().min(6).optional().or(z.literal('')),
  perfil: z.nativeEnum(PerfilUsuario).optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

// --- Formulário unificado ---
interface UsuarioFormProps {
  modo: 'criar' | 'editar';
  usuario?: Usuario;
  onSuccess: () => void;
}

function UsuarioForm({ modo, usuario, onSuccess }: UsuarioFormProps) {
  const queryClient = useQueryClient();
  const isEditing = modo === 'editar';
  const schema = isEditing ? updateSchema : createSchema;

  const form = useForm<CreateForm | UpdateForm>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? { nome: usuario?.nome, email: usuario?.email, perfil: usuario?.perfil, senha: '' }
      : { nome: '', email: '', senha: '', perfil: PerfilUsuario.TESTADOR },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateUsuarioData | UpdateUsuarioData) =>
      isEditing ? updateUsuario(usuario!.id, data as UpdateUsuarioData) : createUsuario(data as CreateUsuarioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onSuccess();
    },
  });

  const onSubmit = (data: CreateForm | UpdateForm) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    );
    mutation.mutate(cleaned as CreateUsuarioData | UpdateUsuarioData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome</Label>
        <Input placeholder="Nome completo" {...form.register('nome')} />
        {form.formState.errors.nome && (
          <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="email@stuv.com" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{isEditing ? 'Nova Senha (opcional)' : 'Senha'}</Label>
        <Input type="password" placeholder={isEditing ? 'Deixe em branco para manter' : '••••••••'} {...form.register('senha')} />
        {form.formState.errors.senha && (
          <p className="text-xs text-destructive">{form.formState.errors.senha.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Perfil</Label>
        <Select
          defaultValue={form.getValues('perfil')}
          onValueChange={(v) => form.setValue('perfil', v as PerfilUsuario)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PerfilUsuario.ADMINISTRADOR}>Administrador</SelectItem>
            <SelectItem value={PerfilUsuario.GERENTE}>Gerente</SelectItem>
            <SelectItem value={PerfilUsuario.TESTADOR}>Testador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar.'}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  );
}

// --- Página principal ---
export default function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === PerfilUsuario.ADMINISTRADOR;
  const [criarOpen, setCriarOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os usuários do sistema e seus perfis de acesso.
          </p>
        </div>

        {isAdmin && (
          <Dialog open={criarOpen} onOpenChange={setCriarOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Novo usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar usuário</DialogTitle>
              </DialogHeader>
              <UsuarioForm modo="criar" onSuccess={() => setCriarOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-destructive">
            Erro ao carregar usuários.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Criado em</TableHead>
                {isAdmin && <TableHead className="w-16 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge dot variant={perfilBadgeVariant[u.perfil]}>
                        {perfilLabel[u.perfil]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditando(u)}
                          title="Editar usuário"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          {editando && (
            <UsuarioForm modo="editar" usuario={editando} onSuccess={() => setEditando(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
