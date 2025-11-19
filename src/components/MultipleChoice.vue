<template>
  <!-- grid: 1 column on small screens, 2 columns on md+ -->
  <div class="grid gap-3 grid-cols-1 md:grid-cols-2">
    <button
      v-for="option in options" 
      :key="option"
      type="button"
      :class="[
        'w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01]',
        modelValue.includes(option)
          ? 'bg-green-50 border-green-500 text-green-700'
          : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-gray-100 text-gray-800'
      ]"
      @click="toggleOption(option)"
    >
      <div :class="[
        'w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5',
        modelValue.includes(option) 
          ? 'border-green-500 bg-green-500' 
          : 'border-gray-300'
      ]">
        <svg v-if="modelValue.includes(option)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <span class="mc-label font-medium text-left leading-relaxed text-lg" :class="modelValue.includes(option) ? 'text-green-700' : 'text-gray-700'">{{ option }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'MultipleChoice',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue'],
  methods: {
    toggleOption(option) {
      const newValue = [...this.modelValue]
      const index = newValue.indexOf(option)
      
      if (index > -1) {
        newValue.splice(index, 1)
      } else {
        newValue.push(option)
      }
      
      this.$emit('update:modelValue', newValue)
    }
  }
}
</script>

