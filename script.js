const translations = {
  fr: {
    titre: "Simulesous",
    meta_description: "Simulateur d'épargne accessible, sobre et respectueux de l'environnement.",
    choix_langue: "Choisir la langue",
    aide_form: "Entrez vos paramètres pour calculer l’évolution de votre épargne.",
    capital_initial_label: "Capital initial (€)",
    versement_mensuel_label: "Versement mensuel (€)",
    taux_annuel_label: "Taux annuel (%)",
    calculer: "Calculer",
    resultat: (mois, montant) => `Au bout de <b>${mois}</b> mois, votre épargne serait d’environ <b>${montant}</b>.`,
    erreur: "⚠️ Merci de vérifier vos entrées.",
    footer_text: "Projet open-source. Sobre, accessible, respectueux de vos données.<br><span lang='en'>English version available.</span>",
    github_link: "🐙 Voir sur GitHub",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Basculer le thème",
    ajouter_compte: "Ajouter un compte",
    supprimer_compte: "Supprimer",
    nom_compte_label: "Nom du compte",
    duree_label: "Durée",
    mois: "Mois",
    annees: "Années"
  },
  en: {
    titre: "Simulesous",
    meta_description: "Accessible, minimal, eco-friendly savings simulator.",
    choix_langue: "Choose language",
    aide_form: "Enter your parameters to calculate your savings growth.",
    capital_initial_label: "Initial capital (€)",
    versement_mensuel_label: "Monthly deposit (€)",
    taux_annuel_label: "Annual rate (%)",
    calculer: "Calculate",
    resultat: (mois, montant) => `After <b>${mois}</b> months, your savings would be about <b>${montant}</b>.`,
    erreur: "⚠️ Please check your entries.",
    footer_text: "Open-source project. Minimal, accessible, data-friendly.<br><span lang='fr'>Version française disponible.</span>",
    github_link: "🐙 View on GitHub",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Switch theme",
    ajouter_compte: "Add account",
    supprimer_compte: "Delete",
    nom_compte_label: "Account name",
    duree_label: "Duration",
    mois: "Months",
    annees: "Years"
  }
};

let currentLang = 'fr';

let comptes = [
  { nom: "", capital: "", versement: "", taux: "" }
];

// Palette minimaliste, accessible, pour différencier jusqu'à 5 comptes
const couleurs = [
  "#016170",
  "#23c7c7",
  "#e8aa00",
  "#ce4069",
  "#9059ff"
];

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const trad = translations[currentLang][key];
    if (typeof trad === 'string') {
      el.innerHTML = trad;
      if (el.tagName === 'TITLE' || el.tagName === 'META') {
        el.textContent = trad;
      }
    }
  });

  // Thème: update button aria-label and icon
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.setAttribute("aria-label", translations[currentLang].theme_label);
    themeBtn.setAttribute("title", translations[currentLang].theme_label);
    themeBtn.textContent = document.documentElement.classList.contains("dark")
      ? translations[currentLang].theme_light
      : translations[currentLang].theme_dark;
  }
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
  applyTranslations();
}

function getPreferredTheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function calculerEpargneAvecHistorique({ capitalInitial, versementMensuel, tauxAnnuel, dureeMois }) {
  const tauxMensuel = Math.pow(1 + tauxAnnuel, 1 / 12) - 1;
  let capital = capitalInitial;
  const historique = [capital];
  for (let m = 1; m <= dureeMois; m++) {
    capital = capital * (1 + tauxMensuel) + versementMensuel;
    historique.push(capital);
  }
  return historique;
}

function formatMontant(valeur) {
  return valeur.toLocaleString(currentLang === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
}

function afficherResultat(texteHtml) {
  const resDiv = document.getElementById("resultat");
  resDiv.innerHTML = texteHtml;
}

function saveComptesFromInputs() {
  comptes = comptes.map((c, idx) => ({
    nom: document.getElementById(`nom_compte_${idx}`)?.value.trim() || c.nom,
    capital: document.getElementById(`capital_initial_${idx}`)?.value || c.capital,
    versement: document.getElementById(`versement_mensuel_${idx}`)?.value || c.versement,
    taux: document.getElementById(`taux_annuel_${idx}`)?.value || c.taux,
  }));
}

function renderComptesForm() {
  const comptesContainer = document.getElementById('comptes-container');
  comptesContainer.innerHTML = '';
  comptes.forEach((compte, idx) => {
    const bloc = document.createElement('div');
    bloc.className = 'compte-form-bloc';
    bloc.innerHTML = `
      <div class="form-group">
        <label data-i18n="nom_compte_label" for="nom_compte_${idx}"></label>
        <input type="text" id="nom_compte_${idx}" name="nom_compte_${idx}" value="${compte.nom}" maxlength="32" autocomplete="off">
      </div>
      <div class="form-group">
        <label data-i18n="capital_initial_label" for="capital_initial_${idx}"></label>
        <input type="number" id="capital_initial_${idx}" name="capital_initial_${idx}" min="0" step="0.01" required inputmode="decimal" value="${compte.capital}">
      </div>
      <div class="form-group">
        <label data-i18n="versement_mensuel_label" for="versement_mensuel_${idx}"></label>
        <input type="number" id="versement_mensuel_${idx}" name="versement_mensuel_${idx}" min="0" step="0.01" required inputmode="decimal" value="${compte.versement}">
      </div>
      <div class="form-group">
        <label data-i18n="taux_annuel_label" for="taux_annuel_${idx}"></label>
        <input type="number" id="taux_annuel_${idx}" name="taux_annuel_${idx}" min="0" step="0.01" required inputmode="decimal" value="${compte.taux}">
      </div>
      ${comptes.length > 1 ? `<button type="button" class="supprimer-compte" data-idx="${idx}" aria-label="Supprimer" title="Supprimer">×</button>` : ''}
    `;
    comptesContainer.appendChild(bloc);
  });
  applyTranslations();
  document.querySelectorAll('.supprimer-compte').forEach(btn => {
    btn.onclick = (e) => {
      saveComptesFromInputs();
      const idx = parseInt(btn.getAttribute('data-idx'));
      comptes.splice(idx, 1);
      renderComptesForm();
    };
  });
}

// --------- CHART.JS ---------

let epargneChart = null;

function renderChart(labels, datasets) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (epargneChart) {
    epargneChart.data.labels = labels;
    epargneChart.data.datasets = datasets;
    epargneChart.update();
  } else {
    epargneChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--fg')
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                // Ajoute le formatage € selon la langue
                const val = context.parsed.y;
                return `${context.dataset.label} : ${formatMontant(val)}`;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        scales: {
          x: {
            title: {
              display: true,
              text: translations[currentLang].mois
            },
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--fg') }
          },
          y: {
            title: {
              display: true,
              text: '€'
            },
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--fg') },
            beginAtZero: true
          }
        }
      }
    });
  }
}

// --------- DOM READY & EVENTS ---------

window.addEventListener('DOMContentLoaded', () => {
  // Langue : priorise la sauvegarde, sinon navigateur
  const savedLang = localStorage.getItem("lang");
  if (savedLang === "fr" || savedLang === "en") {
    currentLang = savedLang;
    document.getElementById("lang-select").value = savedLang;
  } else {
    const userLang = navigator.language || navigator.userLanguage || "fr";
    if (userLang.startsWith("en")) {
      currentLang = "en";
      document.getElementById("lang-select").value = "en";
    } else if (userLang.startsWith("fr")) {
      currentLang = "fr";
      document.getElementById("lang-select").value = "fr";
    }
  }
  // Thème : priorise la sauvegarde, sinon système
  const savedTheme = localStorage.getItem("theme");
  let theme;
  if (savedTheme === "dark" || savedTheme === "light") {
    theme = savedTheme;
  } else {
    theme = getPreferredTheme();
  }
  applyTheme(theme);
  applyTranslations();
  renderComptesForm();
});

// Switch de langue
document.getElementById("lang-select").addEventListener("change", function (e) {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang);
  applyTranslations();
  renderComptesForm();
  afficherResultat("");
  if (epargneChart) epargneChart.destroy(), epargneChart = null;
});

// Switch manuel light/dark
document.getElementById("theme-toggle").addEventListener("click", function () {
  const theme = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  applyTheme(theme);
  // Met à jour la couleur des labels Chart.js
  if (epargneChart) {
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg');
    epargneChart.options.plugins.legend.labels.color = fg;
    epargneChart.options.scales.x.ticks.color = fg;
    epargneChart.options.scales.y.ticks.color = fg;
    epargneChart.update();
  }
});

// Ajouter un compte
document.getElementById('ajouter-compte').onclick = function () {
  saveComptesFromInputs();
  comptes.push({ nom: "", capital: "", versement: "", taux: "" });
  renderComptesForm();
};

// Soumission du formulaire
document.getElementById('form-simu').addEventListener('submit', function(event) {
  event.preventDefault();
  saveComptesFromInputs();

  // Gestion de la durée (mois ou années)
  const dureeVal = parseInt(document.getElementById('duree_val').value, 10) || 1;
  const unite = document.getElementById('duree_unite').value;
  let dureeMois = dureeVal;
  if (unite === "annees") {
    dureeMois = dureeVal * 12;
  }

  let html = "";
  let total = 0;
  let maxLen = 0;
  let allHistos = [];
  comptes.forEach((compte, idx) => {
    const capitalInitial = parseFloat(compte.capital) || 0;
    const versementMensuel = parseFloat(compte.versement) || 0;
    const tauxAnnuel = (parseFloat(compte.taux) || 0) / 100;
    const historique = calculerEpargneAvecHistorique({
      capitalInitial,
      versementMensuel,
      tauxAnnuel,
      dureeMois
    });
    allHistos.push(historique);
    maxLen = Math.max(maxLen, historique.length);
    const montant = historique[historique.length - 1];
    total += montant;
    html += `<div><b>${compte.nom || "Compte " + (idx + 1)}</b> : ${formatMontant(montant)}</div>`;
  });
  if (comptes.length > 1) {
    html += `<div style="margin-top:0.8rem"><b>Total</b> : ${formatMontant(total)}</div>`;
  }
  afficherResultat(html);

  // Préparation Chart.js
  // Labels = [0, 1, ..., dureeMois]
  const labels = Array.from({ length: maxLen }, (_, i) => i.toString());
  const datasets = comptes.map((compte, idx) => ({
    label: compte.nom || `Compte ${idx+1}`,
    data: allHistos[idx],
    borderColor: couleurs[idx % couleurs.length],
    backgroundColor: couleurs[idx % couleurs.length] + '40', // Opacité
    fill: false,
    tension: 0.07,
    pointRadius: 1.2
  }));

  // Affiche ou met à jour le graphique
  renderChart(labels, datasets);
});
