## Gluco Tracker
A GNOME Shell extension for displaying real-time glucose readings from CGM systems directly in your panel.


## Features
- Real-time glucose monitoring in your GNOME Shell panel
- Trend arrows indicating glucose direction (rising, stable, falling)
- Difference display showing changes since previous reading
- Low and high glucose alerts (coming soon)
- Support for multiple CGM platforms:
  - LibreLink
  - Dexcom (coming soon)
- Customizable panel position (draft)
- Configurable refresh interval
- Secure credential management
- Accessibility support (coming soon)

## Installation

#### Install from extensions.gnome.org (Recommended)
[<img src="resources/ego.svg">](https://extensions.gnome.org/extension/)

#### Manual installation

1. Clone the repository:
```bash
   git clone https://github.com/manuel-g-ferreira/gnome-shell-extension-gluco-tracker.git
```
2. cd into the cloned repository:
```bash
   cd gnome-shell-extension-gluco-tracker
```
3. Run the installation script:
```bash
   npm run install:extension
```
4. Enjoy! 🎉

## Testing

You can test the extension using the following command:

#### Wayland
```bash
   npm run dev:wayland
```

#### X11
```bash
   npm run dev:x11
```

## Mentions

The librelink integration is based on the work of [DRFR0ST](https://github.com/DRFR0ST): [Github repository](https://github.com/DRFR0ST/libre-link-unofficial-api.git)
