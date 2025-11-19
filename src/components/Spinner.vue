<template>
  <span :class="containerClass" role="status" aria-live="polite" aria-busy="true">
    <svg :class="svgClass" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="20" :stroke="color" stroke-width="6" stroke-opacity="0.25" />
      <path :stroke="color" stroke-width="6" stroke-linecap="round" d="M45 25a20 20 0 00-20-20">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  </span>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    size: { type: String, default: 'sm' }, // sm, md, lg
    color: { type: String, default: 'currentColor' }
  },
  computed: {
    svgClass() {
      const map = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-7 h-7' }
      return map[this.size] || map.sm
    },
    containerClass() {
      // keep spinner container neutral; spacing handled by parent using gap/space utilities
      return 'inline-flex items-center justify-center align-middle'
    }
  }
}
</script>

<!-- no styles here; visual controlled by tailwind + props -->
