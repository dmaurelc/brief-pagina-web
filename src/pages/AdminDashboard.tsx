
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Users, Clock, DollarSign, Download, Edit, Save, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

const statusLabels = {
  pending: 'Pendiente',
  in_review: 'En Revisión',
  quote_sent: 'Presupuesto Enviado',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  quote_sent: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const AdminDashboard = () => {
  const { isAdmin, isLoaded, isLoadingRole } = useAuth();
  const queryClient = useQueryClient();
  const [editingBrief, setEditingBrief] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', admin_notes: '' });

  // Obtener todos los briefs
  const { data: briefs, isLoading } = useQuery({
    queryKey: ['allBriefs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isLoaded && !isLoadingRole && isAdmin,
  });

  // Mutación para actualizar brief
  const updateBrief = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes: string }) => {
      const { error } = await supabase
        .from('briefs')
        .update({ 
          status, 
          admin_notes,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBriefs'] });
      setEditingBrief(null);
      toast.success('Brief actualizado correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar el brief');
      console.error(error);
    },
  });

  const handleEdit = (brief: any) => {
    setEditingBrief(brief.id);
    setEditForm({
      status: brief.status,
      admin_notes: brief.admin_notes || ''
    });
  };

  const handleSave = () => {
    if (editingBrief) {
      updateBrief.mutate({
        id: editingBrief,
        status: editForm.status,
        admin_notes: editForm.admin_notes
      });
    }
  };

  const handleCancel = () => {
    setEditingBrief(null);
    setEditForm({ status: '', admin_notes: '' });
  };

  // Redirigir si no es admin
  if (isLoaded && !isLoadingRole && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!isLoaded || isLoadingRole || isLoading) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const pendingCount = briefs?.filter(b => b.status === 'pending').length || 0;
  const inReviewCount = briefs?.filter(b => b.status === 'in_review').length || 0;
  const completedCount = briefs?.filter(b => b.status === 'completed').length || 0;

  return (
    <div className="min-h-screen bg-accent-700">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-foreground">Panel de Administración</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{briefs?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inReviewCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Briefs List */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Solicitudes</CardTitle>
            <CardDescription>
              Gestiona y revisa todas las solicitudes de presupuesto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!briefs || briefs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay solicitudes aún
                </h3>
                <p className="text-muted-foreground">
                  Las solicitudes aparecerán aquí cuando los usuarios las envíen
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {briefs.map((brief) => (
                  <div key={brief.id} className="border rounded-lg p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{brief.company_name}</h3>
                          <Badge className={statusColors[brief.status as keyof typeof statusColors]}>
                            {statusLabels[brief.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Contacto:</span> {brief.contact_name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {brief.email}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span> {brief.phone || 'No especificado'}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {editingBrief === brief.id ? (
                          <>
                            <Button size="sm" onClick={handleSave} disabled={updateBrief.isPending}>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(brief)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Proyecto:</span> {brief.project_description}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tipo:</span> {brief.project_type}
                        </div>
                        <div>
                          <span className="font-medium">Presupuesto:</span> {brief.budget}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> {brief.timeline}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Objetivos:</span> {brief.main_goals}
                      </div>
                      {brief.features && brief.features.length > 0 && (
                        <div>
                          <span className="font-medium">Funcionalidades:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {brief.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Controls */}
                    {editingBrief === brief.id ? (
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="text-sm font-medium">Estado:</label>
                          <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in_review">En Revisión</SelectItem>
                              <SelectItem value="quote_sent">Presupuesto Enviado</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Notas del administrador:</label>
                          <Textarea
                            value={editForm.admin_notes}
                            onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                            placeholder="Añade notas sobre el estado o seguimiento..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : brief.admin_notes && (
                      <div className="border-t pt-4">
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-sm font-medium text-foreground mb-1">Notas del administrador:</p>
                          <p className="text-sm text-muted-foreground">{brief.admin_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>Creado: {format(new Date(brief.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      {brief.status_updated_at && (
                        <span>Actualizado: {format(new Date(brief.status_updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
