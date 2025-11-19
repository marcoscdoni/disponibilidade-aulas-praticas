<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import LikertScale from './LikertScale.vue'
import MultipleChoice from './MultipleChoice.vue'
import NAButton from './NAButton.vue'
import { submitToN8n, config, validateTokenWithBackend } from '../config/n8n.js'

const STORAGE_KEY = 'nps-survey-state'

export default {
	name: 'NPSSurvey',
	components: { LikertScale, MultipleChoice, NAButton },
	setup() {
		const currentStep = ref(0)
		const isSubmitting = ref(false)
		const submitError = ref('')
		const stepError = ref('')
		const tokenState = reactive({ status: 'loading', token: null, data: null, error: '' })

		const formData = reactive({
			npsScore: null,
			overallSatisfaction: null,
			receptionService: null,
			theoryClasses: null,
			practicalCarClasses: null,
			practicalMotoClasses: null,
			practicalInstructorCar: null,
			practicalInstructorMoto: null,
			vehicleConditions: null,
			infrastructure: null,
			dislikes: [],
			likes: [],
			comments: ''
		})

		const baseQuestions = [
			{ key: 'npsScore', question: 'De 0 a 10, quanto você indicaria nossa autoescola para amigos e familiares?', type: 'nps', required: true },
			{ key: 'overallSatisfaction', question: 'Como você avalia sua satisfação geral com nossa autoescola?', type: 'likert', required: true },
			{ key: 'receptionService', question: 'Como você avalia o atendimento da recepção e equipe administrativa?', type: 'likert', required: true },
			{ key: 'theoryClasses', question: 'Como você avalia a qualidade das aulas teóricas?', type: 'likert', required: true },
			{ key: 'infrastructure', question: 'Como você avalia a infraestrutura da autoescola (salas, banheiros, recepção)?', type: 'likert', required: true },
			{ key: 'dislikes', question: 'O que você NÃO gostou?', description: 'Marque todas as opções que se aplicam', type: 'multiple', required: false, options: [
				'Atendimento da recepção',
				'Demora no retorno de mensagens/ligações',
				'Falta de comunicação sobre prazos',
				'Prazo para início do curso teórico',
				'Prazo para início das aulas práticas',
				'Disponibilidade de horários para aulas práticas',
				'Demora no agendamento das provas',
				'Cancelamento de aulas sem aviso',
				'Didática do instrutor teórico',
				'Didática do instrutor prático',
				'Material didático desatualizado',
				'Condições dos veículos',
				'Limpeza e conforto das instalações',
				'Dificuldade para agendar aulas',
				'Falta de suporte durante o processo',
				'Tempo total do processo muito longo',
				'Outro (especificar nos comentários)'
			]
			},
			{ key: 'likes', question: 'O que você MAIS gostou?', description: 'Marque todas as opções que se aplicam', type: 'multiple', required: false, options: [
				'Atendimento da equipe',
				'Comunicação clara e transparente',
				'Rapidez no início do curso teórico',
				'Flexibilidade de horários',
				'Qualidade das aulas teóricas',
				'Qualidade das aulas práticas',
				'Profissionalismo dos instrutores',
				'Estado dos veículos',
				'Infraestrutura moderna e limpa',
				'Facilidade no agendamento',
				'Suporte durante todo o processo',
				'Preço justo',
				'Localização conveniente',
				'Outro (especificar nos comentários)'
			]
			}
		]

		const tailQuestions = [
			{ key: 'comments', question: 'Comentários adicionais, sugestões ou algo que gostaria de destacar', type: 'text', required: false, placeholder: 'Escreva seus comentários, sugestões ou observações aqui...' }
		]

		const categoryQuestionMap = {
			A: [
				{ key: 'practicalMotoClasses', question: 'Como você avalia a qualidade das aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' },
				{ key: 'practicalInstructorMoto', question: 'Como você avalia o instrutor nas aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' }
			],
			B: [
				{ key: 'practicalCarClasses', question: 'Como você avalia a qualidade das aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' },
				{ key: 'practicalInstructorCar', question: 'Como você avalia o instrutor nas aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' }
			],
			AB: [
				{ key: 'practicalCarClasses', question: 'Como você avalia a qualidade das aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' },
				{ key: 'practicalInstructorCar', question: 'Como você avalia o instrutor nas aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' },
				{ key: 'practicalMotoClasses', question: 'Como você avalia a qualidade das aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' },
				{ key: 'practicalInstructorMoto', question: 'Como você avalia o instrutor nas aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' },
				{ key: 'vehicleConditions', question: 'Como você avalia as condições dos veículos utilizados nas aulas práticas?', type: 'likert', required: true }
			]
		}

		const naFlags = reactive({ practicalCarClasses: false, practicalMotoClasses: false, practicalInstructorCar: false, practicalInstructorMoto: false })

		const selectedCategory = computed(() => (tokenState.data?.catpret || '').trim().toUpperCase())
		const surveyQuestions = computed(() => {
			const extras = categoryQuestionMap[selectedCategory.value] || []
			return [...baseQuestions, ...extras, ...tailQuestions]
		})
		const totalSteps = computed(() => surveyQuestions.value.length)
		const currentQuestion = computed(() => (currentStep.value > 0 && currentStep.value <= surveyQuestions.value.length) ? surveyQuestions.value[currentStep.value - 1] : null)
		const progressPercentage = computed(() => {
			if (!totalSteps.value) return 0
			return Math.round((currentStep.value / (totalSteps.value + 1)) * 100)
		})
		const displayedStep = computed(() => {
			if (!totalSteps.value) return 0
			if (currentStep.value <= 0) return 0
			return Math.min(currentStep.value, totalSteps.value)
		})
		const studentFirstName = computed(() => {
			const fullName = tokenState.data?.nome_aluno?.trim()
			if (!fullName) return ''
			const [first] = fullName.split(' ')
			return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : ''
		})
		const canStartSurvey = computed(() => tokenState.status === 'ready')

		const storageKey = STORAGE_KEY
		let skipPersistence = false

		const snapshotFormData = () => {
			const copy = {}
			Object.keys(formData).forEach((key) => {
				const value = formData[key]
				copy[key] = Array.isArray(value) ? [...value] : value
			})
			return copy
		}

		const persistState = () => {
			if (skipPersistence || typeof window === 'undefined') return
			const payload = {
				currentStep: currentStep.value,
				formData: snapshotFormData(),
				naFlags: { ...naFlags }
			}
			window.localStorage.setItem(storageKey, JSON.stringify(payload))
		}

		const updateUrlStep = (step) => {
			if (typeof window === 'undefined') return
			const url = new URL(window.location.href)
			if (step && step > 0 && step <= totalSteps.value) {
				url.searchParams.set('step', String(step))
			} else {
				url.searchParams.delete('step')
			}
			window.history.replaceState(null, '', url.toString())
		}

		const clearStoredState = () => {
			if (typeof window === 'undefined') return
			window.localStorage.removeItem(storageKey)
			const url = new URL(window.location.href)
			url.searchParams.delete('step')
			window.history.replaceState(null, '', url.toString())
		}

		const withPersistenceDisabled = (fn) => {
			skipPersistence = true
			try {
				fn()
			} finally {
				skipPersistence = false
			}
		}

		const restoreState = () => {
			if (typeof window === 'undefined') return
			const url = new URL(window.location.href)
			const stepParam = Number(url.searchParams.get('step'))
			const saved = window.localStorage.getItem(storageKey)
			withPersistenceDisabled(() => {
				if (saved) {
					try {
						const parsed = JSON.parse(saved)
						if (parsed.formData) {
							Object.keys(formData).forEach((key) => {
								if (parsed.formData[key] !== undefined) {
									formData[key] = Array.isArray(parsed.formData[key]) ? [...parsed.formData[key]] : parsed.formData[key]
								}
							})
						}
						if (parsed.naFlags) {
							Object.keys(naFlags).forEach((flag) => {
								if (parsed.naFlags[flag] !== undefined) {
									naFlags[flag] = parsed.naFlags[flag]
								}
							})
						}
						if (typeof parsed.currentStep === 'number' && parsed.currentStep >= 0 && parsed.currentStep <= totalSteps.value) {
							currentStep.value = parsed.currentStep
						}
					} catch (error) {
						console.warn('Unable to restore survey state:', error)
					}
				}
			})
			if (Number.isFinite(stepParam) && stepParam >= 0 && stepParam <= totalSteps.value) {
				currentStep.value = stepParam
			}
			updateUrlStep(currentStep.value)
		}

			const extractTokenFromUrl = () => {
				const fallbackToken = (import.meta.env.NPS_DEFAULT_TOKEN || '').trim() || null
			if (typeof window === 'undefined') return fallbackToken
			const currentUrl = new URL(window.location.href)
			const queryToken = currentUrl.searchParams.get('token')
			if (queryToken) return queryToken
			const parts = (currentUrl.pathname || '').split('/').filter(Boolean)
			return parts.length ? parts[parts.length - 1] : fallbackToken
		}

		const validateToken = async (token) => {
			if (!token) {
				tokenState.status = 'error'
				tokenState.error = 'Token não foi informado na URL.'
				return
			}
			tokenState.status = 'loading'
			tokenState.token = token
			tokenState.error = ''
			const result = await validateTokenWithBackend(token)
			if (result.success) {
				const student = Array.isArray(result.data) ? result.data[0] : result.data
				if (!student || !student.nome_aluno) {
					tokenState.status = 'error'
					tokenState.error = 'Dados do aluno não foram retornados pelo servidor de validação.'
					return
				}
				tokenState.data = student
				tokenState.status = 'ready'
			} else {
				tokenState.status = 'error'
				tokenState.error = result.error || 'Token inválido ou já utilizado.'
			}
		}

		const setAnswer = (value) => {
			if (!currentQuestion.value) return
			formData[currentQuestion.value.key] = value
			stepError.value = ''
		}

		const onNAChange = (key) => {
			if (naFlags[key]) {
				formData[key] = 'not_applicable'
				stepError.value = ''
			} else {
				formData[key] = null
			}
		}

		const toggleNA = (key) => {
			naFlags[key] = !naFlags[key]
			onNAChange(key)
		}

		watch(naFlags, (newVal, oldVal) => {
			Object.keys(newVal).forEach((k) => {
				if (newVal[k] !== oldVal[k]) {
					onNAChange(k)
				}
			})
			persistState()
		}, { deep: true })
		watch(formData, () => {
			persistState()
		}, { deep: true })
		watch(currentStep, (val) => {
			updateUrlStep(val)
			persistState()
		})

		onMounted(() => {
			restoreState()
			const token = extractTokenFromUrl()
			validateToken(token)
		})

		const cardRef = ref(null)

		const scrollToCard = () => {
			nextTick(() => {
				try {
					window.scrollTo({ top: 0, behavior: 'smooth' })
				} catch (e) {
					window.scrollTo(0, 0)
				}
			})
		}

		const validateCurrentStep = () => {
			if (!currentQuestion.value) return true
			const question = currentQuestion.value
			const answer = formData[question.key]
			if (question.required) {
				if (question.type === 'nps' && (answer === null || answer === undefined)) { stepError.value = 'Por favor, selecione uma pontuação de 0 a 10.'; return false }
				if (question.type === 'likert' && !answer && answer !== 'not_applicable') { stepError.value = 'Por favor, selecione uma opção.'; return false }
			}
			stepError.value = ''
			return true
		}

		const nextStep = async () => {
			if (currentStep.value === 0) { currentStep.value++; scrollToCard(); return }
			if (currentStep.value <= surveyQuestions.value.length) {
				if (!validateCurrentStep()) return
				if (currentStep.value === surveyQuestions.value.length) {
					await submitSurvey()
				} else {
					currentStep.value++
					scrollToCard()
				}
			}
		}

		const previousStep = () => { if (currentStep.value > 1) { currentStep.value--; stepError.value = ''; scrollToCard() } }

		const submitSurvey = async () => {
			isSubmitting.value = true; submitError.value = ''
			try {
				const surveyData = {
					nps_score: formData.npsScore,
					overall_satisfaction: formData.overallSatisfaction,
					reception_service: formData.receptionService,
					theory_classes: formData.theoryClasses,
					practical_car_classes: formData.practicalCarClasses,
					practical_moto_classes: formData.practicalMotoClasses,
					practical_instructor_car: formData.practicalInstructorCar,
					practical_instructor_moto: formData.practicalInstructorMoto,
					vehicle_conditions: formData.vehicleConditions,
					infrastructure: formData.infrastructure,
					dislikes: formData.dislikes,
					likes: formData.likes,
					comments: formData.comments
				}
				const result = await submitToN8n(surveyData, tokenState.token)
				if (result.success) {
					currentStep.value++
					clearStoredState()
				} else {
					submitError.value = result.error || 'Erro desconhecido ao enviar a pesquisa.'
				}
			} catch (error) {
				console.error('Submit error:', error)
				submitError.value = 'Erro de conexão. Verifique sua internet e tente novamente.'
			} finally {
				isSubmitting.value = false
			}
		}

		const retrySubmit = () => { submitError.value = ''; currentStep.value = surveyQuestions.value.length }
		const resetSurvey = () => {
			withPersistenceDisabled(() => {
				currentStep.value = 0
				isSubmitting.value = false
				submitError.value = ''
				stepError.value = ''
				Object.keys(formData).forEach((key) => {
					if (Array.isArray(formData[key])) {
						formData[key] = []
					} else {
						formData[key] = key === 'npsScore' ? null : ''
					}
				})
				Object.keys(naFlags).forEach((k) => { naFlags[k] = false })
			})
			clearStoredState()
		}

		const getQuestionType = (type) => ({ nps: 'Escala 0-10', likert: 'Escala de satisfação', multiple: 'Múltipla escolha', text: 'Texto livre' }[type] || '')

		return {
			currentStep,
			surveyQuestions,
			totalSteps,
			currentQuestion,
			progressPercentage,
			displayedStep,
			formData,
			isSubmitting,
			submitError,
			stepError,
			config,
			getQuestionType,
			setAnswer,
			onNAChange,
			naFlags,
			toggleNA,
			nextStep,
			previousStep,
			submitSurvey,
			retrySubmit,
			resetSurvey,
			tokenState,
			studentFirstName,
			canStartSurvey,
			cardRef
		}
	}
}
</script>