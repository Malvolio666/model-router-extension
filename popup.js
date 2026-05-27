const toggle = document.getElementById('enableToggle');
const label  = document.getElementById('toggleLabel');

function updateLabel(checked) {
  label.textContent = checked ? 'ON' : 'OFF';
  label.style.color = checked
    ? 'rgba(255,255,255,0.50)'
    : 'rgba(255,255,255,0.22)';
}

// Charger l'état sauvegardé
chrome.storage.local.get(['mrEnabled'], res => {
  const enabled = res.mrEnabled !== false;
  toggle.checked = enabled;
  updateLabel(enabled);
});

// Sauvegarder et propager via storage.onChanged (content.js écoute ce changement)
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  updateLabel(enabled);
  chrome.storage.local.set({ mrEnabled: enabled });
});
