// script.js

// ─────────────────────────────────────────────────────────────────────────────
// Traductions
// ─────────────────────────────────────────────────────────────────────────────
const translations = {
  fr: {
    titre_onglet: "Simulesous",
    titre: "💰 Simulesous",
    meta_description: "Simulateur d'épargne accessible, sobre et respectueux de l'environnement.",
    choix_langue: "Choisir la langue",
    aide_form: "Entrez vos paramètres pour calculer l’évolution de votre épargne.",
    ajouter_compte: "+ Ajouter un compte",
    nom_compte_label: "Nom du compte",
    capital_initial_label: "Capital initial (€)",
    versement_mensuel_label: "Versement mensuel (€)",
    taux_annuel_label: "Taux annuel (%)",
    calculer: "Calculer",
    duree_label: "Durée",
    mois: "Mois",
    annees: "Années",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Basculer le thème",
    footer_text:
      "Projet open-source. Sobre, accessible, respectueux de vos données.<br><span lang='en'>English version available.</span>",
    github_link: "🐙 Voir sur GitHub",
    toggle_desc: "Unité de durée (mois / années)",
    total_label: "Total"
  },
  en: {
    titre_onglet: "Simulesous",
    titre: "💰 Simulesous",
    meta_description: "Accessible, minimal, eco-friendly savings simulator.",
    choix_langue: "Choose language",
    aide_form: "Enter your parameters to calculate your savings growth.",
    ajouter_compte: "Add account",
    nom_compte_label: "Account name",
    capital_initial_label: "Initial capital (€)",
    versement_mensuel_label: "Monthly deposit (€)",
    taux_annuel_label: "Annual rate (%)",
    calculer: "Calculate",
    duree_label: "Duration",
    mois: "Months",
    annees: "Years",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Switch theme",
    footer_text:
      "Open-source project. Minimal, accessible, data-friendly.<br><span lang='fr'>Version française disponible.</span>",
    github_link: "🐙 View on GitHub",
    toggle_desc: "Duration unit (months / years)",
    total_label: "Total"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Variables globales
// ─────────────────────────────────────────────────────────────────────────────
let currentLang = "fr";
let comptes = [{ nom: "", capital: "", versement: "", taux: "" }];

let chartUnit = "annees";      // "mois" ou "annees"
let chartHistos = [];          // historique par compte
let chartDuration = 0;         // durée en mois
let epargneChart = null;       // instance Chart.js

const couleurs = [             // palette sobre
  "#016170",
  "#23c7c7",
  "#e8aa00",
  "#ce4069",
  "#9059ff"
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires : thème, i18n & calculs
// ─────────────────────────────────────────────────────────────────────────────
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const txt = translations[currentLang][key];
    if (typeof txt === "string") el.innerHTML = txt;
  });
  // Mise à jour du toggle unité aria-label
  const tog = document.getElementById("toggle-unit");
  tog.setAttribute(
    "aria-label",
    `${translations[currentLang].duree_label} : ${translations[currentLang][chartUnit]}`
  );
  tog.setAttribute("aria-checked", tog.checked);
  // Thème button
  const th = document.getElementById("theme-toggle");
  th.setAttribute("aria-label", translations[currentLang].theme_label);
  th.textContent = document.documentElement.classList.contains("dark")
    ? translations[currentLang].theme_light
    : translations[currentLang].theme_dark;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  applyTranslations();
  if (epargneChart) updateChartColors();
}

function getPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function calculerEpargneAvecHistorique({ capitalInitial, versementMensuel, tauxAnnuel, dureeMois }) {
  const tauxMensuel = Math.pow(1 + tauxAnnuel, 1 / 12) - 1;
  let cap = capitalInitial;
  const histo = [cap];
  for (let m = 1; m <= dureeMois; m++) {
    cap = cap * (1 + tauxMensuel) + versementMensuel;
    histo.push(cap);
  }
  return histo;
}

function formatMontant(val) {
  return val.toLocaleString(
    currentLang === "fr" ? "fr-FR" : "en-US",
    { style: "currency", currency: "EUR", maximumFractionDigits: 2 }
  );
}

function afficherResultat(html) {
  document.getElementById("resultat").innerHTML = html;
}

function updateDureeToggleLabels() {
  const isYears = document.getElementById("toggle-unit").checked;
  document.querySelector(".toggle-mois").style.display    = isYears ? "none"  : "inline";
  document.querySelector(".toggle-annees").style.display  = isYears ? "inline" : "none";
}

// ─────────────────────────────────────────────────────────────────────────────
// Gestion dynamique des comptes
// ─────────────────────────────────────────────────────────────────────────────
function saveComptesFromInputs() {
  comptes = comptes.map((c, i) => ({
    nom:       document.getElementById(`nom_compte_${i}`).value.trim() || c.nom,
    capital:   document.getElementById(`capital_initial_${i}`).value || c.capital,
    versement: document.getElementById(`versement_mensuel_${i}`).value || c.versement,
    taux:      document.getElementById(`taux_annuel_${i}`).value || c.taux
  }));
}

function renderComptesForm() {
  const cont = document.getElementById("comptes-container");
  cont.innerHTML = "";
  comptes.forEach((c, i) => {
    const bloc = document.createElement("div");
    bloc.className = "compte-form-bloc";
    bloc.innerHTML = `
      <div class="form-group">
        <label data-i18n="nom_compte_label" for="nom_compte_${i}"></label>
        <input type="text" id="nom_compte_${i}" value="${c.nom}" maxlength="32" autocomplete="off">
      </div>
      <div class="form-group">
        <label data-i18n="capital_initial_label" for="capital_initial_${i}"></label>
        <input type="number" id="capital_initial_${i}" min="0" step="0.01" inputmode="decimal" value="${c.capital}">
      </div>
      <div class="form-group">
        <label data-i18n="versement_mensuel_label" for="versement_mensuel_${i}"></label>
        <input type="number" id="versement_mensuel_${i}" min="0" step="0.01" inputmode="decimal" value="${c.versement}">
      </div>
      <div class="form-group">
        <label data-i18n="taux_annuel_label" for="taux_annuel_${i}"></label>
        <input type="number" id="taux_annuel_${i}" min="0" step="0.01" inputmode="decimal" value="${c.taux}">
      </div>
      ${comptes.length > 1 
        ? `<button type="button" class="supprimer-compte" data-idx="${i}" aria-label="Supprimer">×</button>`
        : ""
      }
    `;
    cont.appendChild(bloc);
  });
  applyTranslations();
  document.querySelectorAll(".supprimer-compte").forEach(btn => {
    btn.onclick = () => {
      saveComptesFromInputs();
      comptes.splice(+btn.dataset.idx, 1);
      renderComptesForm();
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Génération et rendu du graphique
// ─────────────────────────────────────────────────────────────────────────────
function generateChartData() {
  // récupère la valeur et utilise chartUnit
  const val = parseInt(document.getElementById("duree_val").value, 10) || 1;
  chartDuration = (chartUnit === "annees") ? val * 12 : val;

  // génère les historiques
  chartHistos = comptes.map(c =>
    calculerEpargneAvecHistorique({
      capitalInitial: parseFloat(c.capital) || 0,
      versementMensuel: parseFloat(c.versement) || 0,
      tauxAnnuel: (parseFloat(c.taux) || 0) / 100,
      dureeMois: chartDuration
    })
  );

  // labels
  const labels = Array.from({ length: chartDuration + 1 }, (_, i) => i);

  // datasets comptes
  const datasets = chartHistos.map((h, i) => ({
    label: comptes[i].nom || `Compte ${i + 1}`,
    data: h,
    borderColor: couleurs[i % couleurs.length],
    fill: false,
    tension: 0.1,
    pointRadius: 0
  }));

  // dataset total
  const total = labels.map((_, i) =>
    chartHistos.reduce((sum, h) => sum + (h[i] || 0), 0)
  );
  datasets.push({
    label: translations[currentLang].total_label,
    data: total,
    borderColor: "#666",
    borderDash: [6, 4],
    fill: false,
    tension: 0.1,
    pointRadius: 0
  });

  return { labels, datasets };
}

function renderChart(labels, datasets) {
  const fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim();
  const unit = chartUnit;
  const ctx = document.getElementById("chart").getContext("2d");

  const xOpts = {
    title: { display: true, text: translations[currentLang][unit] },
    ticks: {
      color: fg,
      stepSize: (unit === "annees") ? 12 : 1,
      callback: v => (unit === "annees" && v % 12 === 0) ? (v/12).toString() : (unit === "mois" ? v.toString() : "")
    }
  };

  const cfg = {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: fg } },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: ctx => `${ctx.dataset.label} : ${formatMontant(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: xOpts,
        y: {
          title: { display: true, text: "€" },
          ticks: { color: fg },
          beginAtZero: true
        }
      }
    }
  };

  if (epargneChart) {
    epargneChart.options = cfg.options;
    epargneChart.data = cfg.data;
    epargneChart.update();
  } else {
    epargneChart = new Chart(ctx, cfg);
  }
}

function updateChartColors() {
  if (!epargneChart) return;
  const fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim();
  epargneChart.options.plugins.legend.labels.color = fg;
  epargneChart.options.scales.x.ticks.color = fg;
  epargneChart.options.scales.y.ticks.color = fg;
  epargneChart.update();
}

function updateAll() {
  saveComptesFromInputs();
  const { labels, datasets } = generateChartData();

  let html = "";
  let totalFinal = 0, totalInit = 0, totalInvesti = 0, totalInterets = 0;
  const dureeVal = parseInt(document.getElementById("duree_val").value,10) || 1;
  const dureeMois = chartUnit === "annees" ? dureeVal*12 : dureeVal;

  comptes.forEach((c,i) => {
    const data = datasets[i].data;
    const final = data[data.length-1];
    const init = parseFloat(c.capital)||0;
    const investi = (parseFloat(c.versement)||0) * dureeMois;
    const interets = final - init - investi;

    totalFinal    += final;
    totalInit     += init;
    totalInvesti  += investi;
    totalInterets += interets;

    html += `
      <div class="result-line">
        <b>${c.nom||"Compte "+(i+1)}</b> :
        <span class="res-label">Final :</span> ${formatMontant(final)}
        <span class="res-label">Init :</span> ${formatMontant(init)}
        <span class="res-label">Investi :</span> ${formatMontant(investi)}
        <span class="res-label">Intérêts :</span> ${formatMontant(interets)}
      </div>
    `;
  });

  if (comptes.length > 1) {
    html += `
      <div class="result-line result-total">
        <b>${translations[currentLang].total_label}</b> :
        <span class="res-label">Final :</span> ${formatMontant(totalFinal)}
        <span class="res-label">Init :</span> ${formatMontant(totalInit)}
        <span class="res-label">Investi :</span> ${formatMontant(totalInvesti)}
        <span class="res-label">Intérêts :</span> ${formatMontant(totalInterets)}
      </div>
    `;
  }

  afficherResultat(html);
  renderChart(labels, datasets);
}

// ─────────────────────────────────────────────────────────────────────────────
// Événements DOM
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // langue
  const sl = localStorage.getItem("lang");
  if (["fr", "en"].includes(sl)) currentLang = sl;
  document.getElementById("lang-select").value = currentLang;

  // thème
  const st = localStorage.getItem("theme");
  applyTheme((["light","dark"].includes(st) ? st : getPreferredTheme()));

  // toggle unité (durée & graphique)
  const saved = localStorage.getItem("chartUnit");
  chartUnit = (saved === "annees") ? "annees" : "mois";
  const tog = document.getElementById("toggle-unit");
  tog.checked = (chartUnit === "annees");
  tog.setAttribute("aria-checked", tog.checked);

  applyTranslations();
  updateDureeToggleLabels();
  renderComptesForm();
});

// switch langue
document.getElementById("lang-select").addEventListener("change", e => {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang);
  applyTranslations();
  renderComptesForm();
});

// toggle thème
document.getElementById("theme-toggle").addEventListener("click", () => {
  applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
});

// ajouter un compte
document.getElementById("ajouter-compte").addEventListener("click", () => {
  saveComptesFromInputs();
  comptes.push({ nom: "", capital: "", versement: "", taux: "" });
  renderComptesForm();
});

// toggle unité change
document.getElementById("toggle-unit").addEventListener("change", e => {
  chartUnit = e.target.checked ? "annees" : "mois";
  localStorage.setItem("chartUnit", chartUnit);
  e.target.setAttribute("aria-checked", e.target.checked);
  updateDureeToggleLabels();
  e.target.setAttribute(
    "aria-label",
    `${translations[currentLang].duree_label} : ${translations[currentLang][chartUnit]}`
  );
  applyTranslations();
  // si déjà calculé, on redraw
  if (chartHistos.length) {
    const { labels, datasets } = generateChartData();
    renderChart(labels, datasets);
    updateAll();
  }
});

// soumission formulaire
document.getElementById("form-simu").addEventListener("submit", e => {
  e.preventDefault();
  updateAll();
});

// TODO : masquer le chart avant le calcul
// TODO : améliorer style initial / investi / intérêts
// TODO : ajouter traduction en initial / investi / intérêts