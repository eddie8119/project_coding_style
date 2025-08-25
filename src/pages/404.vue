<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-brand-primary">404</h1>
      <p class="mt-4 text-2xl font-semibold text-gray-800 md:text-3xl">Page Not Found</p>
      <p class="mt-4 text-gray-500">Sorry, the page you are looking for does not exist.</p>
      <div class="mt-6">
        <router-link
          to="/"
          class="hover:bg-brand-primary-dark rounded-md bg-brand-primary px-4 py-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50"
        >
          Go Back Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
