<template>
  <!-- grid: conditional layout based on number of options -->
  <div class="grid gap-3" :class="options.length > 5 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'">
    <button
      v-for="option in options" 
      :key="option"
      type="button"
      :class="[
        'w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01]',
        modelValue === option
          ? 'bg-green-50 border-green-500 text-green-700'
          : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-gray-100 text-gray-800'
      ]"
      @click="selectOption(option)"
    >
      <div :class="[
        'w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5',
        modelValue === option 
          ? 'border-green-500 bg-green-500' 
          : 'border-gray-300'
      ]">
        <div v-if="modelValue === option" class="w-3 h-3 rounded-full bg-white"></div>
      </div>
      <span class="mc-label font-medium text-left leading-relaxed text-lg" :class="modelValue === option ? 'text-green-700' : 'text-gray-700'">{{ option }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'RadioChoice',
  props: {
    modelValue: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue'],
  methods: {
    selectOption(option) {
      this.$emit('update:modelValue', option)
    }
  }
}
</script>

<style scoped>
.mc-label {
  font-size: 1rem;
}
</style>