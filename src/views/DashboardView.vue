<!-- src/views/DashboardView.vue -->
<template>
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="glass rounded-2xl p-8 mb-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-4">
          Bienvenue à l'Échange Académique
        </h1>
        <p class="text-blue-100 text-lg mb-8">
          Prêt à étudier à l'étranger ? Soumettez votre demande d'échange ci-dessous.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/add-submission" class="btn-primary inline-flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-2" />
            Soumettre une Demande
          </router-link>
          <router-link
            to="/read-submission"
            class="btn-secondary inline-flex items-center"
          >
            <ClipboardDocumentListIcon class="w-5 h-5 mr-2" />
            Voir Ma Demande
          </router-link>
        </div>
      </div>
    </div>

    <div class="glass rounded-xl p-6">
      <h2 class="text-2xl font-semibold text-white mb-4">
        Documents et Dates Importants
      </h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-3">Documents Requis</h3>
          <ul class="space-y-2 text-blue-100">
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Dossier de candidature (ECC)
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Dossier de candidature GEC (si au moins un voeu en 3A GEC est choisi)
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              2 pages par semestre de relevés de notes ECC (S5 et S6) (et S7 et S8 pour
              les candidats en césure)
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Curriculum Vitae (avec une version en anglais incluse selon les voeux)
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Carte de Séjour (pour non-Marocains) et Passeport
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Une lettre de motivation pour chaque voeu
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Deux attestations de niveau de français et d'anglais
            </li>
            <li class="flex items-center">
              <CheckIcon class="w-4 h-4 text-green-400 mr-2" />
              Mention d'un enseignant-chercheur ECC pour une lettre de recommandation
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-medium text-blue-200 mb-3">Dates Importantes</h3>
          <ul class="space-y-2 text-blue-100">
            <li><strong>Date limite de soumission :</strong> 30 janvier 2026</li>
            <li><strong>Période de révision (ECC) :</strong> A Confirmer</li>
            <li><strong>Période de révision (Partenaire) :</strong> A Confirmer</li>
            <li><strong>Annonce des résultats :</strong> A Confirmer</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Critical Information -->
    <div class="glass rounded-xl p-6 mt-8">
      <h2 class="text-2xl font-semibold text-red-400 mb-4">⚠️ Informations Critiques</h2>
      <ul class="space-y-2 text-blue-100">
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            Toutes les informations et documents soumis doivent être
            <strong>vrais et exacts</strong>. Toute déclaration fausse entraînera le
            <strong>rejet automatique</strong> de la demande.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            La plateforme <strong>fermera automatiquement</strong> après la date limite.
            <u>Aucune soumission tardive</u> ne sera possible.
            <u
              >Aucune soumission par courrier ne sera prise en compte, avant ou après la
              date limite</u
            >.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            Vos électifs choisis doivent respecter
            <strong>l'équivalence des crédits ECTS</strong>. Vérifiez que le total
            correspond à vos exigences académiques.
          </span>
        </li>
        <li class="flex items-start">
          <ExclamationCircleIcon class="w-5 h-5 text-red-400 mr-2 mt-0.5" />
          <span>
            <strong>Les électifs</strong> sont sous la responsabilité de l’étudiant :
            veuillez consulter les sites des écoles partenaires pour connaître la
            disponibilité actualisée des cours.
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline';
</script>
