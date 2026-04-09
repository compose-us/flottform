# Flottform Browser Extension

Connect a secondary device through a QR code to allow it to fill in form fields like text and file inputs.

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v8+ (`corepack enable` to activate)
- Google Chrome

### Build

```bash
# 1. Clone the repo and switch to the extension branch
git clone https://github.com/compose-us/flottform.git
cd flottform
git checkout extension-redesign

# 2. (Optional) Only if you want to run the signaling server locally.
#    For testing you can skip this — the extension uses the public demo server (demo.flottform.io) by default.
#    Credentials are in 1Password under "flottform".
cp servers/signaling-server/.env.example servers/signaling-server/.env

# 3. Install all dependencies
pnpm install

# 4. Build the extension (this also builds the @flottform/forms dependency automatically)
cd servers/chrome-extension
pnpm run build
```

The built extension will be in `servers/chrome-extension/build/`.


### Load in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `servers/chrome-extension/build/` folder
5. The Flottform icon appears in the toolbar — click it to open the popup

### Configuration (optional)

On first install the options page opens automatically. The default settings point to the public demo server (`demo.flottform.io`) — no configuration needed for testing.

If you want to use your own TURN server, enter the metered.ca endpoint URL in the options page.

### Development

```bash
cd servers/chrome-extension
pnpm run dev
```

After making changes, re-run `pnpm run build` and click the reload icon on `chrome://extensions` to update the extension.

---

## Lokale Installation (Deutsch)

### Voraussetzungen

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v8+ (`corepack enable` zum Aktivieren)
- Google Chrome

### Build

```bash
# 1. Repo klonen und auf den Extension-Branch wechseln
git clone https://github.com/compose-us/flottform.git
cd flottform
git checkout extension-redesign

# 2. (Optional) Nur nötig, wenn der Signaling-Server lokal laufen soll.
#    Zum Testen kann dieser Schritt übersprungen werden — die Extension nutzt standardmäßig den öffentlichen Demo-Server (demo.flottform.io).
#    Zugangsdaten liegen in 1Password unter „flottform".
cp servers/signaling-server/.env.example servers/signaling-server/.env

# 3. Alle Abhängigkeiten installieren
pnpm install

# 4. Extension bauen (baut auch die @flottform/forms-Abhängigkeit automatisch mit)
cd servers/chrome-extension
pnpm run build
```

Die gebaute Extension liegt in `servers/chrome-extension/build/`.


### In Chrome laden

1. `chrome://extensions` in Chrome öffnen
2. **Entwicklermodus** aktivieren (Schalter oben rechts)
3. Auf **Entpackte Erweiterung laden** klicken
4. Den Ordner `servers/chrome-extension/build/` auswählen
5. Das Flottform-Icon erscheint in der Toolbar — anklicken, um das Popup zu öffnen

### Konfiguration (optional)

Beim ersten Installieren öffnet sich automatisch die Einstellungsseite. Die Standardeinstellungen nutzen den öffentlichen Demo-Server (`demo.flottform.io`) — für Tests ist keine Konfiguration nötig.

Wer einen eigenen TURN-Server nutzen möchte, kann die metered.ca-Endpoint-URL in den Einstellungen eintragen.

### Entwicklung

```bash
cd servers/chrome-extension
pnpm run dev
```

Nach Änderungen erneut `pnpm run build` ausführen und auf `chrome://extensions` das Reload-Icon der Extension klicken.
