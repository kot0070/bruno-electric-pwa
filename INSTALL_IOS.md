# Install Bruno Electric Estimating on iPhone

Bruno Electric Estimating is a Progressive Web App (PWA). On iPhone it installs from Safari and runs like an app from the Home Screen.

## Requirements

- An **HTTPS** URL for the app (Safari will not offer “Add to Home Screen” for plain `http://` except localhost).
- Safari (Chrome/Firefox on iOS use the system WebKit engine; use Safari for the Add to Home Screen flow).

## Steps

1. Open the app’s **HTTPS** link in **Safari**.
2. Tap the **Share** button (square with an upward arrow).
3. Scroll and tap **Add to Home Screen**.
4. Confirm the name (**Bruno Electric**) and tap **Add**.
5. Open the new Home Screen icon — the app launches fullscreen (standalone) and works offline after the first visit.

## Notes

- Job data is stored on the device (browser localStorage). It is not uploaded to a server.
- After install, you can use the app without a network connection (app shell is cached).
- To update later, open the same HTTPS URL in Safari once while online, then relaunch from the Home Screen.
