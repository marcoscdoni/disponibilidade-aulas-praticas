<template>
  <!-- Use static class names in template so Tailwind's scanner / purge includes them reliably -->
  <div v-if="visible" role="alert" class="w-full max-w-3xl mx-auto p-2 rounded text-sm relative z-30"
       :class="variant === 'danger' ? 'bg-red-600 text-white border border-red-700' : variant === 'warning' ? 'bg-amber-400 text-black border border-amber-500' : variant === 'success' ? 'bg-green-500 text-white border border-green-600' : 'bg-blue-500 text-white border border-blue-600'">
    <div class="flex items-start gap-3">
      <span v-if="showIcon" class="flex-shrink-0" aria-hidden="true" v-html="iconSvg"></span>
      <div class="flex-1 text-sm">
        <strong v-if="title" class="block font-semibold mb-1">{{ title }}</strong>
        <div class="leading-snug"><slot/></div>
      </div>
      <button v-if="dismissible" @click="visible = false" class="ml-3 text-white" style="opacity: 0.8">✕</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    variant: { type: String, default: 'danger' }, // danger, warning, success, info
    title: { type: String, default: '' },
    dismissible: { type: Boolean, default: false },
    showIcon: { type: Boolean, default: true }
  },
  data() {
    return { visible: true }
  },
  computed: {
    containerClass() {
      const base = 'w-full max-w-3xl mx-auto p-2 rounded text-sm'
      const variants = {
        danger: 'bg-red-600 text-white border border-red-700',
        warning: 'bg-amber-400 text-black border border-amber-500',
        success: 'bg-green-500 text-white border border-green-600',
        info: 'bg-blue-500 text-white border border-blue-600'
      }
      return `${base} ${variants[this.variant] || variants.danger}`
    },
    iconSvg() {
      // simple icons for visual emphasis
      const svgs = {
        danger: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>`,
        warning: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
        success: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
        info: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>`
      }
      return svgs[this.variant] || svgs.danger
    }
  }
}
</script>

<!-- Tailwind drives the look; no extra styles here -->
