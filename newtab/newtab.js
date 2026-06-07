import { initNewtab } from "./modules/init.js";

document.addEventListener("DOMContentLoaded", initNewtab);

// Primeiro cataloga a feature: Consts.js (popup)
// SYNC CheckboxesToStorage -> storage.js
// APLICAR no Popup-> init.js (popup)
// APLICAR na newtab -> settings.js (newtab)

// Verificar se aplica na UI (não é aqui que aplica, é no settings) -> init.js
// Daí pra funcionar perfeitamente é verificar se tem o hot reload/swap, que seria no event-listeners (onde faz on chroms.storage changed)