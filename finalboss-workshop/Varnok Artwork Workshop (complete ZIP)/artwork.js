// Preview copies of the SVGs in assets/.
// Data URLs keep the nested SVG images self-contained when opened via file://.
const VarnokArtwork = Object.freeze({
  'brood-mantle/body': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="hood" x2=".15" y2="1"><stop stop-color="#dca9ea"/><stop offset=".34" stop-color="#a568c1"/><stop offset=".73" stop-color="#754381"/><stop offset="1" stop-color="#4b294f"/></linearGradient>
    <linearGradient id="core" x2=".15" y2="1"><stop stop-color="#bd79bf"/><stop offset="1" stop-color="#6b3a77"/></linearGradient>
    <g id="membrane">
      <path d="M11 35C16 22 35 15 53 13c13-2 26 0 39 4l-5 14c-14-3-28-1-40 4L21 55 13 70Z" fill="#895497"/>
      <path d="M13 38C29 17 57 13 86 20l-9 4C49 20 27 33 16 56Z" fill="#e8b9f2"/>
      <path d="M17 61c15-18 32-28 54-31L58 43C36 48 28 61 21 74Z" fill="#b77ac7"/>
      <path d="M18 80c8-14 11-22 29-31l-4 11c-8 5-11 12-12 23l-8 15Z" fill="#6c386f"/>
      <path d="M17 67c7-13 18-23 31-28m-29 40c5-11 12-18 21-23" fill="none" stroke="#e6a3d5" stroke-width="1.8" stroke-linecap="round" opacity=".65"/>
    </g>
  </defs>
  <path d="M96 6c12-3 23 2 34 4 15 2 32 2 45 10 14 8 17 17 15 31-2 13-9 27-14 39l-10 15-30 4c-12-1-24-3-36 1-12-4-24-2-36-1l-30-4-10-15C19 78 12 64 10 51 8 37 11 28 25 20c13-8 30-8 45-10 9-2 16-6 26-4Z" fill="#4a2a54"/>
  <path d="M96 9c13-3 24 3 34 5 19 2 33 4 45 11 10 6 14 16 12 27-4 19-14 42-24 50l-29 4c-11-2-24-2-34 2-10-4-23-4-34-2l-29-4c-10-8-20-31-24-50-2-11 2-21 12-27 12-7 26-9 45-11 10-2 17-6 26-5Z" fill="url(#hood)"/>
  <use href="#membrane"/><use href="#membrane" transform="translate(200) scale(-1 1)"/>
  <path d="M100 10c-13 3-24 14-27 26-4 14-4 27 0 40 4 12 14 24 27 31 13-7 23-19 27-31 4-13 4-26 0-40-3-12-14-23-27-26Z" fill="url(#core)" stroke="#603663" stroke-width="2.5"/>
  <path d="M100 14c-12 7-19 17-21 31 8-10 14-13 21-13s13 3 21 13c-2-14-9-24-21-31Z" fill="#dda2d7"/>
  <path d="M100 34c-10 8-15 19-15 32 0 12 6 25 15 33 9-8 15-21 15-33 0-13-5-24-15-32Z" fill="#6d3b77"/>
  <path d="M100 43c-6 7-9 16-9 23 0 9 3 17 9 23 6-6 9-14 9-23 0-7-3-16-9-23Z" fill="#ae69a2"/>
  <path d="M88 60c4-3 8-4 12-4s8 1 12 4m-22 10c4-2 7-2 10-2s6 0 10 2" stroke="#e099c7" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
`),
  'brood-mantle/eyes': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><g id="e">
    <path d="M-15 0c0-8 7-13 15-13S15-8 15 0 8 13 0 13-15 8-15 0Z" fill="#6c315b"/>
    <ellipse rx="13" ry="11.5" fill="#f5a5c7"/><ellipse rx="9" ry="10" fill="#f9ce9b"/>
    <path d="M0-9c-5 4-5 14 0 19 5-5 5-15 0-19Z" fill="#532c57"/>
    <circle cx="-3.4" cy="-4.5" r="2.3" fill="#fff7dd"/>
  </g></defs>
  <use href="#e" x="48" y="41"/><use href="#e" x="152" y="41"/>
</svg>
`),
  'brood-mantle/seals': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="s" x2=".1" y2="1"><stop stop-color="#a66bac"/><stop offset=".64" stop-color="#874e93"/><stop offset="1" stop-color="#60366e"/></linearGradient>
    <g id="one">
      <path d="M26 40c7-11 17-15 26-13 14 3 20 12 21 23 2 13-2 26 1 40l3 15c-8 4-16 5-28 4l-21-4c-5-12-9-29-7-43Z" fill="url(#s)"/>
      <path d="M26 53c7-7 16-11 26-10 7 1 13 4 19 10-7-2-13-4-20-3-8 0-16 3-23 8Z" fill="#c986be"/>
      <path d="M25 63c9-8 24-11 39-6m-35 15c9-7 21-9 33-7m-29 17c8-5 18-7 26-6m-22 17c5-4 14-6 20-6" fill="none" stroke="#c27db6" stroke-width="2" stroke-linecap="round" opacity=".62"/>
      <path d="M28 58c7-4 16-7 23-6 8 0 13 2 19 5" fill="none" stroke="#683c75" stroke-width="2.4" stroke-linecap="round"/>
    </g>
  </defs>
  <use href="#one"/><use href="#one" transform="translate(200) scale(-1 1)"/>
</svg>
`),
  'brood-mantle/tentacles': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><g id="t">
    <path d="M22 30C8 29 1 41 2 54c1 13 13 21 12 32-1 6-5 9-10 9 8 6 16 2 18-6 4-14-7-23-8-36-1-8 4-13 10-16Z" fill="#8b4995"/>
    <path d="M18 35C6 39 4 50 8 61c4 10 11 17 9 27" fill="none" stroke="#cb7bbc" stroke-width="2.7" stroke-linecap="round"/>
    <path d="M22 56c-6 8-6 15-2 22 4 8 5 20-2 28 6-1 7-5 7-10V59Z" fill="#a960a8"/>
  </g></defs>
  <use href="#t"/><use href="#t" transform="translate(200) scale(-1 1)"/>
</svg>
`),
  'rooted-crown/body': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="shell" x2=".2" y2="1"><stop stop-color="#986ebd"/><stop offset=".57" stop-color="#624c94"/><stop offset="1" stop-color="#42366a"/></linearGradient>
    <linearGradient id="crest" x2=".1" y2="1"><stop stop-color="#d5b5ef"/><stop offset=".52" stop-color="#a989cf"/><stop offset="1" stop-color="#695195"/></linearGradient>
    <g id="s">
      <path d="M17 59c1-20 14-34 27-39 8-3 17-3 26-1l10 16C49 29 31 43 25 63l-2 25Z" fill="#8e72bd"/>
      <path d="M21 52c7-17 19-26 35-28l8 3c-15 2-28 9-37 23Z" fill="#c9aae8"/>
      <path d="M26 73c13-17 24-18 36-16l-6 7c-10 0-17 6-22 16Z" fill="#a783c2"/>
      <path d="M24 91c8-12 18-16 29-17l-5 10c-7 1-13 5-17 10Z" fill="#755e9d"/>
    </g>
  </defs>
  <path d="M100 1c7 10 15 15 28 20l11-17c7 10 10 17 10 23 21-4 35 8 38 21 1 8-2 20-9 34l-4 22-30 5-21-6-23 7-23-7-21 6-30-5-4-22C15 68 12 56 13 48c3-13 17-25 38-21 0-6 3-13 10-23l11 17c13-5 21-10 28-20Z" fill="#44345f"/>
  <path d="M100 5c9 11 18 15 30 20l9-16c5 8 8 16 8 22 18-5 33 5 36 17 1 12-6 25-7 33l-5 21-27 5-21-7-23 8-23-8-21 7-27-5-5-21c-1-8-8-21-7-33 3-12 18-22 36-17 0-6 3-14 8-22l9 16c12-5 21-9 30-20Z" fill="url(#shell)"/>
  <use href="#s"/><use href="#s" transform="translate(200) scale(-1 1)"/>
  <path d="M100 4c6 10 16 15 29 21l-10 13 3 15-10 8 1 20-13 25-13-25 1-20-10-8 3-15-10-13c13-6 23-11 29-21Z" fill="url(#crest)" stroke="#765c9c" stroke-width="2"/>
  <path d="M100 10c-6 13-15 17-23 19 9 4 15 1 23-4 8 5 14 8 23 4-8-2-17-6-23-19Z" fill="#f0d8f5"/>
  <path d="m100 29 13 9-7 13 6 8-12 27-12-27 6-8-7-13Z" fill="#614989"/>
  <path d="m100 34 8 6-6 10 4 11-6 16-6-16 4-11-6-10Z" fill="#cf91c6"/>
  <path d="m100 38 4 3-4 7-4-7Z" fill="#ffe0dc"/>
  <path d="M80 85c7 3 12 8 20 16 8-8 13-13 20-16l-6 12-14 11-14-11Z" fill="#9675b6"/>
</svg>
`),
  'rooted-crown/eyes': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><g id="e">
    <path d="M-15 1c0-7 6-14 15-14S15-6 15 1 9 13 0 13-15 8-15 1Z" fill="#563a73"/>
    <path d="M-13 1c2-8 7-12 13-12S11-7 13 1C10 8 6 11 0 11S-10 8-13 1Z" fill="#f5b1d4"/>
    <path d="M-10 1C-6-10 6-10 10 1 6 10-6 10-10 1Z" fill="#ffdaaa"/>
    <path d="M0-9 4 1 0 9-4 1Z" fill="#54365e"/><circle cx="-3" cy="-4" r="2" fill="#fff0e1"/>
  </g></defs>
  <use href="#e" x="48" y="41"/><use href="#e" x="152" y="41"/>
</svg>
`),
  'rooted-crown/seals': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><linearGradient id="s" x2=".21" y2="1"><stop stop-color="#9478b5"/><stop offset=".6" stop-color="#73599e"/><stop offset="1" stop-color="#533d75"/></linearGradient>
  <g id="one">
    <path d="M28 40c4-10 16-16 31-12 9 2 14 8 16 17l-3 25 5 30c-12 7-27 9-48 4-7-16-8-43-1-64Z" fill="url(#s)"/>
    <path d="M25 56c11-7 17-13 26-13 7 0 15 3 21 9-7-2-15-3-21-2-9 2-15 5-24 10Z" fill="#cf9dcd"/>
    <path d="M27 63c11-4 15-9 22-10 7-1 13 0 21 3" stroke="#513c70" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M26 75c12-11 26-15 39-13l-3 6c-13 0-25 5-33 12Zm5 11c11-8 20-11 29-10l-2 4c-10 2-17 5-25 11Zm4 13c10-7 16-8 23-9l-4 5-13 7Z" fill="#a58abc"/>
  </g></defs>
  <use href="#one"/><use href="#one" transform="translate(200) scale(-1 1)"/>
</svg>
`),
  'rooted-crown/tentacles': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><g id="t">
    <path d="M22 47C6 54 2 66 6 78c3 8 10 10 8 18-1 5-6 7-10 6 7 9 20 3 20-7 0-13-12-14-10-25 1-5 4-8 10-10Z" fill="#76559e"/>
    <path d="M13 62c-7 12 2 21 5 26 2 5 1 10-2 13" fill="none" stroke="#c98bc6" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 64C9 74 2 75 2 68 0 80 11 83 17 75l6-8Z" fill="#9c6eaf"/>
    <path d="M24 78c-6 9-6 18 0 25V78Z" fill="#ae82c0"/>
  </g></defs>
  <use href="#t"/><use href="#t" transform="translate(200) scale(-1 1)"/>
</svg>
`),
  'veil-nautilus/body': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><linearGradient id="v" x2=".2" y2="1"><stop stop-color="#dd95b4"/><stop offset=".36" stop-color="#b2699a"/><stop offset=".7" stop-color="#864f8d"/><stop offset="1" stop-color="#56365d"/></linearGradient>
    <linearGradient id="curl" x2=".6" y2="1"><stop stop-color="#edb0c8"/><stop offset="1" stop-color="#925289"/></linearGradient>
  </defs>
  <path d="M11 61C7 33 24 11 49 6 61 3 75 3 87 8l13-5c10 2 13 7 20 11 17-7 40-7 54 3 12 8 18 20 16 36 0 15-8 26-12 40l-8 13-25 4-20-6-21 6-27-6-19 5-26-5C17 95 20 80 11 61Z" fill="#5c385f"/>
  <path d="M14 59C9 36 26 14 49 9c13-3 28-2 39 3l12-6c8 2 13 8 20 12 15-7 38-8 52 2 11 7 17 19 15 32-1 17-10 31-12 43l-8 9-22 3-20-6-21 7-27-7-19 6-24-5C23 94 22 74 14 59Z" fill="url(#v)"/>
  <path d="M17 53C17 20 45 8 71 8c17 1 30 8 36 21 7 16-4 32-19 32-12 0-21-10-19-20 1-8 8-13 15-11 5 2 6 7 4 10 0-7-9-8-12 0-3 9 6 15 14 14 12-1 16-13 11-23-6-12-22-17-35-17-20 0-40 13-45 38Z" fill="url(#curl)"/>
  <path d="M19 43C27 19 48 10 69 10c12 0 23 5 29 10-17-6-37-4-53 3-11 5-17 12-26 20Z" fill="#f0bad1"/>
  <path d="M112 35c13-18 45-25 64-6 13 13 7 28-1 38 1-17-4-25-15-30-11-5-26-5-48-2Z" fill="#92548d"/>
  <path d="M120 26c16-10 38-12 51 0-14-6-28-5-46 3Zm38 12c16 0 24 16 18 27-1-11-7-18-18-23Z" fill="#d696bc"/>
  <path d="M107 61c7-14 16-19 28-19l-8 12c-7 7-9 14-9 22 0 14-6 23-15 29-7-7-9-15-8-24 1-9 6-15 12-20Z" fill="#b473a1"/>
  <path d="M110 66c-6 8-8 16-7 24m4 10c4-6 5-13 6-20" stroke="#dda0c2" stroke-width="2.3" fill="none" stroke-linecap="round"/>
</svg>
`),
  'veil-nautilus/eyes': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><g id="e">
    <ellipse rx="15" ry="13" fill="#704365"/><ellipse rx="13" ry="11" fill="#ffc6cf"/>
    <ellipse rx="10" ry="8.5" fill="#f5a474"/>
    <path d="M-9 2C-2-5 2-5 9 2 2 8-2 8-9 2Z" fill="#743b63"/>
    <circle cx="-4" cy="-3.5" r="2.3" fill="#fff0d0"/><circle cx="5" cy="1.5" r="1" fill="#fddcc6"/>
  </g></defs>
  <use href="#e" x="48" y="41"/><use href="#e" x="152" y="41"/>
</svg>
`),
  'veil-nautilus/seals': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs><linearGradient id="s" x2=".2" y2="1"><stop stop-color="#b875a3"/><stop offset=".56" stop-color="#945883"/><stop offset="1" stop-color="#6d456d"/></linearGradient></defs>
  <path d="M25 45c6-13 17-20 30-17 14 4 19 17 19 32l-1 25 6 15c-11 8-23 10-43 5-10-6-16-34-11-60Z" fill="url(#s)"/>
  <path d="M127 54c0-14 8-25 21-27 15-3 27 7 31 20 3 14-2 40-5 54-11 7-27 9-48 0l5-15Z" fill="url(#s)"/>
  <path d="M25 61c9-12 17-16 27-15 7 1 11 3 18 8-8-2-13-4-19-2-8 2-15 6-23 13Zm106-6c6-8 13-12 23-12 8 0 15 3 23 9l-1 4c-9-5-16-6-23-6-8 1-15 4-22 8Z" fill="#d990b6"/>
  <path d="M28 66c7-6 12-9 24-12 5-1 11 0 17 3m62 2c15-8 29-9 43-2" fill="none" stroke="#673969" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M30 75c10-9 20-14 31-13l4 3c-12 0-21 4-33 15Zm7 14c9-10 18-13 27-14l1 4c-8 1-16 4-25 13Zm6 12c8-9 16-12 21-12l-1 4-14 10Zm94-34c12-8 24-8 38-3l-2 4c-13-3-24-2-36 3Zm-1 13c10-5 23-6 36-2l-2 4c-11-3-23-2-34 2Zm-1 12c12-5 22-5 34-3l-3 4c-11-2-19-1-30 3Z" fill="#c17fa8"/>
</svg>
`),
  'veil-nautilus/tentacles': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <path d="M21 36C9 37 4 29 5 20c1-6 7-9 11-6-6-9-15-2-15 7-2 14 9 19 10 28 0 10-10 15-10 25 0 9 10 13 11 19 1 6-4 9-8 7 2 7 13 5 15-1 4-12-10-16-10-25 0-8 9-12 11-22l3-8Z" fill="#995585"/>
  <path d="M6 18C2 29 14 37 15 47c2 11-10 17-10 27 0 7 8 11 11 17" fill="none" stroke="#dc82aa" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M185 37c8 1 13 7 13 19 0 15-12 19-12 30 0 7 6 9 11 5-1 10-13 11-17 0-6-14 6-22 6-34 0-6-3-9-9-10Z" fill="#a26099"/>
  <path d="M190 46c7 17-9 24-9 38 0 5 2 10 6 12" fill="none" stroke="#e095b9" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M179 47c10 15 11 24 5 37-4 8-4 15 0 22-7-3-9-10-8-18V49Z" fill="#ba74aa"/>
  <path d="M196 70c6 9 3 15-3 18 4-8 0-9-2-11Z" fill="#cb82ab"/>
</svg>
`),
  'rooted-crown/body-predatory': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="shell" x2=".16" y2="1">
      <stop stop-color="#65517d"/><stop offset=".42" stop-color="#3e3057"/><stop offset="1" stop-color="#211a32"/>
    </linearGradient>
    <linearGradient id="crest" x2=".2" y2="1">
      <stop stop-color="#847097"/><stop offset=".38" stop-color="#57436f"/><stop offset="1" stop-color="#30233f"/>
    </linearGradient>
    <linearGradient id="brow" x2="0" y2="1">
      <stop stop-color="#776087"/><stop offset=".5" stop-color="#4e3b65"/><stop offset="1" stop-color="#261a35"/>
    </linearGradient>
    <g id="plates">
      <!-- Shoulder horn and the dark facet behind the brow. -->
      <path d="M52 26 61 4 68 19 84 26 75 38 67 32 51 31Z" fill="#5b466e"/>
      <path d="M53 25 61 4 62 20 69 25 61 22Z" fill="#8b749a"/>
      <path d="m65 8 8 14 11 4-9 12-7-6 4-6Z" fill="#30233f"/>
      <!-- Recess between the cheek plates and the scythe-shaped lower armor. -->
      <path d="m17 52 14 4 21 4 19-8-8 17-17 17-14 3-9-6 6-10-9 1Z" fill="#21182f"/>
      <path d="m20 54 9 6 16 5 21-6-10 11-17 11-14 6 6-12-9 2 5-10Z" fill="#59456f"/>
      <path d="m29 60 16 5 21-6-13 7-9 3-11-4Z" fill="#776185"/>
      <path d="m24 91 22-9 13-13 17-8-7 15-16 15-16 6-12 6 6-10Z" fill="#463556"/>
      <path d="m31 92 14-7 13-13 12-7-10 13-14 10Z" fill="#665177"/>
      <path d="m34 99 21-8 20-14-7 18-14 9-8-4-16 5Z" fill="#322540"/>
      <path d="m67 60 12-16 7 9-5 22-13 21 5-21-10 7Z" fill="#1b1428"/>
      <!-- The brow falls toward the center. Its point sits beside the eye well. -->
      <path d="m23 31 8-9 15-1 21 9 8 10-6 11-5 8-14 3-18-4-10-10Z" fill="#170f23"/>
      <path d="m19 34 10-16 15 1 17 7 13 10-5 11-7-12-12-6-16-4-8 4Z" fill="#21162d"/>
      <path d="m20 32 10-15 14 2 17 7 12 9-5 7-7-9-11-6-17-4-8 4Z" fill="url(#brow)"/>
      <path d="m24 26 6-9 14 2 17 7 10 8-13-7-14-5-13-2Z" fill="#8a729c"/>
    </g>
  </defs>
  <path d="M100 0 115 14 130 22 140 2 150 15 151 25 168 24 179 31 188 44 180 59 185 58 178 76 171 80 178 81 172 96 173 104 157 100 145 108 137 103 122 107 116 103 100 110 84 103 78 107 63 103 55 108 43 100 27 104 28 96 22 81 29 80 22 76 15 58 20 59 12 44 21 31 32 24 49 25 50 15 60 2 70 22 85 14Z" fill="#191221"/>
  <path d="M100 3 114 17 131 26 140 5 147 17 148 29 166 27 177 34 184 44 176 61 181 61 175 74 167 80 173 83 169 94 169 100 156 97 145 105 137 100 122 104 116 99 100 107 84 99 78 104 63 100 55 105 44 97 31 100 31 94 27 83 33 80 25 74 19 61 24 61 16 44 23 34 34 27 52 29 53 17 60 5 69 26 86 17Z" fill="url(#shell)"/>
  <use href="#plates"/><use href="#plates" transform="translate(200) scale(-1 1)"/>
  <!-- Keep the central spear crest and split planes. -->
  <path d="m100 1 14 16 16 8-12 15 5 13-10 10 1 18-14 26-14-26 1-18-10-10 5-13-12-15 16-8Z" fill="url(#crest)" stroke="#271e35" stroke-linejoin="round"/>
  <path d="m100 3 4 18 21 6-11 5-14-7-16 7-9-5 16-8Z" fill="#7d6991"/>
  <path d="m100 24 14 13-8 14 7 9-13 34-13-34 7-9-8-14Z" fill="#251a34"/>
  <path d="m100 28 8 11-6 13 5 10-7 24-7-24 5-10-6-13Z" fill="#5f486e"/>
  <path d="m100 28 1 23-2 12 1 21-4-22 2-10-4-13Z" fill="#7a5b86"/>
</svg>
`),
  'rooted-crown/eyes-predatory': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="amber" x2="0" y2="1">
      <stop stop-color="#bb6a19"/><stop offset=".37" stop-color="#ffce48"/><stop offset=".62" stop-color="#ffb92d"/><stop offset="1" stop-color="#d47716"/>
    </linearGradient>
    <g id="eye">
      <!-- The animated eyelid masks the amber field. Leave the full aperture colored. -->
      <rect x="-15" y="-13" width="30" height="26" fill="url(#amber)"/>
      <path d="M-15 0-9-6-10-1-15 4Zm30 0-5-5 1 5 4 4Z" fill="#a85512" opacity=".48"/>
      <path d="M0-5 2.4 1 1.9 7 0 11-1.9 7-2.4 1Z" fill="#201321"/>
      <path d="m-6-4 1.2-.7-.4 4.1-.9.7Z" fill="#ffdf7a" opacity=".63"/>
    </g>
  </defs>
  <use href="#eye" x="48" y="41"/><use href="#eye" transform="translate(152 41) scale(-1 1)"/>
</svg>
`),
  'rooted-crown/body-maw': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="shell" x2=".16" y2="1">
      <stop stop-color="#65517d"/><stop offset=".42" stop-color="#3e3057"/><stop offset="1" stop-color="#211a32"/>
    </linearGradient>
    <linearGradient id="crest" x2=".2" y2="1">
      <stop stop-color="#847097"/><stop offset=".38" stop-color="#57436f"/><stop offset="1" stop-color="#30233f"/>
    </linearGradient>
    <linearGradient id="brow" x2="0" y2="1">
      <stop stop-color="#776087"/><stop offset=".5" stop-color="#4e3b65"/><stop offset="1" stop-color="#261a35"/>
    </linearGradient>
    <linearGradient id="throat" x2=".12" y2="1">
      <stop stop-color="#100b15"/><stop offset=".62" stop-color="#09060c"/><stop offset="1" stop-color="#1c111b"/>
    </linearGradient>
    <linearGradient id="ivory" x2=".8" y2=".35">
      <stop stop-color="#817568"/><stop offset=".48" stop-color="#b4a591"/><stop offset="1" stop-color="#928273"/>
    </linearGradient>
    <g id="plates">
      <!-- Shoulder horn and the dark facet behind the brow. -->
      <path d="M52 26 61 4 68 19 84 26 75 38 67 32 51 31Z" fill="#5b466e"/>
      <path d="M53 25 61 4 62 20 69 25 61 22Z" fill="#8b749a"/>
      <path d="m65 8 8 14 11 4-9 12-7-6 4-6Z" fill="#30233f"/>
      <!-- Recess between the cheek plates and the scythe-shaped lower armor. -->
      <path d="m17 52 14 4 21 4 19-8-8 17-17 17-14 3-9-6 6-10-9 1Z" fill="#21182f"/>
      <path d="m20 54 10 5 15 6 28-11-8 13-10 5-17 9-13 6 6-12-9 2 5-10Z" fill="#59456f"/>
      <path d="m29 59 16 6 28-11-16 11-13 4-11-4Z" fill="#776185"/>
      <path d="m24 91 22-9 13-13 21-7-9 17-16 10-18 8-12 6 6-10Z" fill="#463556"/>
      <path d="m31 92 14-7 13-13 12-7-10 13-14 10Z" fill="#665177"/>
      <path d="m34 99 21-8 20-14-7 18-14 9-8-4-16 5Z" fill="#322540"/>
      <path d="m66 59 12-18 8 11-4 13-11 10-8 13 6-19-9 7Z" fill="#1b1428"/>
      <!-- The brow falls toward the center. Its point sits beside the eye well. -->
      <path d="m23 31 8-9 15-1 21 9 8 10-6 11-5 8-14 3-18-4-10-10Z" fill="#170f23"/>
      <path d="m19 34 10-16 15 1 17 7 17 13-5 13-10-15-13-8-16-4-8 4Z" fill="#21162d"/>
      <path d="m20 32 10-15 14 2 17 7 16 12-5 9-9-12-13-8-17-4-8 4Z" fill="url(#brow)"/>
      <path d="m24 26 6-9 14 2 17 7 14 11-17-10-14-5-13-2Z" fill="#8a729c"/>
      <path d="m26 47 8 7 13 5 15-4-13 8-16-5Z" fill="#30223f"/>
    </g>
  </defs>
  <path d="M100 0 115 14 130 22 140 2 150 15 151 25 168 24 179 31 188 44 180 59 185 58 178 76 171 80 178 81 172 96 173 104 157 100 145 108 137 103 122 107 116 103 100 110 84 103 78 107 63 103 55 108 43 100 27 104 28 96 22 81 29 80 22 76 15 58 20 59 12 44 21 31 32 24 49 25 50 15 60 2 70 22 85 14Z" fill="#191221"/>
  <path d="M100 3 114 17 131 26 140 5 147 17 148 29 166 27 177 34 184 44 176 61 181 61 175 74 167 80 173 83 169 94 169 100 156 97 145 105 137 100 122 104 116 99 100 107 84 99 78 104 63 100 55 105 44 97 31 100 31 94 27 83 33 80 25 74 19 61 24 61 16 44 23 34 34 27 52 29 53 17 60 5 69 26 86 17Z" fill="url(#shell)"/>
  <use href="#plates"/><use href="#plates" transform="translate(200) scale(-1 1)"/>
  <!-- Keep the central spear crest and split planes. -->
  <path d="m100 1 14 16 16 8-12 15 5 13-10 10 1 18-14 26-14-26 1-18-10-10 5-13-12-15 16-8Z" fill="url(#crest)" stroke="#271e35" stroke-linejoin="round"/>
  <path d="m100 3 4 18 21 6-11 5-14-7-16 7-9-5 16-8Z" fill="#7d6991"/>
  <path d="m100 24 14 13-8 14 7 9-13 34-13-34 7-9-8-14Z" fill="#251a34"/>
  <path d="m100 28 8 11-6 13 5 10-7 24-7-24 5-10-6-13Z" fill="#5f486e"/>
  <path d="m100 28 1 23-2 12 1 21-4-22 2-10-4-13Z" fill="#7a5b86"/>
  <!-- Static gape, carved into the lower crest. The shell silhouette stays intact. -->
  <g id="maw">
    <path d="m70 70 12-12 13 4 9-10 15 5 12 13-3 18-10 13-12 4-10-2-8 2-14-13-5-11Z" fill="#39263e"/>
    <path d="m74 70 10-9 12 4 8-9 13 4 11 11-3 15-10 12-10 4-10-2-7 2-11-11-5-11Z" fill="url(#throat)"/>
    <path d="m74 71 10-10 12 4 8-9 13 4 10 10-13-5-11-3-8 6-11-3-9 9Z" fill="#291822"/>
    <path d="m76 85 8 7 11 4 10-3 10 1 10-11-4 9-6 7-10 3-10-2-7 2-11-11Z" fill="#251722"/>
    <g fill="url(#ivory)">
      <path d="M79 67 86 64Q83 76 92 83 81 81 79 67Z"/>
      <path d="M90 65 95 66Q93 70 97 75 91 74 90 65Z"/>
      <path d="M102 61 107 59Q110 67 102 74 105 68 102 61Z"/>
      <path d="M114 63 122 67Q118 80 106 84 113 76 114 63Z"/>
      <path d="M81 92 85 96Q84 88 89 86 84 86 81 92Z"/>
      <path d="M88 95 95 99Q91 89 98 82 90 84 88 95Z"/>
      <path d="M101 98 107 100Q104 95 103 90 100 94 101 98Z"/>
      <path d="M114 96 120 90Q113 87 110 78 108 87 114 96Z"/>
    </g>
    <path d="M81 69Q81 76 86 79M117 67Q115 75 111 79M91 94Q92 88 95 85" fill="none" stroke="#d0bfa8" stroke-opacity=".55" stroke-width=".85" stroke-linecap="round"/>
    <path d="m73 88 11 10 6 4 6-2 8 3-10 2-8-1Z" fill="#59425e"/>
    <path d="m107 104 10-5 10-12-3 10-9 7Z" fill="#4c3753"/>
  </g>
</svg>
`),
  'rooted-crown/body-living': 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="110" viewBox="0 0 200 110">
  <defs>
    <linearGradient id="shell" x2=".16" y2="1">
      <stop stop-color="#65517d"/><stop offset=".42" stop-color="#3e3057"/><stop offset="1" stop-color="#211a32"/>
    </linearGradient>
    <linearGradient id="crest" x2=".2" y2="1">
      <stop stop-color="#847097"/><stop offset=".38" stop-color="#57436f"/><stop offset="1" stop-color="#30233f"/>
    </linearGradient>
    <linearGradient id="brow" x2="0" y2="1">
      <stop stop-color="#776087"/><stop offset=".5" stop-color="#4e3b65"/><stop offset="1" stop-color="#261a35"/>
    </linearGradient>
    <linearGradient id="throat" x2=".12" y2="1">
      <stop stop-color="#100b15"/><stop offset=".62" stop-color="#09060c"/><stop offset="1" stop-color="#1c111b"/>
    </linearGradient>
    <linearGradient id="ivory" x2=".8" y2=".35">
      <stop stop-color="#817568"/><stop offset=".48" stop-color="#b4a591"/><stop offset="1" stop-color="#928273"/>
    </linearGradient>
    <g id="plates">
      <!-- Shoulder horn and the dark facet behind the brow. -->
      <path d="M52 26 61 4 68 19 84 26 75 38 67 32 51 31Z" fill="#5b466e"/>
      <path d="M53 25 61 4 62 20 69 25 61 22Z" fill="#8b749a"/>
      <path d="m65 8 8 14 11 4-9 12-7-6 4-6Z" fill="#30233f"/>
      <!-- Recess between the cheek plates and the scythe-shaped lower armor. -->
      <path d="m17 52 14 4 21 4 19-8-8 17-17 17-14 3-9-6 6-10-9 1Z" fill="#21182f"/>
      <path d="m20 54 10 5 15 6 28-11-8 13-10 5-17 9-13 6 6-12-9 2 5-10Z" fill="#59456f"/>
      <path d="m29 59 16 6 28-11-16 11-13 4-11-4Z" fill="#776185"/>
      <g data-motion="plate">
        <path d="m24 91 22-9 13-13 21-7-9 17-16 10-18 8-12 6 6-10Z" fill="#463556"/>
        <path d="m31 92 14-7 13-13 12-7-10 13-14 10Z" fill="#665177"/>
        <path d="m34 99 21-8 20-14-7 18-14 9-8-4-16 5Z" fill="#322540"/>
      </g>
      <!-- Show a narrow band of tissue along the exposed seam between plates. -->
      <g data-motion="tissue">
        <path d="M28 86C41 84 55 73 64 68C59 78 43 87 30 91L26 90Z" fill="#49334f"/>
        <path d="M30 87C43 84 50 78 58 74C51 81 40 87 30 89Z" fill="#63516e"/>
      </g>
      <path d="m66 59 12-18 8 11-4 13-11 10-8 13 6-19-9 7Z" fill="#1b1428"/>
      <!-- The brow falls toward the center. Its point sits beside the eye well. -->
      <path d="m23 31 8-9 15-1 21 9 8 10-6 11-5 8-14 3-18-4-10-10Z" fill="#170f23"/>
      <path d="m19 34 10-16 15 1 17 7 17 13-5 13-10-15-13-8-16-4-8 4Z" fill="#21162d"/>
      <path d="m20 32 10-15 14 2 17 7 16 12-5 9-9-12-13-8-17-4-8 4Z" fill="url(#brow)"/>
      <path d="m24 26 6-9 14 2 17 7 14 11-17-10-14-5-13-2Z" fill="#8a729c"/>
      <path d="m26 47 8 7 13 5 15-4-13 8-16-5Z" fill="#30223f"/>
    </g>
  </defs>
  <path d="M100 0 115 14 130 22 140 2 150 15 151 25 168 24 179 31 188 44 180 59 185 58 178 76 171 80 178 81 172 96 173 104 157 100 145 108 137 103 122 107 116 103 100 110 84 103 78 107 63 103 55 108 43 100 27 104 28 96 22 81 29 80 22 76 15 58 20 59 12 44 21 31 32 24 49 25 50 15 60 2 70 22 85 14Z" fill="#191221"/>
  <path d="M100 3 114 17 131 26 140 5 147 17 148 29 166 27 177 34 184 44 176 61 181 61 175 74 167 80 173 83 169 94 169 100 156 97 145 105 137 100 122 104 116 99 100 107 84 99 78 104 63 100 55 105 44 97 31 100 31 94 27 83 33 80 25 74 19 61 24 61 16 44 23 34 34 27 52 29 53 17 60 5 69 26 86 17Z" fill="url(#shell)"/>
  <use href="#plates"/><use href="#plates" transform="translate(200) scale(-1 1)"/>
  <!-- Keep the central spear crest and split planes. -->
  <path d="m100 1 14 16 16 8-12 15 5 13-10 10 1 18-14 26-14-26 1-18-10-10 5-13-12-15 16-8Z" fill="url(#crest)" stroke="#271e35" stroke-linejoin="round"/>
  <path d="m100 3 4 18 21 6-11 5-14-7-16 7-9-5 16-8Z" fill="#7d6991"/>
  <path d="m100 24 14 13-8 14 7 9-13 34-13-34 7-9-8-14Z" fill="#251a34"/>
  <path d="m100 28 8 11-6 13 5 10-7 24-7-24 5-10-6-13Z" fill="#5f486e"/>
  <path d="m100 28 1 23-2 12 1 21-4-22 2-10-4-13Z" fill="#7a5b86"/>
  <!-- The dark cavity is fixed. Each jaw carries its own rim and teeth. -->
  <g id="maw">
    <path d="m70 70 12-12 13 4 9-10 15 5 12 13-3 18-10 13-12 4-10-2-8 2-14-13-5-11Z" fill="#39263e"/>
    <path d="m74 70 10-9 12 4 8-9 13 4 11 11-3 15-10 12-10 4-10-2-7 2-11-11-5-11Z" fill="url(#throat)"/>
    <g id="upper-jaw">
      <path d="m74 71 10-10 12 4 8-9 13 4 10 10-13-5-11-3-8 6-11-3-9 9Z" fill="#291822"/>
      <g fill="url(#ivory)">
        <path d="M79 67 86 64Q83 76 92 83 81 81 79 67Z"/>
        <path d="M90 65 95 66Q93 70 97 75 91 74 90 65Z"/>
        <path d="M102 61 107 59Q110 67 102 74 105 68 102 61Z"/>
        <path d="M114 63 122 67Q118 80 106 84 113 76 114 63Z"/>
      </g>
      <path d="M81 69Q81 76 86 79M117 67Q115 75 111 79" fill="none" stroke="#d0bfa8" stroke-opacity=".55" stroke-width=".85" stroke-linecap="round"/>
    </g>
    <path d="m73 88 11 10 6 4 6-2 8 3-10 2-8-1Z" fill="#59425e"/>
    <path d="m107 104 10-5 10-12-3 10-9 7Z" fill="#4c3753"/>
    <g data-motion="lower-jaw">
      <path data-hinge="left" d="M74 71Q74 80 77 86L84 92 80 84Q77 79 74 71Z" fill="#291b2a"/>
      <path data-hinge="right" d="M128 71Q127 80 125 83L119 90 122 82Q126 77 128 71Z" fill="#291b2a"/>
      <path d="m76 85 8 7 11 4 10-3 10 1 10-11-4 9-6 7-10 3-10-2-7 2-11-11Z" fill="#251722"/>
      <g fill="url(#ivory)">
        <path d="M81 92 81.6 93.4 85.8 97.4 85 96Q84 88 89 86 84 86 81 92Z"/>
        <path d="M88 95 89 96.4 95.4 99.55 95 99Q91 89 98 82 90 84 88 95Z"/>
        <path d="M101 98 101.4 99.3 106.5 100.65 107 100Q104 95 103 90 100 94 101 98Z"/>
        <path d="M115 96 114.8 97.2 121 91.1 121 90Q119 85 118 79 112 86 115 96Z"/>
      </g>
      <path d="M91 94Q92 88 95 85" fill="none" stroke="#d0bfa8" stroke-opacity=".55" stroke-width=".85" stroke-linecap="round"/>
      <!-- The front gum overlaps the ivory roots and follows the same hinge as the teeth. -->
      <path data-jaw-part="front-gum" d="M76 85C79 89 80 90 84 92.5C89 95 94 95.7 99 95.4C104 95 110 94.1 115 92.2C119 90.5 122 86.6 125 83.5Q123 91 115 98.7L105 102 95 100.4 88 101.9 77 91Z" fill="#473144"/>
      <path d="M78 88Q80 90.5 84 92.5C89 95 94 95.7 99 95.4C104 95 110 94.1 115 92.2C119 90.5 122 86.6 125 83.5" fill="none" stroke="#75566d" stroke-width=".7" stroke-linecap="round" opacity=".7"/>
    </g>
  </g>
</svg>
`),
});
