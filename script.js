// Fonction de calcul capital final (intérêts composés mensuels + versements réguliers)
function calculerEpargne({capitalInitial, versementMensuel, tauxAnnuel, dureeMois}) {
  const tauxMensuel = Math.pow(1 + tauxAnnuel, 1/12) - 1;
  let capital = capitalInitial;
  for (let i = 0; i < dureeMois; i++) {
    capital = capital * (1 + tauxMensuel) + versementMensuel;
  }
  return capital;
}

// Formatage propre du résultat
function formatMontant(valeur) {
  return valeur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
}

// Gestion du formulaire
document.getElementById('form-simu').addEventListener('submit', function(event) {
  event.preventDefault();

  // Récupérer les valeurs
  const capitalInitial = parseFloat(document.getElementById('capital_initial').value) || 0;
  const versementMensuel = parseFloat(document.getElementById('versement_mensuel').value) || 0;
  const tauxAnnuel = (parseFloat(document.getElementById('taux_annuel').value) || 0) / 100;
  const dureeMois = parseInt(document.getElementById('duree_mois').value, 10) || 0;

  // Validation minimaliste
  if (capitalInitial < 0 || versementMensuel < 0 || tauxAnnuel < 0 || dureeMois < 1) {
    afficherResultat('⚠️ Merci de vérifier vos entrées.');
    return;
  }

  // Calcul
  const capitalFinal = calculerEpargne({
    capitalInitial,
    versementMensuel,
    tauxAnnuel,
    dureeMois
  });

  // Affichage du résultat
  afficherResultat(
    `Au bout de <b>${dureeMois}</b> mois, votre épargne serait d’environ <b>${formatMontant(capitalFinal)}</b>.`
  );
});

// Fonction utilitaire pour l’affichage
function afficherResultat(texteHtml) {
  const resDiv = document.getElementById('resultat');
  resDiv.innerHTML = texteHtml;
}
