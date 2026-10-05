# Gloop – instructies voor Claude Code

- Taal van de site: **Nederlands**. Code-commentaar mag Nederlands of Engels.
- Huisstijl: zie `app/globals.css`. Kleuren: Slijm #6BE38A, Druif #6A4BEB, Bubblegum #FF7AC6, Zon #FFD84A,
  Inkt #221A48, Wolk #F4F2FF. Sticker-look: 3px inktrand, harde schaduw `0 6px 0 #221A48`, ronde hoeken.
  Lettertypen: Fredoka (koppen), Nunito (tekst), zelf gehost via @fontsource.
- Games staan in `lib/engine/<id>.js` en exporteren `default start(stage, g, restart)` die een cleanup-functie teruggeeft.
  Gebruik `finishCommon()` uit `lib/engine/common.js` voor het resultaatscherm.
- Spelersdata staat alleen in localStorage (`lib/store.js`, sleutel `gloop:v1`). Er is (nog) geen backend.
  Als je iets toevoegt dat data verstuurt of opslaat, **pas dan ook `lib/content.js` aan** (privacy- en cookieverklaring).
- Sitegegevens staan in `lib/site.js`.
- Controleer na wijzigingen met `npm run build`.
