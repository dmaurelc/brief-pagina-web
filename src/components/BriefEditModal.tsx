
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit, 
  Save, 
  Upload, 
  FileText, 
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  Globe,
  Target,
  DollarSign,
  Clock,
  MessageCircle,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Tables } from '@/integrations/supabase/types';
import ProposalUploadModal from './ProposalUploadModal';

type Brief = Tables<'briefs'>;
type BriefStatus = 'pending' | 'in_review' | 'quote_sent' | 'completed' | 'cancelled';

interface BriefEditModalProps {
  brief: Brief;
  isOpen: boolean;
  onClose: () => void;
  onBriefUpdated: () => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500', description: 'Esperando revisión inicial' },
  in_review: { label: 'En Proceso', color: 'bg-blue-500', description: 'Siendo revisado por el equipo' },
  quote_sent: { label: 'Propuesta Enviada', color: 'bg-green-500', description: 'Propuesta enviada al cliente' },
  completed: { label: 'Completado', color: 'bg-purple-500', description: 'Proyecto finalizado' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', description: 'Proyecto cancelado' },
} as const;

const BriefEditModal = ({ brief, isOpen, onClose, onBriefUpdated }: BriefEditModalProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    status: brief.status || 'pending',
    admin_notes: brief.admin_notes || '',
    company_name: brief.company_name,
    contact_name: brief.contact_name,
    email: brief.email,
    phone: brief.phone || '',
    industry: brief.industry,
    project_type: brief.project_type,
    project_description: brief.project_description,
    budget: brief.budget,
    timeline: brief.timeline,
    target_audience: brief.target_audience,
    main_goals: brief.main_goals,
    existing_website: brief.existing_website || '',
    competitor_websites: brief.competitor_websites || '',
    design_preferences: brief.design_preferences || '',
    additional_notes: brief.additional_notes || '',
    features: brief.features || [],
    pages: brief.pages || []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateBrief = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: 'Error de autenticación',
        description: 'Debes estar autenticado para actualizar el brief',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('briefs')
        .update({
          status: formData.status as any,
          admin_notes: formData.admin_notes,
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone,
          industry: formData.industry,
          project_type: formData.project_type,
          project_description: formData.project_description,
          budget: formData.budget,
          timeline: formData.timeline,
          target_audience: formData.target_audience,
          main_goals: formData.main_goals,
          existing_website: formData.existing_website,
          competitor_websites: formData.competitor_websites,
          design_preferences: formData.design_preferences,
          additional_notes: formData.additional_notes,
          features: formData.features,
          pages: formData.pages,
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', brief.id);

      if (error) throw error;

      toast({
        title: 'Brief actualizado',
        description: 'Los cambios se han guardado exitosamente',
      });

      onBriefUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error actualizando brief:', error);
      toast({
        title: 'Error al actualizar',
        description: error.message || 'Hubo un problema al actualizar el brief',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Presupuesto - {brief.company_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="project">Proyecto</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="proposal">Propuesta</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Empresa</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_name">Contacto</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => handleInputChange('contact_name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industria</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Detalles del Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="project_type">Tipo de Proyecto</Label>
                    <Input
                      id="project_type"
                      value={formData.project_type}
                      onChange={(e) => handleInputChange('project_type', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project_description">Descripción</Label>
                    <Textarea
                      id="project_description"
                      value={formData.project_description}
                      onChange={(e) => handleInputChange('project_description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Presupuesto</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeline">Cronograma</Label>
                      <Input
                        id="timeline"
                        value={formData.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="target_audience">Audiencia Objetivo</Label>
                    <Textarea
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange('target_audience', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="main_goals">Objetivos Principales</Label>
                    <Textarea
                      id="main_goals"
                      value={formData.main_goals}
                      onChange={(e) => handleInputChange('main_goals', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Administración
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Estado del Presupuesto</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${config.color}`} />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {STATUS_CONFIG[formData.status as keyof typeof STATUS_CONFIG]?.description}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="admin_notes">Notas Internas del Administrador</Label>
                    <Textarea
                      id="admin_notes"
                      value={formData.admin_notes}
                      onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                      placeholder="Notas privadas para el equipo de administradores..."
                      rows={6}
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Información del Sistema</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Creado:</span>
                        <p className="text-muted-foreground">{formatDate(brief.created_at)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Última actualización:</span>
                        <p className="text-muted-foreground">{formatDate(brief.updated_at)}</p>
                      </div>
                      {brief.status_updated_at && (
                        <div className="col-span-2">
                          <span className="font-medium">Estado actualizado:</span>
                          <p className="text-muted-foreground">{formatDate(brief.status_updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Gestión de Propuestas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Enviar Propuesta al Cliente</h3>
                    <p className="text-muted-foreground mb-6">
                      Sube un archivo PDF con la propuesta comercial y notifica automáticamente al cliente.
                    </p>
                    <Button 
                      onClick={() => setIsProposalModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Subir y Enviar Propuesta
                    </Button>
                  </div>

                  {brief.proposal_id && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Send className="w-4 h-4" />
                        <span className="font-medium">Propuesta enviada</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Ya se ha enviado una propuesta para este presupuesto.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`${STATUS_CONFIG[formData.status as keyof typeof STATUS_CONFIG]?.color} text-white`}
              >
                {STATUS_CONFIG[formData.status as keyof typeof STATUS_CONFIG]?.label}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateBrief} disabled={isUpdating}>
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProposalUploadModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        briefId={brief.id}
        companyName={brief.company_name}
        clientEmail={brief.email}
        onProposalUploaded={() => {
          setIsProposalModalOpen(false);
          onBriefUpdated();
        }}
      />
    </>
  );
};

export default BriefEditModal;
