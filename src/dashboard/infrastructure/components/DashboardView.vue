<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/auth-management/infrastructure/composables/useAuth.js";

const router = useRouter();
const { user, restoreSession } = useAuth();

onMounted(async () => {
  // Asegurar que la sesión esté cargada
  if (!user.value) {
    await restoreSession();
  }

  const role = user.value?.role;

  if (role === "host") {
    router.replace("/host/dashboard");
  } else if (role === "organizer") {
    router.replace("/organizer/dashboard");
  } else {
    router.replace("/login");
  }
});
</script>

<template>
  <div class="redirect-box">
    Redirigiendo a tu panel...
  </div>
</template>

<style scoped>
.redirect-box {
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #1c2541;
}
</style>
