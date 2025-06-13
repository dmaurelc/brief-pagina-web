
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar, DollarSign, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const MiCuenta = () => {
  const { user, isLoaded } = useAuth();

  // Obtener briefs del usuario
  const { data: briefs, isLoading } = useQuery({
    queryKey: ['userBriefs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isLoaded,
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-700">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-foreground">Mi Cuenta</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Información de la cuenta</span>
            </CardTitle>
            <CardDescription>
              Gestiona tus solicitudes de presupuesto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.emailAddresses?.[0]?.emailAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de solicitudes</p>
                <p className="font-medium">{briefs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Briefs List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes de Presupuesto</CardTitle>
            <CardDescription>
              Revisa el estado y detalles de tus solicitudes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!briefs || briefs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No tienes solicitudes aún
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera solicitud de presupuesto
                </p>
                <Link to="/">
                  <Button>Crear Solicitud</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {briefs.map((brief) => (
                  <div key={brief.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">{brief.company_name}</h3>
                          <Badge className={statusColors[brief.status as keyof typeof statusColors]}>
                            {statusLabels[brief.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{brief.project_description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(brief.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{brief.timeline}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{brief.budget}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                    {brief.admin_notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium text-foreground mb-1">Notas del administrador:</p>
                        <p className="text-sm text-muted-foreground">{brief.admin_notes}</p>
                      </div>
                    )}
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

export default MiCuenta;
