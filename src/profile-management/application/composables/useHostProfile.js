/**
 * useHostProfile Composable
 * Hook para gestionar datos del perfil del Anfitrión
 * Located: src/profile-management/application/composables/useHostProfile.js
 */

import { ref, computed } from 'vue';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/auth-management/application/services/auth.store.js';

/*export function useHostProfile() {
  const { user } = useAuth();
  const toast = useToast();// Estado
  const profile = ref(null);
  const isLoading = ref(false);
  const isEditing = ref(false);
  const error = ref(null);

  // Mock data - Reemplazar con datos reales del servidor
  const mockRecentEvents = ref([
    {
      id: 1,
      title: "María and Juan's wedding",
      date: '10/05/2025',
      status: 'pending',
    },
    {
      id: 2,
      title: "Sara's Birthday's",
      date: '08/05/2025',
      status: 'pending',
    },
    {
      id: 3,
      title: "Ana's Baby Shower",
      date: '05/1/2025',
      status: 'pending',
    },
  ]);

  const mockRecentOrganizers = ref([
    {
      id: 1,
      name: 'Julia García',
      initials: 'JG',
      avatarColor: '#9C88FF',
    },
    {
      id: 2,
      name: 'Laura Mendoza',
      initials: 'LM',
      avatarColor: '#FF9A56',
    },
    {
      id: 3,
      name: 'Carlos Sánchez',
      initials: 'CS',
      avatarColor: '#54A0FF',
    },
  ]);

  // Cargar perfil
  const loadProfile = async () => {
    if (!user.value?.id) return;

    isLoading.value = true;
    try {
      const data = await ProfileApiService.getProfile(user.value.id);
      profile.value = data;
      error.value = null;
    } catch (err) {
      error.value = err.message;
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el perfil',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const auth = useAuthStore();

  // Update profile
  const updateProfile = async (profileData) => {
    const auth = useAuthStore();

    if (!user.value?.id) return;

    // ✔ convertir solo a plano: nada de .value anidados
    const fullUser = JSON.parse(JSON.stringify({
      ...user.value,      // objeto plano original
      ...profileData      // cambios nuevos
    }));

    isLoading.value = true;

    try {
      const updated = await ProfileApiService.update(
        user.value.id,
        fullUser,
        'host'
      );

      // Actualizar Pinia correctamente
      auth.user = updated;

      // Actualizar almacenamiento
      const storageType = auth.storageType ?? 'local';
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      storage.setItem('authUser', JSON.stringify(updated));

      profile.value = updated;

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Perfil actualizado correctamente',
        life: 3000,
      });

    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el perfil',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };



  // Computed
  const userInitials = computed(() => {
    if (!user.value?.name) return '?';
    return user.value.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  const recentEvents = computed(() => mockRecentEvents.value);
  const recentOrganizers = computed(() => mockRecentOrganizers.value);

  return {
    // Estado
    profile,
    user,
    isLoading,
    isEditing,
    error,

    // Datos mock
    recentEvents,
    recentOrganizers,

    // Computed
    userInitials,

    // Métodos
    loadProfile,
    updateProfile,
  };
}*/

export function useHostProfile() {
  const { user } = useAuth();          // solo para obtener user.id
  const toast = useToast();

  const profile = ref(null);
  const isLoading = ref(false);
  const isEditing = ref(false);
  const error = ref(null);

  // DATA MOCK (no se toca)
  const mockRecentEvents = ref([
    { id: 1, title: "María and Juan's wedding", date: '10/05/2025', status: 'pending' },
    { id: 2, title: "Sara's Birthday's", date: '08/05/2025', status: 'pending' },
    { id: 3, title: "Ana's Baby Shower", date: '05/1/2025', status: 'pending' },
  ]);

  const mockRecentOrganizers = ref([
    { id: 1, name: 'Julia García', initials: 'JG', avatarColor: '#9C88FF' },
    { id: 2, name: 'Laura Mendoza', initials: 'LM', avatarColor: '#FF9A56' },
    { id: 3, name: 'Carlos Sánchez', initials: 'CS', avatarColor: '#54A0FF' },
  ]);

  // ----------------------------------------------------
  //   CARGAR PERFIL DESDE /api/v1/profiles (busca por userId)
  // ----------------------------------------------------
  const loadProfile = async () => {
    if (!user.value?.id) return;

    isLoading.value = true;
    try {
      // getMyProfile busca el perfil por userId
      const data = await ProfileApiService.getMyProfile(user.value.id);
      profile.value = data;
      error.value = null;
    } catch (err) {
      error.value = err.message;
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el perfil',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  // ----------------------------------------------------
  //   ACTUALIZAR PERFIL EN /api/v1/profiles/{profileId}
  // ----------------------------------------------------
  const updateProfile = async (profileData) => {
    if (!profile.value?.id) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró el perfil',
        life: 3000,
      });
      return;
    }

    isLoading.value = true;
    try {
      // updateProfile usa el profileId (no userId)
      const updated = await ProfileApiService.updateProfile(
        profile.value.id,
        profileData
      );

      profile.value = updated;

      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Perfil actualizado correctamente',
        life: 3000,
      });

    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el perfil',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  // ----------------------------------------------------
  //   INITIALS — usa firstName y lastName del backend
  // ----------------------------------------------------
  const userInitials = computed(() => {
    if (!profile.value) return '?';
    
    const firstName = profile.value.firstName || '';
    const lastName = profile.value.lastName || '';
    
    if (!firstName && !lastName) return '?';
    
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  });

  const recentEvents = computed(() => mockRecentEvents.value);
  const recentOrganizers = computed(() => mockRecentOrganizers.value);

  return {
    profile,         // 🔥 esto contiene el perfil real
    isLoading,
    isEditing,
    error,
    recentEvents,
    recentOrganizers,
    userInitials,
    loadProfile,
    updateProfile,
  };
}

