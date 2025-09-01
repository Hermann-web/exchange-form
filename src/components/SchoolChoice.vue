<!-- SchoolChoice.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { School } from '@/types/submissionapi';

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

const addElective = () => {
  electives.value.push('');
};

const removeElective = (index: number) => {
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
              ? 'Séquence Thématique'
              : 'Parcours'
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
          <label class="block text-blue-100 text-sm font-medium"> Electifs </label>
          <button
            type="button"
            @click="addElective"
            class="text-blue-300 hover:text-blue-100 text-sm font-medium transition-colors"
          >
            + Ajouter un cours
          </button>
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
              :placeholder="getPlaceholder(index)"
            />
            <button
              type="button"
              @click="removeElective(index)"
              class="text-red-300 hover:text-red-100 px-2 py-1 transition-colors"
              title="Supprimer le cours"
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
