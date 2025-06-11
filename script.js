const translations = {
  fr: {
    titre_onglet: "Simulesous",
    titre: "💰 Simulesous",
    meta_description:
      "Simulateur d'épargne accessible, sobre et respectueux de l'environnement.",
    choix_langue: "Choisir la langue",
    aide_form:
      "Entrez vos paramètres pour calculer l’évolution de votre épargne.",
    ajouter_compte: "Ajouter un compte",
    supprimer_compte: "Supprimer",
    nom_compte_label: "Nom du compte",
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
    ajouter_compte: "Add account",
    supprimer_compte: "Delete",
    nom_compte_label: "Account name",
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
  renderComptesForm();
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

  // Ajouter un compte
  document.getElementById("ajouter-compte").onclick = function () {
    saveComptesFromInputs();
    comptes.push({ nom: "", capital: "", versement: "", taux: "" });
    renderComptesForm();
  };

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

let comptes = [{ nom: "", capital: "", versement: "", taux: "" }];

function renderComptesForm() {
  const comptesContainer = document.getElementById("comptes-container");
  comptesContainer.innerHTML = "";
  comptes.forEach((compte, idx) => {
    const bloc = document.createElement("div");
    bloc.className = "compte-form-bloc";
    bloc.innerHTML = `
      <div class="form-group">
        <label data-i18n="nom_compte_label" for="nom_compte_${idx}"></label>
        <input type="text" id="nom_compte_${idx}" name="nom_compte_${idx}" value="${
      compte.nom
    }" maxlength="32" autocomplete="off">
      </div>
      <div class="form-group">
        <label data-i18n="capital_initial_label" for="capital_initial_${idx}"></label>
        <input type="number" id="capital_initial_${idx}" name="capital_initial_${idx}" min="0" step="0.01" required inputmode="decimal" value="${
      compte.capital
    }">
      </div>
      <div class="form-group">
        <label data-i18n="versement_mensuel_label" for="versement_mensuel_${idx}"></label>
        <input type="number" id="versement_mensuel_${idx}" name="versement_mensuel_${idx}" min="0" step="0.01" required inputmode="decimal" value="${
      compte.versement
    }">
      </div>
      <div class="form-group">
        <label data-i18n="taux_annuel_label" for="taux_annuel_${idx}"></label>
        <input type="number" id="taux_annuel_${idx}" name="taux_annuel_${idx}" min="0" step="0.01" required inputmode="decimal" value="${
      compte.taux
    }">
      </div>
      ${
        comptes.length > 1
          ? `<button type="button" class="supprimer-compte" data-idx="${idx}" aria-label="Supprimer" title="Supprimer">×</button>`
          : ""
      }
    `;
    comptesContainer.appendChild(bloc);
  });
  applyTranslations();
  // Ajoute events suppression
  document.querySelectorAll(".supprimer-compte").forEach((btn) => {
    btn.onclick = (e) => {
      saveComptesFromInputs();
      const idx = parseInt(btn.getAttribute("data-idx"));
      comptes.splice(idx, 1);
      renderComptesForm();
    };
  });
}

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

    // Met à jour le tableau des comptes à partir du DOM
    comptes = comptes.map((c, idx) => ({
      nom:
        document.getElementById(`nom_compte_${idx}`).value.trim() ||
        `Compte ${idx + 1}`,
      capital:
        parseFloat(document.getElementById(`capital_initial_${idx}`).value) ||
        0,
      versement:
        parseFloat(document.getElementById(`versement_mensuel_${idx}`).value) ||
        0,
      taux:
        (parseFloat(document.getElementById(`taux_annuel_${idx}`).value) || 0) /
        100,
    }));

    let html = "";
    let total = 0;
    comptes.forEach((compte, idx) => {
      const montant = calculerEpargne({
        capitalInitial: compte.capital,
        versementMensuel: compte.versement,
        tauxAnnuel: compte.taux,
        dureeMois:
          parseInt(
            document.getElementById("duree_mois")
              ? document.getElementById("duree_mois").value
              : "24",
            10
          ) || 24, // ou demander la durée à part
      });
      total += montant;
      html += `<div><b>${compte.nom}</b> : ${formatMontant(montant)}</div>`;
    });

    if (comptes.length > 1) {
      html += `<div style="margin-top:0.8rem"><b>Total</b> : ${formatMontant(
        total
      )}</div>`;
    }
    afficherResultat(html);
  });
function afficherResultat(texteHtml) {
  const resDiv = document.getElementById("resultat");
  resDiv.innerHTML = texteHtml;
}

function saveComptesFromInputs() {
  comptes = comptes.map((c, idx) => ({
    nom: document.getElementById(`nom_compte_${idx}`)?.value.trim() || c.nom,
    capital:
      document.getElementById(`capital_initial_${idx}`)?.value || c.capital,
    versement:
      document.getElementById(`versement_mensuel_${idx}`)?.value || c.versement,
    taux: document.getElementById(`taux_annuel_${idx}`)?.value || c.taux,
  }));
}
