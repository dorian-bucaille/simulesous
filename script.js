const translations = {
  fr: {
    titre_onglet: "Simulesous",
    titre: "💰 Simulesous",
    meta_description:
      "Simulateur d'épargne accessible, sobre et respectueux de l'environnement.",
    choix_langue: "Choisir la langue",
    aide_form:
      "Entrez vos paramètres pour calculer l’évolution de votre épargne.",
    capital_initial_label: "Capital initial (€)",
    versement_mensuel_label: "Versement mensuel (€)",
    taux_annuel_label: "Taux annuel (%)",
    duree_mois_label: "Durée (mois)",
    calculer: "Calculer",
    resultat: (mois, montant) =>
      `Au bout de <b>${mois}</b> mois, votre épargne serait d’environ <b>${montant}</b>.`,
    erreur: "⚠️ Merci de vérifier vos entrées.",
    footer_text:
      "Projet open-source. Sobre, accessible, respectueux de vos données.<br><span lang='en'>English version available.</span>",
    github_link: "🐙 Voir sur GitHub",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Basculer le thème",
  },
  en: {
    titre_onglet: "Simulesous",
    titre: "💰 Simulesous",
    meta_description: "Accessible, minimal, eco-friendly savings simulator.",
    choix_langue: "Choose language",
    aide_form: "Enter your parameters to calculate your savings growth.",
    capital_initial_label: "Initial capital (€)",
    versement_mensuel_label: "Monthly deposit (€)",
    taux_annuel_label: "Annual rate (%)",
    duree_mois_label: "Duration (months)",
    calculer: "Calculate",
    resultat: (mois, montant) =>
      `After <b>${mois}</b> months, your savings would be about <b>${montant}</b>.`,
    erreur: "⚠️ Please check your entries.",
    footer_text:
      "Open-source project. Minimal, accessible, data-friendly.<br><span lang='fr'>Version française disponible.</span>",
    github_link: "🐙 View on GitHub",
    theme_light: "☀️",
    theme_dark: "🌙",
    theme_label: "Switch theme",
  },
};

let currentLang = "fr";

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const trad = translations[currentLang][key];
    if (typeof trad === "string") {
      el.innerHTML = trad;
      if (el.tagName === "TITLE" || el.tagName === "META") {
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

// Thème: appliquer ou enlever la classe .dark sur <html>
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  // Stocke la préférence
  localStorage.setItem("theme", theme);
  // Update bouton texte/icon
  applyTranslations();
}

// Détection thème préféré système
function getPreferredTheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

// --- Évènements ---

// Switch de langue
document.getElementById("lang-select").addEventListener("change", function (e) {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang); // Sauvegarde
  applyTranslations();
  afficherResultat("");
});

// Switch manuel light/dark
document.getElementById("theme-toggle").addEventListener("click", function () {
  const theme = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  applyTheme(theme);
});

// --- Appliquer tout au chargement ---
window.addEventListener("DOMContentLoaded", () => {
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
  console.log(theme);
  applyTheme(theme);

  applyTranslations();
});

// --- Calcul du simulateur (inchangé) ---
function calculerEpargne({
  capitalInitial,
  versementMensuel,
  tauxAnnuel,
  dureeMois,
}) {
  const tauxMensuel = Math.pow(1 + tauxAnnuel, 1 / 12) - 1;
  let capital = capitalInitial;
  for (let i = 0; i < dureeMois; i++) {
    capital = capital * (1 + tauxMensuel) + versementMensuel;
  }
  return capital;
}
function formatMontant(valeur) {
  return valeur.toLocaleString(currentLang === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
}
document
  .getElementById("form-simu")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const capitalInitial =
      parseFloat(document.getElementById("capital_initial").value) || 0;
    const versementMensuel =
      parseFloat(document.getElementById("versement_mensuel").value) || 0;
    const tauxAnnuel =
      (parseFloat(document.getElementById("taux_annuel").value) || 0) / 100;
    const dureeMois =
      parseInt(document.getElementById("duree_mois").value, 10) || 0;

    if (
      capitalInitial < 0 ||
      versementMensuel < 0 ||
      tauxAnnuel < 0 ||
      dureeMois < 1
    ) {
      afficherResultat(translations[currentLang].erreur);
      return;
    }

    const capitalFinal = calculerEpargne({
      capitalInitial,
      versementMensuel,
      tauxAnnuel,
      dureeMois,
    });

    afficherResultat(
      translations[currentLang].resultat(dureeMois, formatMontant(capitalFinal))
    );
  });
function afficherResultat(texteHtml) {
  const resDiv = document.getElementById("resultat");
  resDiv.innerHTML = texteHtml;
}
