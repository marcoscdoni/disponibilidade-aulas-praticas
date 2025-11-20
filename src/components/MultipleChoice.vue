<template>
  <div>
    <!-- Select All button for schedule questions -->
    <div v-if="isScheduleQuestion" class="mb-4">
      <button
        type="button"
        :class="[
          'w-full flex items-center justify-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 hover:scale-[1.01] font-medium',
          allSelected
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'bg-gray-50 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
        ]"
        @click="toggleSelectAll"
      >
        <div :class="[
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          allSelected 
            ? 'border-blue-500 bg-blue-500' 
            : 'border-gray-400'
        ]">
          <svg v-if="allSelected" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <span class="text-sm">
          {{ allSelected ? 'Desmarcar todos os horários' : 'Selecionar todos os horários' }}
        </span>
      </button>
    </div>

    <!-- grid: conditional layout based on number of options -->
    <div class="grid gap-3" :class="options.length > 5 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'">
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
    },
    questionKey: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isScheduleQuestion() {
      // Detect if this is a schedule/availability question based on question key or options
      const scheduleKeys = [
        'mondayAvailability', 'tuesdayAvailability', 'wednesdayAvailability', 
        'thursdayAvailability', 'fridayAvailability', 'saturdayAvailability'
      ]
      
      // Check by question key
      if (scheduleKeys.includes(this.questionKey)) {
        return true
      }
      
      // Check by options content (if they contain time patterns like "07:00 às 07:50")
      const hasTimeOptions = this.options.some(option => 
        typeof option === 'string' && /\d{2}:\d{2}\s+às\s+\d{2}:\d{2}/.test(option)
      )
      
      return hasTimeOptions
    },
    allSelected() {
      return this.options.length > 0 && this.modelValue.length === this.options.length
    }
  },
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
    },
    toggleSelectAll() {
      if (this.allSelected) {
        // Unselect all
        this.$emit('update:modelValue', [])
      } else {
        // Select all
        this.$emit('update:modelValue', [...this.options])
      }
    }
  }
}
</script>

