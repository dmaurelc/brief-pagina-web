
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowLeft, Shield, AlertCircle, FileText, Clock, CheckCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import BriefDetailModal from '@/components/BriefDetailModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Brief = Tables<'briefs'>;

const AdminDashboard = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setIsAdmin(false);
        setAdminCheckLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role_by_email', {
          _email: user.emailAddresses[0].emailAddress,
          _role: 'admin'
        });

        if (error) {
          console.error('Error verificando rol de admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data);
        }
      } catch (error) {
        console.error('Error verificando rol de admin:', error);
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    if (isLoaded && user) {
      checkAdminRole();
    } else if (isLoaded && !user) {
      setIsAdmin(false);
      setAdminCheckLoading(false);
    }
  }, [user, isLoaded]);

  // Fetch all briefs
  const { data: briefs, isLoading, error } = useQuery({
    queryKey: ['admin-briefs'],
    queryFn: async () => {
      console.log('Fetching briefs...');
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching briefs:', error);
        throw error;
      }
      
      console.log('Briefs fetched:', data?.length);
      return data;
    },
    enabled: isAdmin === true,
  });

  const handleViewDetail = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Categorizar briefs por estado
  const categorizedBriefs = briefs ? {
    pending: briefs.filter(b => !b.status || b.status === 'pending'),
    in_review: briefs.filter(b => b.status === 'in_review'),
    quote_sent: briefs.filter(b => b.status === 'quote_sent'),
    completed: briefs.filter(b => b.status === 'completed')
  } : null;

  // Configuración de las columnas del dashboard
  const columns = [
    {
      id: 'pending',
      title: 'Pendientes',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-yellow-100 border-yellow-200',
      headerColor: 'bg-yellow-500',
      count: categorizedBriefs?.pending.length || 0
    },
    {
      id: 'in_review',
      title: 'En Proceso',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-100 border-blue-200',
      headerColor: 'bg-blue-500',
      count: categorizedBriefs?.in_review.length || 0
    },
    {
      id: 'quote_sent',
      title: 'Propuestas Enviadas',
      icon: <Send className="w-5 h-5" />,
      color: 'bg-green-100 border-green-200',
      headerColor: 'bg-green-500',
      count: categorizedBriefs?.quote_sent.length || 0
    },
    {
      id: 'completed',
      title: 'Completados',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-gray-100 border-gray-200',
      headerColor: 'bg-gray-500',
      count: categorizedBriefs?.completed.length || 0
    }
  ];

  // Mostrar loading mientras se verifica autenticación y roles
  if (!isLoaded || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-4">Debes iniciar sesión para acceder al panel de administración.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error si no es administrador
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-4">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent-700 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Error al cargar los presupuestos</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
              <p className="text-muted-foreground mt-2">
                Gestión de presupuestos y propuestas
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Admin: {user.emailAddresses?.[0]?.emailAddress}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/my-account')} variant="outline">
                Mi Cuenta
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Inicio
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {columns.map((column) => (
            <Card key={column.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{column.title}</p>
                    <p className="text-2xl font-bold">{column.count}</p>
                  </div>
                  <div className={`p-2 rounded-md ${column.color}`}>
                    {column.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {briefs && briefs.length > 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dashboard funcionando correctamente. Total: {briefs.length} presupuesto(s) en el sistema.
            </AlertDescription>
          </Alert>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className={`${column.color} min-h-[600px]`}>
              <CardHeader className={`${column.headerColor} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center gap-2 text-white">
                  {column.icon}
                  {column.title}
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {column.count}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {categorizedBriefs && categorizedBriefs[column.id as keyof typeof categorizedBriefs].map((brief) => (
                  <Card key={brief.id} className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">{brief.company_name}</h3>
                        <p className="text-xs text-muted-foreground">{brief.contact_name}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(brief.created_at)}
                          </span>
                          <Button 
                            onClick={() => handleViewDetail(brief)}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Tipo:</span> {brief.project_type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Presupuesto:</span> {brief.budget}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {categorizedBriefs && categorizedBriefs[column.id as keyof typeof categorizedBriefs].length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No hay elementos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedBrief && (
          <BriefDetailModal
            brief={selectedBrief}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedBrief(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
