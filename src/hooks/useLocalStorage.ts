
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, autoSave: boolean = true) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`❌ Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Auto-guardar cuando el estado cambie (si autoSave está habilitado)
  useEffect(() => {
    if (autoSave) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`❌ Error auto-saving localStorage key "${key}":`, error);
      }
    }
  }, [storedValue, key, autoSave]);

  // Función para establecer el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`❌ Error setting localStorage key "${key}":`, error);
    }
  };

  // Función para guardar manualmente
  const saveToStorage = () => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`❌ Error saving localStorage key "${key}":`, error);
    }
  };

  // Función para limpiar
  const clearStorage = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Error clearing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, saveToStorage, clearStorage] as const;
}
