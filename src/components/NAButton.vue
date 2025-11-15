<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="modelValue"
    @click="toggle"
    :class="[buttonClasses, 'transition select-none']"
  >
    <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
    </svg>
    <span :class="['font-medium', sizeClass, labelClass]">{{ label }}</span>
  </button>
</template>

<script>
export default {
  name: 'NAButton',
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: 'Não fiz essa categoria' },
    size: { type: String, default: 'lg' } // 'lg' or 'xl'
  },
  emits: ['update:modelValue'],
  computed: {
    sizeClass() {
      return this.size === 'xl' ? 'text-xl' : 'text-lg'
    },
    buttonClasses() {
      // prettier, concise styles for selected / unselected
      if (this.modelValue) {
        // when selected, use the alert-like style to match validation banner
        return 'inline-flex items-center gap-3 px-3 py-1 rounded-full na-selected-alert shadow-sm'
      }
      // default unselected: white background with dark text to match page request
      return 'inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
    },
    labelClass() {
  return this.modelValue ? 'font-semibold na-selected-text' : 'font-medium text-gray-900'
    }
  },
  methods: {
    toggle() {
      this.$emit('update:modelValue', !this.modelValue)
    }
  }
}
</script>
