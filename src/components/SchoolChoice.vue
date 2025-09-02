<!-- SchoolChoice.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { School, SubmissionForm } from '@/types/submissionapi';
import { schoolElectiveConstraints } from '@/components/types';
import type {
  SchoolChoiceConfig,
  SchoolOption,
  SubmissionErrorType,
} from '@/components/types';

interface Props {
  choice: SchoolChoiceConfig;
  form: SubmissionForm;
  errors: SubmissionErrorType;
  schoolOptions: SchoolOption[];
}

const props = defineProps<Props>();

// Initialize electives array from semicolon-separated string
const initializeElectives = () => {
  const electivesString = props.form[props.choice.electivesKey] || '';
  return electivesString
    .split(';')
    .map((e: string) => e.trim())
    .filter((e: string) => e.length > 0);
};

// Reactive electives array
const electives = ref<string[]>(initializeElectives());

// Watch for external changes to the form electives field
watch(
  () => props.form[props.choice.electivesKey],
  (newValue) => {
    if (newValue !== electives.value.join('; ')) {
      electives.value = initializeElectives();
    }
  }
);

// Update form when electives array changes and validate
watch(
  electives,
  (newElectives) => {
    props.form[props.choice.electivesKey] = newElectives
      .filter((e) => e.trim().length > 0)
      .join('; ');

    // Validate electives and update errors object
    validateElectives();
  },
  { deep: true }
);

// Computed properties for constraints validation
const selectedSchool = computed(() => props.form[props.choice.schoolKey] as School);

const currentConstraints = computed(() => {
  return schoolElectiveConstraints[selectedSchool.value] || { min: 0 };
});

const validElectives = computed(() => {
  return electives.value.filter((e) => e.trim().length > 0);
});

const electiveCount = computed(() => validElectives.value.length);

const isMinRequirementMet = computed(() => {
  return electiveCount.value >= currentConstraints.value.min;
});

const isMaxRequirementMet = computed(() => {
  const max = currentConstraints.value.max;
  return max === undefined || electiveCount.value <= max;
});

const canAddMore = computed(() => {
  const max = currentConstraints.value.max;
  return max === undefined || electiveCount.value < max;
});

const constraintMessage = computed(() => {
  const { min, max } = currentConstraints.value;
  if (max !== undefined) {
    if (min === max) {
      return `Exactement ${min} cours requis`;
    }
    return `Entre ${min} et ${max} cours requis`;
  }
  return min > 0 ? `Au moins ${min} cours requis` : '';
});

// Validation function that updates the errors object
const validateElectives = () => {
  const electivesKey = props.choice.electivesKey;

  if (!isMinRequirementMet.value) {
    props.errors[electivesKey] =
      `Minimum ${currentConstraints.value.min} cours électifs requis`;
    return;
  }

  if (!isMaxRequirementMet.value) {
    props.errors[electivesKey] =
      `Maximum ${currentConstraints.value.max} cours électifs autorisés`;
    return;
  }

  props.errors[electivesKey] = '';
};

// Validate thematic sequence
const validateThematicSequence = () => {
  const thematicKey = props.choice.thematicKey;
  const schoolKey = props.choice.schoolKey;
  const school = props.form[schoolKey];

  if (['centrale_supelec', 'centrale_mediterranee'].includes(school)) {
    const thematicValue = props.form[thematicKey];
    props.errors[thematicKey] = !thematicValue?.trim() ? 'Ce champ est requis' : '';
  } else {
    props.errors[thematicKey] = '';
  }
};

// Watch for school changes and empty all fields
watch(selectedSchool, () => {
  // If switching to 'unset', clear all fields
  electives.value = [];
  props.form[props.choice.thematicKey] = '';

  // Revalidate after school change to be ultra safe
  validateSchool();
  validateElectives();
  validateThematicSequence();
});

// Watch for thematic sequence changes
watch(() => props.form[props.choice.thematicKey], validateThematicSequence);

const addElective = () => {
  if (canAddMore.value) {
    electives.value.push('');
  }
};

const removeElective = (index: number) => {
  const constraints = currentConstraints.value;

  // Don't allow removal if it would violate minimum requirement
  if (electiveCount.value <= constraints.min) {
    return;
  }

  electives.value.splice(index, 1);
};

const updateElective = (index: number, value: string) => {
  electives.value[index] = value;
};

// Placeholder suggestions based on choice
const getPlaceholder = (index: number) => {
  const suggestions =
    props.choice.title === 'first_choice'
      ? [
          'Apprentissage automatique',
          'Science des données',
          "Éthique de l'IA",
          'Vision par ordinateur',
          'Traitement du langage naturel',
        ]
      : [
          'Génie logiciel',
          'Développement web',
          'Applications mobiles',
          'DevOps',
          'Cybersécurité',
        ];

  return suggestions[index % suggestions.length] || 'Saisir un cours optionnel';
};

const isRemovalAllowed = () => {
  const constraints = currentConstraints.value;
  return electiveCount.value > constraints.min;
};

const validateSchool = () => {
  const schoolKey = props.choice.schoolKey;
  const school = props.form[schoolKey];

  if (schoolKey === 'school1' && school == 'unset') {
    props.errors[schoolKey] = 'Le premier choix doit être mentionné';
    return;
  }
  props.errors[schoolKey] = '';
};
watch(() => props.form[props.choice.schoolKey], validateSchool);

// Initialize validation on mount
watch(
  () => props.form,
  () => {
    validateSchool();
    validateElectives();
    validateThematicSequence();
  },
  { immediate: true }
);
</script>

<template>
  <div :class="choice.bgClass" class="rounded-lg border p-6">
    <h3 class="text-lg font-medium text-blue-200 mb-4 flex items-center">
      <span class="mr-2">{{ choice.emoji }}</span>
      {{ choice.title === 'first_choice' ? 'Premier Choix' : 'Deuxième Choix' }}
    </h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- School Selection -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">École *</label>
        <select
          v-model="form[choice.schoolKey]"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.schoolKey] }"
        >
          <option
            v-for="school in props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
        <p v-if="errors[choice.schoolKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.schoolKey] }}
        </p>
      </div>

      <!-- Thematic Sequence (conditional) -->
      <div
        v-if="
          ['centrale_supelec', 'centrale_mediterranee'].includes(form[choice.schoolKey])
        "
      >
        <label class="block text-blue-100 text-sm font-medium mb-2">
          {{
            form[choice.schoolKey] === 'centrale_supelec'
              ? 'Séquence Thématique *'
              : 'Parcours *'
          }}
        </label>
        <input
          :value="form[choice.thematicKey]"
          type="text"
          class="input-field"
          :class="{ 'border-red-500 focus:border-red-400': errors[choice.thematicKey] }"
          :placeholder="
            form[choice.schoolKey] === 'centrale_supelec'
              ? 'Saisir la séquence thématique'
              : 'Saisir le parcours'
          "
        />
        <p v-if="errors[choice.thematicKey]" class="text-red-300 text-xs mt-1">
          {{ errors[choice.thematicKey] }}
        </p>
      </div>

      <!-- Dynamic Électifs -->
      <div class="md:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <label class="block text-blue-100 text-sm font-medium">
              Electifs{{ currentConstraints.min > 0 ? ' *' : '' }}
            </label>
            <span v-if="constraintMessage" class="text-xs text-blue-300">
              ({{ constraintMessage }})
            </span>
          </div>
          <button
            v-if="canAddMore"
            type="button"
            @click="addElective"
            class="text-blue-300 hover:text-blue-100 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Ajouter un cours
          </button>
        </div>

        <!-- Validation Error Message from errors object -->
        <div
          v-if="errors[choice.electivesKey]"
          class="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm"
        >
          {{ errors[choice.electivesKey] }}
        </div>

        <!-- Electives Count Info -->
        <div class="mb-3 text-xs text-blue-400">
          {{ electiveCount }} cours sélectionnés
          <span v-if="currentConstraints.min > 0">
            (minimum: {{ currentConstraints.min
            }}{{
              currentConstraints.max !== undefined
                ? `, maximum: ${currentConstraints.max}`
                : ''
            }})
          </span>
        </div>

        <div class="space-y-2">
          <div
            v-for="(elective, index) in electives"
            :key="index"
            class="flex gap-2 items-center"
          >
            <input
              :value="elective"
              @input="updateElective(index, ($event.target as HTMLInputElement).value)"
              type="text"
              class="input-field flex-1"
              :class="{
                'border-red-500 focus:border-red-400': errors[choice.electivesKey],
                'border-green-500 focus:border-green-400':
                  !errors[choice.electivesKey] && isMinRequirementMet,
              }"
              :placeholder="getPlaceholder(index)"
            />
            <button
              type="button"
              @click="removeElective(index)"
              :disabled="!isRemovalAllowed()"
              class="text-red-300 hover:text-red-100 px-2 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-red-300"
              :title="
                isRemovalAllowed() ? 'Supprimer le cours' : 'Minimum requis atteint'
              "
            >
              ×
            </button>
          </div>

          <!-- Show add button if no electives -->
          <div v-if="electives.length === 0" class="text-center py-4">
            <button
              type="button"
              @click="addElective"
              class="text-blue-300 hover:text-blue-100 text-sm transition-colors border border-blue-400 hover:border-blue-300 px-4 py-2 rounded"
            >
              Ajouter le premier cours
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
