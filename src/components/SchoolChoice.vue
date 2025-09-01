<!-- SchoolChoice.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { School } from '@/types/submissionapi';
import { schoolElectiveConstraints } from '@/components/types';

interface SchoolOption {
  value: School;
  label: string;
}

interface Choice {
  title: string;
  schoolKey: string;
  thematicKey: string;
  electivesKey: string;
}

interface Props {
  choice: Choice;
  form: any;
  errors: any;
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

// Update form when electives array changes
watch(
  electives,
  (newElectives) => {
    props.form[props.choice.electivesKey] = newElectives
      .filter((e) => e.trim().length > 0)
      .join('; ');
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

const validationError = computed(() => {
  if (selectedSchool.value === 'unset') return null;

  if (!isMinRequirementMet.value) {
    return `Minimum ${currentConstraints.value.min} cours électifs requis`;
  }

  if (!isMaxRequirementMet.value) {
    return `Maximum ${currentConstraints.value.max} cours électifs autorisés`;
  }

  return null;
});

// Watch for school changes and adjust electives if needed
watch(selectedSchool, (newSchool) => {
  const constraints = schoolElectiveConstraints[newSchool];

  // If switching to 'unset', clear all electives
  if (newSchool === 'unset') {
    electives.value = [];
    return;
  }

  // If there's a max constraint and we exceed it, trim electives
  if (constraints.max !== undefined && electiveCount.value > constraints.max) {
    electives.value = electives.value.slice(0, constraints.max);
  }

  // If we don't meet minimum requirements, add empty slots
  if (electiveCount.value < constraints.min) {
    const needed = constraints.min - electiveCount.value;
    for (let i = 0; i < needed; i++) {
      electives.value.push('');
    }
  }
});

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
          'Éthique de l’IA',
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
</script>

<template>
  <div>
    <h3 class="text-lg font-medium text-blue-200 mb-4">
      {{ choice.title === 'first_choice' ? 'Premier Choix' : 'Deuxième Choix' }}
    </h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- School Selection -->
      <div>
        <label class="block text-blue-100 text-sm font-medium mb-2">École *</label>
        <select v-model="form[choice.schoolKey]" class="input-field">
          <option
            v-for="school in props.choice.title === 'first_choice'
              ? props.schoolOptions.filter((s) => s.value !== 'unset')
              : props.schoolOptions"
            :key="school.value"
            :value="school.value"
          >
            {{ school.label }}
          </option>
        </select>
      </div>

      <!-- Thematic Sequence (conditional) -->
      <div
        v-if="
          form[choice.schoolKey] !== 'unset' &&
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
          v-model="form[choice.thematicKey]"
          type="text"
          class="input-field"
          :placeholder="
            form[choice.schoolKey] === 'centrale_supelec'
              ? 'Saisir la séquence thématique'
              : 'Saisir le parcours'
          "
        />
      </div>

      <!-- Dynamic Électifs -->
      <div v-if="form[choice.schoolKey] !== 'unset'" class="md:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <label class="block text-blue-100 text-sm font-medium"> Electifs </label>
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

        <!-- Validation Error Message -->
        <div
          v-if="validationError"
          class="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm"
        >
          {{ validationError }}
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
                'border-red-500 focus:border-red-400': validationError,
                'border-green-500 focus:border-green-400':
                  !validationError && isMinRequirementMet,
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
          <div
            v-if="electives.length === 0 && selectedSchool !== 'unset'"
            class="text-center py-4"
          >
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
