
import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface BriefFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  projectType: string;
  projectDescription: string;
  features: string[];
  budget: string;
  timeline: string;
  pages: string[];
  targetAudience: string;
  mainGoals: string;
  existingWebsite: string;
  competitorWebsites: string;
  designPreferences: string;
  additionalNotes: string;
}

const STORAGE_KEY = 'brief-form-autosave';
const AUTOSAVE_DELAY = 1000; // 1 segundo

export const useAutoSave = (formData: BriefFormData, userEmail?: string) => {
  const [savedData, setSavedData, saveToStorage, clearStorage] = useLocalStorage<{
    data: BriefFormData;
    timestamp: number;
    userEmail: string;
  } | null>(STORAGE_KEY, null, true); // autoSave habilitado
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  // Función para verificar si hay datos guardados
  const hasLocalData = () => {
    console.log('🔍 Verificando datos locales:', {
      savedData: !!savedData,
      userEmail,
      savedUserEmail: savedData?.userEmail,
      match: savedData?.userEmail === userEmail
    });
    
    // Verificar también directamente en localStorage
    try {
      const rawData = window.localStorage.getItem(STORAGE_KEY);
      console.log('🔍 Raw localStorage data:', rawData);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        console.log('🔍 Parsed localStorage data:', parsed);
      }
    } catch (error) {
      console.error('❌ Error checking localStorage directly:', error);
    }
    
    return savedData && savedData.userEmail === userEmail && savedData.data;
  };

  // Función para obtener datos guardados
  const getLocalData = (): BriefFormData | null => {
    console.log('📥 Obteniendo datos locales...');
    if (hasLocalData()) {
      console.log('✅ Datos locales encontrados:', savedData!.data);
      return savedData!.data;
    }
    console.log('❌ No hay datos locales válidos');
    return null;
  };

  // Función para determinar si los datos locales son más recientes
  const isLocalDataNewer = (existingBriefTimestamp?: string): boolean => {
    if (!hasLocalData()) {
      console.log('❌ No hay datos locales para comparar');
      return false;
    }
    
    if (!existingBriefTimestamp) {
      console.log('✅ No hay brief existente, datos locales son más nuevos');
      return true;
    }
    
    const localTimestamp = savedData!.timestamp;
    const briefTimestamp = new Date(existingBriefTimestamp).getTime();
    
    const isNewer = localTimestamp > briefTimestamp;
    console.log('📅 Comparando timestamps:', {
      local: new Date(localTimestamp).toLocaleString(),
      brief: new Date(briefTimestamp).toLocaleString(),
      localIsNewer: isNewer
    });
    
    return isNewer;
  };

  // Auto-guardar con debounce
  useEffect(() => {
    if (!userEmail) {
      console.log('⚠️ No hay email de usuario, no se puede autoguardar');
      return;
    }

    // Verificar si hay algo que guardar (al menos un campo con contenido)
    const hasContent = Object.values(formData).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });

    if (!hasContent) {
      console.log('⚠️ No hay contenido para guardar');
      return;
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(() => {
      const now = Date.now();
      
      // Solo guardar si han pasado al menos 500ms desde el último guardado
      if (now - lastSaveRef.current > 500) {
        console.log('💾 Auto-guardando formulario para usuario:', userEmail);
        const dataToSave = {
          data: formData,
          timestamp: now,
          userEmail: userEmail
        };
        console.log('📊 Datos a guardar:', dataToSave);
        
        // Guardar usando setSavedData (que automáticamente persistirá en localStorage)
        setSavedData(dataToSave);
        lastSaveRef.current = now;
        
        console.log('✅ Formulario auto-guardado exitosamente');
        
        // Verificación adicional que los datos se guardaron
        setTimeout(() => {
          try {
            const verification = window.localStorage.getItem(STORAGE_KEY);
            console.log('🔍 Verificación post-guardado localStorage:', verification);
          } catch (error) {
            console.error('❌ Error verificando localStorage:', error);
          }
        }, 100);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, userEmail, setSavedData]);

  // Limpiar datos cuando se envíe exitosamente
  const clearAutoSave = () => {
    console.log('🧹 Limpiando auto-guardado...');
    clearStorage();
    console.log('✅ Auto-guardado limpiado');
  };

  return {
    hasLocalData: hasLocalData(),
    getLocalData,
    isLocalDataNewer,
    clearAutoSave,
    lastSaved: savedData?.timestamp
  };
};
