<template>
	<div class="min-h-screen bg-gradient-to-br">
		<div class="container mx-auto px-4 py-8 max-w-2xl">
			<!-- Header -->
			<div class="text-center mb-8 animate-fade-in">
				<h1 class="text-4xl md:text-5xl font-bold text-white mb-2">Pesquisa de Satisfação</h1>
				<p class="text-xl text-accent mb-4">{{ config.autoescola.name }}</p>
				<p class="text-blue-100 opacity-90 leading-relaxed">Sua opinião é muito importante para nós! Este questionário leva apenas 3 minutos.</p>
			</div>

			<!-- Progress Bar -->
			<div class="mb-8">
				<div class="flex justify-between items-center mb-2">
					<span class="text-blue-100 text-sm">Progresso</span>
					<span class="text-blue-100 text-sm">{{ currentStep }} de {{ totalSteps }}</span>
				</div>
				<div class="progress-bar"><div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div></div>
			</div>

			<!-- Welcome -->
			<div v-if="currentStep === 0" class="card text-center animate-slide-in-right">
				<div class="text-6xl mb-6">🎯</div>
				<h2 class="text-3xl font-bold text-gray-800 mb-4">Bem-vindo!</h2>
				<p class="text-gray-600 text-lg mb-6 leading-relaxed">Vamos começar nossa pesquisa de satisfação. Suas respostas nos ajudam a melhorar nossos serviços continuamente.</p>
				<p class="text-sm text-red-500 mb-8">* Indica uma pergunta obrigatória</p>
				<button @click="nextStep" class="btn-primary">Começar Pesquisa</button>
			</div>

			<!-- Question Steps -->
					<transition name="question-transition" mode="out-in">
						<div v-if="currentStep > 0 && questions && currentStep <= questions.length" key="question" class="card animate-slide-in-right" ref="cardRef">
					<div class="mb-6">
						<div class="flex items-center justify-between mb-4">
							<span class="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Pergunta {{ currentStep }}</span>
							<span class="text-sm text-gray-500">{{ getQuestionType(currentQuestion.type) }}</span>
						</div>
						<h2 class="text-xl md:text-2xl font-bold text-gray-800 leading-tight">{{ currentQuestion.question }} <span v-if="currentQuestion.required" class="text-red-500">*</span></h2>
						<p v-if="currentQuestion.description" class="text-gray-600 mt-2">{{ currentQuestion.description }}</p>
					</div>

					<!-- Content -->
					<div class="mb-8">
						<div v-if="currentQuestion.type === 'nps'" class="space-y-4">
							<div class="flex justify-between text-sm text-gray-500 mb-4"><span>0 = De jeito nenhum</span><span>10 = Com toda certeza</span></div>
							<div class="flex flex-wrap justify-center gap-2 md:gap-3">
								<button v-for="n in 11" :key="n-1" @click="setAnswer(n-1)"
									:class="[
										'w-12 h-12 md:w-16 md:h-16 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-110',
										formData[currentQuestion.key] === n-1 ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									]">
									{{ n-1 }}
								</button>
							</div>
						</div>

												<div v-else-if="currentQuestion.type === 'likert'">
																									<div v-if="currentQuestion.key.includes('practical')" class="mb-4">
																										<!-- nicer NA button component -->
																										<NAButton v-model="naFlags[currentQuestion.key]" :label="'Não fiz essa categoria'" size="xl" />
																									</div>

													<div v-if="!naFlags[currentQuestion.key]">
														<LikertScale :model-value="formData[currentQuestion.key]" @update:model-value="setAnswer($event)" />
													</div>
													<div v-else class="text-sm text-gray-500 italic">Pulando esta pergunta porque você indicou que não fez aulas.</div>
												</div>

						<MultipleChoice v-else-if="currentQuestion.type === 'multiple'" :model-value="formData[currentQuestion.key]" :options="currentQuestion.options" @update:model-value="setAnswer($event)" />

						<div v-else-if="currentQuestion.type === 'text'">
							<textarea :value="formData[currentQuestion.key]" @input="setAnswer($event.target.value)" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none" rows="6" :placeholder="currentQuestion.placeholder || 'Escreva sua resposta aqui...'"></textarea>
						</div>
					</div>

								<!-- error banner: use dark translucent red so it matches the dark card and text stays visible -->
								<div v-if="stepError" class="mb-6 p-4 rounded-lg" style="background: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.25);">
									<p style="color: #ffecec; font-size: 0.9rem; margin: 0">{{ stepError }}</p>
								</div>

					<div class="flex justify-between items-center">
						<button v-if="currentStep > 1" @click="previousStep" class="btn-secondary flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Voltar
						</button>
						<div v-else></div>
						<button @click="nextStep" class="btn-primary flex items-center gap-2">{{ currentStep === questions.length ? 'Finalizar' : 'Próxima' }}
							<svg v-if="currentStep < questions.length" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
						</button>
					</div>
				</div>
			</transition>

			<!-- Thank you / loading / error screens -->
			<div v-if="currentStep > questions.length && !isSubmitting" class="card text-center animate-slide-in-right">
				<div class="text-6xl mb-6">🎉</div>
				<h2 class="text-3xl font-bold text-gray-800 mb-4">Obrigado!</h2>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">Sua pesquisa foi enviada com sucesso. Suas respostas são muito importantes para nós!</p>
			</div>

			<div v-if="isSubmitting" class="card text-center"><div class="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div><h2 class="text-2xl font-bold text-gray-800 mb-4">Enviando...</h2><p class="text-gray-600">Aguarde enquanto enviamos sua pesquisa.</p></div>

			<div v-if="submitError" class="card text-center"><div class="text-6xl mb-6">❌</div><h2 class="text-3xl font-bold text-red-600 mb-4">Erro ao Enviar</h2><p class="text-gray-600 text-lg mb-8">{{ submitError }}</p><button @click="retrySubmit" class="btn-primary mr-4">Tentar Novamente</button><button @click="resetSurvey" class="btn-secondary">Recomeçar</button></div>

		</div>
	</div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import LikertScale from './LikertScale.vue'
import MultipleChoice from './MultipleChoice.vue'
import NAButton from './NAButton.vue'
import { submitToN8n, config } from '../config/n8n.js'

export default {
	name: 'NPSSurvey',
		components: { LikertScale, MultipleChoice, NAButton },
	setup() {
		const currentStep = ref(0)
		const isSubmitting = ref(false)
		const submitError = ref('')
		const stepError = ref('')

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

		const questions = [
			{ key: 'npsScore', question: 'De 0 a 10, quanto você indicaria nossa autoescola para amigos e familiares?', type: 'nps', required: true },
			{ key: 'overallSatisfaction', question: 'Como você avalia sua satisfação geral com nossa autoescola?', type: 'likert', required: true },
			{ key: 'receptionService', question: 'Como você avalia o atendimento da recepção e equipe administrativa?', type: 'likert', required: true },
			{ key: 'theoryClasses', question: 'Como você avalia a qualidade das aulas teóricas?', type: 'likert', required: true },
			{ key: 'practicalCarClasses', question: 'Como você avalia a qualidade das aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' },
			{ key: 'practicalMotoClasses', question: 'Como você avalia a qualidade das aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' },
			{ key: 'practicalInstructorCar', question: 'Como você avalia o instrutor nas aulas práticas de carro?', type: 'likert', required: false, description: 'Marque "Não fiz aula de carro" se não participou de aulas de carro.' },
			{ key: 'practicalInstructorMoto', question: 'Como você avalia o instrutor nas aulas práticas de moto?', type: 'likert', required: false, description: 'Marque "Não fiz aula de moto" se não participou de aulas de moto.' },
			{ key: 'vehicleConditions', question: 'Como você avalia as condições dos veículos utilizados nas aulas práticas?', type: 'likert', required: true },
			{ key: 'infrastructure', question: 'Como você avalia a infraestrutura da autoescola (salas, banheiros, recepção)?', type: 'likert', required: true },
			{ key: 'dislikes', question: 'O que você NÃO gostou?', description: 'Marque todas as opções que se aplicam', type: 'multiple', required: false, options: [ 'Atendimento da recepção','Demora no retorno de mensagens/ligações','Falta de comunicação sobre prazos','Prazo para início do curso teórico','Prazo para início das aulas práticas','Disponibilidade de horários para aulas práticas','Demora no agendamento das provas','Cancelamento de aulas sem aviso','Didática do instrutor teórico','Didática do instrutor prático','Material didático desatualizado','Condições dos veículos','Limpeza e conforto das instalações','Dificuldade para agendar aulas','Falta de suporte durante o processo','Tempo total do processo muito longo','Outro (especificar nos comentários)' ] },
			{ key: 'likes', question: 'O que você MAIS gostou?', description: 'Marque todas as opções que se aplicam', type: 'multiple', required: false, options: [ 'Atendimento da equipe','Comunicação clara e transparente','Rapidez no início das aulas','Flexibilidade de horários','Qualidade das aulas teóricas','Qualidade das aulas práticas','Profissionalismo dos instrutores','Estado dos veículos','Infraestrutura moderna e limpa','Facilidade no agendamento','Suporte durante todo o processo','Preço justo','Localização conveniente','Outro (especificar nos comentários)' ] },
			{ key: 'comments', question: 'Comentários adicionais, sugestões ou algo que gostaria de destacar', type: 'text', required: false, placeholder: 'Escreva seus comentários, sugestões ou observações aqui...' }
		]

		// flags for 'not applicable' on practical questions and instructors
		const naFlags = reactive({ practicalCarClasses: false, practicalMotoClasses: false, practicalInstructorCar: false, practicalInstructorMoto: false })

		const totalSteps = questions.length
		const currentQuestion = computed(() => (currentStep.value > 0 && currentStep.value <= questions.length) ? questions[currentStep.value - 1] : null)
		const progressPercentage = computed(() => Math.round((currentStep.value / (totalSteps + 1)) * 100))

		const getQuestionType = (type) => ({ nps: 'Escala 0-10', likert: 'Escala de satisfação', multiple: 'Múltipla escolha', text: 'Texto livre' }[type] || '')

				const setAnswer = (value) => { if (currentQuestion.value) { formData[currentQuestion.value.key] = value; stepError.value = '' } }

				const onNAChange = (key) => {
					if (naFlags[key]) {
						formData[key] = 'not_applicable'
						stepError.value = ''
					} else {
						// clear stored NA marker so user can answer normally
						formData[key] = null
					}
				}

					const toggleNA = (key) => {
						naFlags[key] = !naFlags[key]
						onNAChange(key)
					}

						// watch NA flags to update formData when a flag changes via v-model
					watch(naFlags, (newVal, oldVal) => {
						Object.keys(newVal).forEach(k => {
							if (newVal[k] !== oldVal[k]) {
								onNAChange(k)
							}
						})
					}, { deep: true })

						// ref to the currently rendered question card so we can scroll it into view
						const cardRef = ref(null)

								const scrollToCard = () => {
									// ensure the page scrolls all the way to the top whenever navigation occurs
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
				if (currentStep.value <= questions.length) {
					if (!validateCurrentStep()) return
					if (currentStep.value === questions.length) {
						await submitSurvey()
					} else {
						currentStep.value++
						// ensure the newly-rendered question is visible
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
				const result = await submitToN8n(surveyData)
				if (result.success) currentStep.value++
				else submitError.value = result.error || 'Erro desconhecido ao enviar a pesquisa.'
			} catch (error) { console.error('Submit error:', error); submitError.value = 'Erro de conexão. Verifique sua internet e tente novamente.' }
			finally { isSubmitting.value = false }
		}

				const retrySubmit = () => { submitError.value = ''; currentStep.value = questions.length }
				const resetSurvey = () => {
					currentStep.value = 0; isSubmitting.value = false; submitError.value = ''; stepError.value = '';
					Object.keys(formData).forEach(key => { if (Array.isArray(formData[key])) formData[key] = [] ; else formData[key] = key === 'npsScore' ? null : '' })
					// reset NA flags
					Object.keys(naFlags).forEach(k => { naFlags[k] = false })
				}

				return { currentStep, questions, totalSteps, currentQuestion, progressPercentage, formData, isSubmitting, submitError, stepError, config, getQuestionType, setAnswer, onNAChange, naFlags, toggleNA, nextStep, previousStep, submitSurvey, retrySubmit, resetSurvey }
	}
}
</script>

