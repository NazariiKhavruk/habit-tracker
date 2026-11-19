<template>
  <div class="page" aria-busy="true" aria-label="Завантаження даних">
    <div class="skeleton sk-title"></div>
    <div class="skeleton sk-sub"></div>
    <div class="skeleton sk-summary"></div>
    <div class="sk-list">
      <div v-for="n in 4" :key="n" class="skeleton sk-card"></div>
    </div>
    <p class="sr-only" role="status">Завантаження…</p>
  </div>
</template>

<style scoped>
.sk-title {
  width: 12rem;
  height: 2rem;
}

.sk-sub {
  width: 18rem;
  max-width: 80%;
  height: 1rem;
  margin: 0.75rem 0 1.5rem;
}

.sk-summary {
  height: 6.5rem;
  margin-bottom: 1rem;
  border-radius: var(--radius);
}

.sk-list {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 48rem) {
  .sk-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sk-card {
  height: 5rem;
  border-radius: var(--radius);
}
</style>
