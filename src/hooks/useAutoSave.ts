
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
  } | null>(STORAGE_KEY, null);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  // Función para verificar si hay datos guardados
  const hasLocalData = () => {
    return savedData && savedData.userEmail === userEmail && savedData.data;
  };

  // Función para obtener datos guardados
  const getLocalData = (): BriefFormData | null => {
    if (hasLocalData()) {
      return savedData!.data;
    }
    return null;
  };

  // Función para determinar si los datos locales son más recientes
  const isLocalDataNewer = (existingBriefTimestamp?: string): boolean => {
    if (!hasLocalData()) return false;
    
    if (!existingBriefTimestamp) return true;
    
    const localTimestamp = savedData!.timestamp;
    const briefTimestamp = new Date(existingBriefTimestamp).getTime();
    
    return localTimestamp > briefTimestamp;
  };

  // Auto-guardar con debounce
  useEffect(() => {
    if (!userEmail) return;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(() => {
      const now = Date.now();
      
      // Solo guardar si han pasado al menos 500ms desde el último guardado
      if (now - lastSaveRef.current > 500) {
        console.log('Auto-guardando formulario...');
        setSavedData({
          data: formData,
          timestamp: now,
          userEmail: userEmail
        });
        lastSaveRef.current = now;
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
    console.log('Limpiando auto-guardado...');
    clearStorage();
  };

  return {
    hasLocalData: hasLocalData(),
    getLocalData,
    isLocalDataNewer,
    clearAutoSave,
    lastSaved: savedData?.timestamp
  };
};
