
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, autoSave: boolean = true) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      console.log(`🔍 Loading localStorage key "${key}"`);
      const item = window.localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : initialValue;
      console.log(`📥 Loaded from localStorage "${key}":`, parsed);
      return parsed;
    } catch (error) {
      console.error(`❌ Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Auto-guardar cuando el estado cambie (si autoSave está habilitado)
  useEffect(() => {
    if (autoSave) {
      try {
        console.log(`💾 Auto-saving to localStorage "${key}":`, storedValue);
        window.localStorage.setItem(key, JSON.stringify(storedValue));
        console.log(`✅ Successfully saved to localStorage "${key}"`);
        
        // Verificar que se guardó correctamente
        const verification = window.localStorage.getItem(key);
        console.log(`🔍 Verification - localStorage "${key}" contains:`, verification);
      } catch (error) {
        console.error(`❌ Error auto-saving localStorage key "${key}":`, error);
      }
    }
  }, [storedValue, key, autoSave]);

  // Función para establecer el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      console.log(`🔄 Setting value for "${key}":`, valueToStore);
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`❌ Error setting localStorage key "${key}":`, error);
    }
  };

  // Función para guardar manualmente
  const saveToStorage = () => {
    try {
      console.log(`💾 Manual save to localStorage "${key}":`, storedValue);
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      console.log(`✅ Manual save successful for "${key}"`);
    } catch (error) {
      console.error(`❌ Error saving localStorage key "${key}":`, error);
    }
  };

  // Función para limpiar
  const clearStorage = () => {
    try {
      console.log(`🧹 Clearing localStorage "${key}"`);
      window.localStorage.removeItem(key);
      console.log(`✅ Cleared localStorage "${key}"`);
    } catch (error) {
      console.error(`❌ Error clearing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, saveToStorage, clearStorage] as const;
}
