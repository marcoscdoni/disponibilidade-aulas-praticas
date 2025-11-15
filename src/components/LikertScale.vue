<template>
  <div class="space-y-3">
    <button
      v-for="option in options" 
      :key="option.value"
      type="button"
      :class="[
        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]',
        modelValue === option.value 
          ? 'bg-green-50 border-green-500 text-green-700' 
          : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-gray-100'
      ]"
      @click="$emit('update:modelValue', option.value)"
    >
      <div :class="[
        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
        modelValue === option.value 
          ? 'border-green-500 bg-green-500' 
          : 'border-gray-300'
      ]">
        <div v-if="modelValue === option.value" class="w-3 h-3 bg-white rounded-full"></div>
      </div>
  <span class="font-medium text-left text-lg">{{ option.label }}</span>
    </button>
    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'LikertScale',
  props: {
    modelValue: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup() {
    // Display highest satisfaction first (top) and descend to lowest
    const options = [
      { value: 'totally_satisfied', label: 'Totalmente satisfeito' },
      { value: 'satisfied', label: 'Satisfeito' },
      { value: 'neutral', label: 'Neutro' },
      { value: 'dissatisfied', label: 'Insatisfeito' },
      { value: 'totally_dissatisfied', label: 'Totalmente insatisfeito' }
    ]

    return {
      options
    }
  }
}
</script>