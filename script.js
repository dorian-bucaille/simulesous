const translations = {
  fr: {
    titre: "Simulesous",
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
      "Projet open-source. Sobre, accessible, respectueux de vos données.",
    github_link: "🐙 Voir sur GitHub",
  },
  en: {
    titre: "Simulesous",
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
    footer_text: "Open-source project. Minimal, accessible, data-friendly.",
    github_link: "🐙 See on GitHub",
  },
};

let currentLang = "fr";

// Fonction pour appliquer la traduction sur tous les éléments marqués [data-i18n]
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const trad = translations[currentLang][key];
    if (typeof trad === "string") {
      el.innerHTML = trad;
      // Si meta
      if (el.tagName === "TITLE" || el.tagName === "META") {
        el.textContent = trad;
      }
    }
  });
}

// Fonction de calcul capital final (intérêts composés mensuels + versements réguliers)
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

// Formatage propre du résultat
function formatMontant(valeur) {
  return valeur.toLocaleString(currentLang === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
}

// Gestion du formulaire
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

// Affichage du résultat dans la zone aria-live
function afficherResultat(texteHtml) {
  const resDiv = document.getElementById("resultat");
  resDiv.innerHTML = texteHtml;
}

// Changement de langue
document.getElementById("lang-select").addEventListener("change", function (e) {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang); // Sauvegarde
  applyTranslations();
  afficherResultat("");
});

// Appliquer la traduction au chargement
window.addEventListener("DOMContentLoaded", () => {
  // Vérifie si une langue a été sauvegardée
  const savedLang = localStorage.getItem("lang");

  if (savedLang === "fr" || savedLang === "en") {
    currentLang = savedLang;
    document.getElementById("lang-select").value = savedLang;
  } else {
    // Sinon, détecte la langue du navigateur
    const userLang = navigator.language || navigator.userLanguage || "fr";
    if (userLang.startsWith("en")) {
      currentLang = "en";
      document.getElementById("lang-select").value = "en";
    } else if (userLang.startsWith("fr")) {
      currentLang = "fr";
      document.getElementById("lang-select").value = "fr";
    }
  }

  applyTranslations();
});
