
// Mapeo de valores a etiquetas legibles para mostrar en la UI

export const getBudgetLabel = (value: string): string => {
  const budgetMap: { [key: string]: string } = {
    'menos-50000': 'Menos de €50.000',
    '50000-150000': '€50.000 - €150.000',
    '150000-300000': '€150.000 - €300.000',
    '300000-500000': '€300.000 - €500.000',
    'mas-500000': 'Más de €500.000',
    'otro': 'Otro presupuesto'
  };
  return budgetMap[value] || value;
};

export const getTimelineLabel = (value: string): string => {
  const timelineMap: { [key: string]: string } = {
    '1-mes': '1 mes',
    '2-3-meses': '2-3 meses',
    '4-6-meses': '4-6 meses',
    'mas-6-meses': 'Más de 6 meses',
    'flexible': 'Flexible'
  };
  return timelineMap[value] || value;
};

export const getProjectTypeLabel = (value: string): string => {
  const projectTypeMap: { [key: string]: string } = {
    'nuevo': 'Sitio web nuevo',
    'rediseno': 'Rediseño completo',
    'mejoras': 'Mejoras y actualizaciones',
    'ecommerce': 'Tienda online',
    'landing': 'Landing page',
    'corporativo': 'Sitio corporativo',
    'blog': 'Blog o magazine',
    'otro': 'Otro tipo de proyecto'
  };
  return projectTypeMap[value] || value;
};

export const getIndustryLabel = (value: string): string => {
  const industryMap: { [key: string]: string } = {
    'tecnologia': 'Tecnología',
    'salud': 'Salud y bienestar',
    'educacion': 'Educación',
    'comercio': 'Comercio y retail',
    'servicios': 'Servicios profesionales',
    'inmobiliaria': 'Inmobiliaria',
    'gastronomia': 'Gastronomía',
    'turismo': 'Turismo y hospitalidad',
    'arte': 'Arte y cultura',
    'deportes': 'Deportes y fitness',
    'finanzas': 'Finanzas y seguros',
    'otro': 'Otra industria'
  };
  return industryMap[value] || value;
};
