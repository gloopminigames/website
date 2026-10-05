import {SITE,esc,v,mail} from './site';
import {blob,ICON} from './blob';
const page=(title,body,showDate)=>({title,body,showDate});
const WHO=()=>`${v(SITE.owner,'NAAM EIGENAAR')}${SITE.city?', gevestigd in '+esc(SITE.city):', gevestigd in '+v('','PLAATS')}${SITE.kvk?' (KvK '+esc(SITE.kvk)+')':''}`;
const FONTS_TXT=()=>SITE.selfHostedFonts
  ?'<p>De lettertypen van Gloop staan op onze eigen server. Er gaat daarvoor niets naar derden.</p>'
  :'<p>Voor de lettertypen (Fredoka en Nunito) gebruikt Gloop Google Fonts. Je browser haalt die op bij Google, waarbij je IP-adres en browsergegevens naar Google gaan. Google plaatst hierbij geen cookies. Wil je dit voorkomen, dan kun je een contentblocker gebruiken; de site werkt dan met standaardlettertypen.</p>';

const PAGES={
over:()=>page('Over Gloop',`
  <div class="meet">${blob('#6BE38A','grin','meet-blob')}<div><h2 style="margin-top:0">Maak kennis met Gloopie</h2>
    <p>Gloopie is het vrolijke slijmblobje van Gloop. Nieuwsgierig, een tikje wiebelig en altijd in voor een potje. Je komt Gloopie overal tegen: op de knoppen, in de games en straks in nog veel meer spelletjes.</p></div></div>
  <div class="moods">${[['#6BE38A','happy','Blij'],['#FF7AC6','love','Verliefd'],['#FFD84A','surprised','Verrast'],['#8B6CFF','cool','Cool'],['#5CC8FF','sleepy','Slaperig'],['#FF9F5A','tongue','Ondeugend']].map(x=>`<figure>${blob(x[0],x[1])}<figcaption>${x[2]}</figcaption></figure>`).join('')}</div>
  <p>Gloop is een plek voor korte, vrolijke spelletjes die je in een paar minuten speelt. Geen download, geen account, geen advertenties. Gewoon even een potje.</p>
  <p>Gloop wordt gemaakt door ${WHO()}. Er komen regelmatig nieuwe games bij.</p>
  <h2>Onze uitgangspunten</h2>
  <ul>
    <li><b>Gratis spelen.</b> Alle games zijn gratis te spelen.</li>
    <li><b>Privacy eerst.</b> Geen tracking, geen advertentienetwerken, geen verkoop van gegevens.</li>
    <li><b>Voor iedereen.</b> Geschikt voor jong en oud en te spelen op telefoon, tablet en computer.</li>
    <li><b>Eerlijk.</b> Komen er later betaalde extra's, dan zijn die optioneel en krijg je er nooit een oneerlijk voordeel mee.</li>
  </ul>
  <h2>Credits</h2>
  <p>Ontwerp, games, mascotte Gloopie en code: ${v(SITE.owner,'NAAM EIGENAAR')}. Lettertypen: Fredoka (Milena Brandão) en Nunito (Vernon Adams e.a.), beide onder de SIL Open Font License 1.1.</p>
  <p>Vragen of een leuk game-idee? Kijk bij <a href="/contact">contact</a>.</p>`),

faq:()=>page('Veelgestelde vragen',`
  <details class="faq"><summary>Is Gloop gratis?</summary><p>Ja. Alle games zijn gratis te spelen. Mochten er later betaalde extra's komen, zoals cosmetische items, dan zijn die altijd optioneel en nooit nodig om te spelen of te winnen.</p></details>
  <details class="faq"><summary>Heb ik een account nodig?</summary><p>Nee. Je kunt direct spelen. Accounts komen later, zodat je je records op meerdere apparaten kunt bewaren. Ook dan blijft spelen zonder account mogelijk.</p></details>
  <details class="faq"><summary>Waar worden mijn records bewaard?</summary><p>Alleen in de opslag van je eigen browser. Wis je je browsergegevens of speel je op een ander apparaat, dan begin je opnieuw. Je kunt alles zelf wissen via <a href="/profiel">Profiel</a>.</p></details>
  <details class="faq"><summary>Is Gloop geschikt voor kinderen?</summary><p>Ja. De games bevatten geen geweld, geen chat, geen advertenties en we vragen geen persoonsgegevens. Ben je jonger dan 16 en wil je ons mailen? Vraag dan eerst even je ouder of verzorger.</p></details>
  <details class="faq"><summary>Werkt Gloop op mijn telefoon?</summary><p>Ja, op alle moderne browsers op telefoon, tablet en computer. Installeren is niet nodig.</p></details>
  <details class="faq"><summary>Is een ranglijst eerlijk als ik mijn score kan aanpassen?</summary><p>De huidige ranglijst toont alleen je eigen records op je eigen apparaat. Een wereldwijde ranglijst komt later, met controle op onmogelijke scores.</p></details>
  <details class="faq"><summary>Ik heb een bug gevonden of een idee</summary><p>Leuk! Mail naar ${mail()} en vertel welke game, welk apparaat en wat er gebeurde.</p></details>`),

contact:()=>page('Contact',`
  <div class="box">
    <p><b>${v(SITE.owner,'NAAM EIGENAAR')}</b><br>${SITE.city?esc(SITE.city):v('','PLAATS')}, Nederland${SITE.kvk?'<br>KvK-nummer: '+esc(SITE.kvk):''}</p>
    <p>E-mail: ${mail()}</p>
  </div>
  <p>We reageren meestal binnen enkele werkdagen. Gloop heeft geen telefoonnummer of klantenservice-chat.</p>
  <h2>Waarvoor kun je mailen?</h2>
  <ul>
    <li>Bugs, vragen en ideeën voor nieuwe games</li>
    <li>Privacyverzoeken: zet <b>Privacy</b> in het onderwerp (zie de <a href="/privacy">privacyverklaring</a>)</li>
    <li>Meldingen over auteursrecht of ongepaste inhoud: zet <b>Melding</b> in het onderwerp</li>
    <li>Samenwerking of pers</li>
  </ul>
  ${SITE.email?`<p><a class="btn btn-primary" href="mailto:${esc(SITE.email)}">Stuur een e-mail</a></p>`:''}`),

privacy:()=>page('Privacyverklaring',`
  <div class="box"><p><b>In het kort:</b> Gloop heeft geen accounts, geen tracking en geen advertenties. Je records en spelersnaam blijven op je eigen apparaat. Wij verwerken alleen wat technisch nodig is om de site te tonen en wat je ons zelf mailt.</p></div>
  <h2>1. Wie is verantwoordelijk?</h2>
  <p>Gloop wordt beheerd door ${WHO()}. Dat is de verwerkingsverantwoordelijke volgens de Algemene verordening gegevensbescherming (AVG). Contact: ${mail()}.</p>
  <h2>2. Welke gegevens verwerken we, en waarom?</h2>
  <div class="table-wrap"><table>
    <tr><th>Gegevens</th><th>Doel</th><th>Grondslag</th><th>Bewaartermijn</th></tr>
    <tr><td>Spelersnaam, records, aantal gespeelde potjes, status dagelijkse uitdaging</td><td>Je voortgang tonen</td><td>Staat alleen op je eigen apparaat; wij ontvangen dit niet</td><td>Tot je het wist via Profiel of je browsergegevens</td></tr>
    <tr><td>Technische gegevens: IP-adres, tijdstip, opgevraagde pagina, browsertype</td><td>De site leveren, beveiligen en misbruik tegengaan</td><td>Gerechtvaardigd belang (art. 6 lid 1 f AVG)</td><td>Kort, in de regel maximaal 14 dagen</td></tr>
    <tr><td>Je e-mailadres en wat je ons schrijft</td><td>Je vraag beantwoorden</td><td>Gerechtvaardigd belang, of je verzoek zelf</td><td>Tot je vraag is afgehandeld, maximaal 12 maanden</td></tr>
  </table></div>
  <p>We gebruiken geen analytics, maken geen profielen, nemen geen geautomatiseerde besluiten en verkopen of verhuren nooit gegevens.</p>
  <h2>3. Wie ontvangt gegevens?</h2>
  <p><b>Hosting:</b> de site wordt gehost door ${v(SITE.hosting,'HOSTINGPARTIJ')} (Vercel Inc.). Vercel verwerkt technische gegevens, zoals je IP-adres, namens ons om de site te leveren en te beveiligen.</p>
  <p><b>Database:</b> voor toekomstige functies, zoals accounts en een wereldwijde ranglijst, gebruiken we Supabase. Op dit moment slaan we daar geen gegevens van bezoekers op. Zodra dat verandert, passen we deze verklaring vooraf aan.</p>
  <p><b>Broncode:</b> de code van Gloop staat bij GitHub. Daar worden geen gegevens van bezoekers opgeslagen.</p>
  <p><b>E-mail:</b> voor e-mail gebruiken we Gmail van Google. Berichten die je ons stuurt, worden daarom op servers van Google bewaard.</p>
  ${FONTS_TXT()}
  <p>Sommige van deze partijen zijn (ook) buiten de Europese Economische Ruimte gevestigd, bijvoorbeeld in de Verenigde Staten. Doorgifte gebeurt dan op basis van het EU-VS Data Privacy Framework of standaardcontractbepalingen van de Europese Commissie.</p>
  <h2>4. Kinderen</h2>
  <p>Gloop is ook bedoeld voor kinderen. Daarom vragen we geen persoonsgegevens om te spelen. Ben je jonger dan 16 en wil je contact opnemen? Vraag dan eerst toestemming aan je ouder of verzorger. Een ouder kan ons altijd vragen gegevens van een kind te verwijderen.</p>
  <h2>5. Jouw rechten</h2>
  <p>Je hebt het recht op inzage, correctie, verwijdering, beperking van de verwerking, bezwaar en overdraagbaarheid van je gegevens. Stuur je verzoek naar ${mail()} met <b>Privacy</b> in het onderwerp. We reageren binnen een maand. Gegevens op je eigen apparaat wis je zelf direct via <a href="/profiel">Profiel</a>.</p>
  <p>Ben je het niet eens met hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl" rel="noopener" target="_blank">Autoriteit Persoonsgegevens</a>. We horen het natuurlijk graag eerst zelf.</p>
  <h2>6. Beveiliging</h2>
  <p>De site is alleen bereikbaar via een versleutelde verbinding (HTTPS). We houden onze servers en software up-to-date en geven alleen toegang aan wie dat echt nodig heeft.</p>
  <h2>7. Wijzigingen</h2>
  <p>Voegen we iets toe, zoals accounts, een wereldwijde ranglijst of betalingen, dan passen we deze verklaring vooraf aan. De datum bovenaan laat zien wanneer dat voor het laatst gebeurde.</p>`,true),

cookies:()=>page('Cookieverklaring',`
  <div class="box"><p><b>In het kort:</b> Gloop plaatst zelf geen cookies en gebruikt geen tracking- of advertentiecookies. Daarom zie je ook geen cookiebanner.</p></div>
  <h2>Wat slaan we wel op?</h2>
  <p>Om je records en spelersnaam te onthouden, gebruiken we de lokale opslag van je browser (<i>localStorage</i>). Dat werkt vergelijkbaar met een functionele cookie, maar de gegevens worden niet naar ons verstuurd.</p>
  <div class="table-wrap"><table>
    <tr><th>Naam</th><th>Soort</th><th>Doel</th><th>Bewaard</th></tr>
    <tr><td>gloop:v1</td><td>Lokale opslag, functioneel</td><td>Spelersnaam, records, aantal gespeelde potjes en de dagelijkse uitdaging onthouden</td><td>Tot je het wist</td></tr>
  </table></div>
  <p>Voor functionele opslag die nodig is voor een dienst waar je zelf om vraagt, is volgens de Telecommunicatiewet (artikel 11.7a) geen toestemming nodig.</p>
  <h2>Derden</h2>
  <p>Onze hostingpartij kan een strikt noodzakelijke beveiligingscookie plaatsen om bots en aanvallen te herkennen. Die wordt niet gebruikt om je te volgen.</p>
  ${FONTS_TXT()}
  <h2>Opslag wissen of blokkeren</h2>
  <p>Wis alles in één keer via <a href="/profiel">Profiel</a>, of via de instellingen van je browser. Blokkeer je lokale opslag, dan werken de games nog steeds, maar worden je records niet bewaard.</p>
  <p>Gaan we ooit analytische of andere niet-noodzakelijke cookies gebruiken, dan vragen we eerst je toestemming en passen we deze verklaring aan.</p>`,true),

voorwaarden:()=>page('Gebruiksvoorwaarden',`
  <h2>1. Over deze voorwaarden</h2>
  <p>Deze voorwaarden gelden voor het gebruik van Gloop, beheerd door ${WHO()}. Door Gloop te gebruiken ga je ermee akkoord. Ben je jonger dan 16, lees ze dan samen met je ouder of verzorger.</p>
  <h2>2. Gratis gebruik</h2>
  <p>Gloop en alle games zijn gratis te spelen voor persoonlijk, niet-commercieel gebruik. Je hebt geen account nodig.</p>
  <h2>3. Wat niet mag</h2>
  <ul>
    <li>Scores of de werking van games manipuleren, bijvoorbeeld met scripts, bots of aangepaste code</li>
    <li>De site aanvallen, overbelasten, of proberen toegang te krijgen tot systemen</li>
    <li>Games, afbeeldingen, de mascotte of code kopiëren, verkopen of op een andere site plaatsen zonder onze toestemming</li>
    <li>Gloop gebruiken voor iets wat in strijd is met de wet</li>
  </ul>
  <h2>4. Spelersnamen</h2>
  <p>Kies een bijnaam en geen volledige echte naam. Namen die beledigend, discriminerend of misleidend zijn of die zich voordoen als iemand anders, zijn niet toegestaan. Komt er een openbare ranglijst, dan mogen we zulke namen aanpassen of verwijderen.</p>
  <h2>5. Intellectueel eigendom</h2>
  <p>De naam Gloop, het logo, de mascotte Gloopie, de games, teksten, vormgeving en code zijn eigendom van ${v(SITE.owner,'NAAM EIGENAAR')} en beschermd door het auteursrecht en merkenrecht. Zie ook de <a href="/disclaimer">disclaimer en copyright</a>.</p>
  <h2>6. Beschikbaarheid</h2>
  <p>We doen ons best om Gloop altijd bereikbaar te houden, maar kunnen dat niet garanderen. We mogen games toevoegen, aanpassen of verwijderen en de site tijdelijk offline halen voor onderhoud. Records staan op je eigen apparaat; wij kunnen ze niet terughalen als ze verloren gaan.</p>
  <h2>7. Aansprakelijkheid</h2>
  <p>Gloop wordt aangeboden zoals het is. Voor zover de wet dat toestaat, zijn wij niet aansprakelijk voor schade door het gebruik of het tijdelijk niet beschikbaar zijn van de site, of voor verloren records. Dit beperkt nooit je rechten als consument die de wet je dwingend geeft.</p>
  <h2>8. Betaalde onderdelen in de toekomst</h2>
  <p>Mogelijk komen er later optionele betaalde extra's, zoals cosmetische items. Daarvoor gelden dan aanvullende voorwaarden die je vóór de aankoop te zien krijgt, inclusief informatie over prijzen, betalen en je herroepingsrecht. Spelen blijft gratis.</p>
  <h2>9. Wijzigingen</h2>
  <p>We kunnen deze voorwaarden aanpassen. De nieuwste versie staat altijd op deze pagina, met de datum van de laatste wijziging.</p>
  <h2>10. Toepasselijk recht</h2>
  <p>Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland. Als consument behoud je de bescherming van het recht van het land waar je woont. We lossen problemen natuurlijk het liefst samen op: mail ons via ${mail()}.</p>`,true),

disclaimer:()=>page('Disclaimer en copyright',`
  <h2>Copyright</h2>
  <p>© ${SITE.year} ${v(SITE.owner,'NAAM EIGENAAR')}. Alle rechten voorbehouden.</p>
  <p>Alle inhoud van Gloop, waaronder de naam en het logo, de mascotte Gloopie, de games, illustraties, teksten, vormgeving en broncode, is beschermd door het auteursrecht. Niets hiervan mag zonder schriftelijke toestemming worden gekopieerd, verspreid, aangepast of commercieel gebruikt.</p>
  <p>Je mag gerust naar Gloop linken en schermafbeeldingen van je eigen score delen op sociale media.</p>
  <h2>Werk van anderen</h2>
  <p>Gloop gebruikt de lettertypen Fredoka en Nunito onder de SIL Open Font License 1.1. De rechten daarop liggen bij hun makers.</p>
  <p>Gloop is niet verbonden aan andere merken, bedrijven of spellen met een vergelijkbare naam. Namen van nog niet verschenen games zijn werktitels en kunnen veranderen.</p>
  <h2>Melding van inbreuk</h2>
  <p>Denk je dat iets op Gloop inbreuk maakt op jouw rechten? Mail ons via ${mail()} met <b>Melding</b> in het onderwerp. Vermeld om welke inhoud het gaat en waarom. We bekijken iedere melding zorgvuldig en halen inhoud zo nodig snel offline.</p>
  <h2>Disclaimer</h2>
  <p>We maken Gloop met zorg, maar kunnen niet garanderen dat alles altijd foutloos, volledig of beschikbaar is. Aan scores, uitdagingen en ranglijsten kun je geen rechten ontlenen. Links naar externe websites zijn ter informatie; wij zijn niet verantwoordelijk voor de inhoud daarvan.</p>`,true),

toegankelijkheid:()=>page('Toegankelijkheid',`
  <p>We willen dat zoveel mogelijk mensen Gloop kunnen spelen. Daarom houden we bij het ontwerp rekening met de richtlijnen van WCAG 2.2, niveau AA.</p>
  <h2>Wat we doen</h2>
  <ul>
    <li>Alles is met het toetsenbord te bedienen, met een duidelijke focusrand</li>
    <li>Voldoende contrast tussen tekst en achtergrond, ook in de donkere modus</li>
    <li>In Memo Mania verschillen de paartjes in kleur én gezichtje, dus ook te spelen als je kleuren slecht onderscheidt</li>
    <li>Animaties staan uit als je apparaat is ingesteld op minder beweging</li>
    <li>Knoppen en kaartjes hebben beschrijvende labels voor schermlezers</li>
  </ul>
  <h2>Bekende beperkingen</h2>
  <p>Reactie Rush draait om snel reageren op een visuele verandering. De tekst verandert mee ("Wacht" wordt "TIK!"), maar het spel is minder geschikt voor mensen die een schermlezer gebruiken.</p>
  <p>Mep de Blob is met aanraken, de muis of de cijfertoetsen 1 tot 9 te spelen (in dezelfde volgorde als een numeriek toetsenblok). Gloopie herken je aan zijn groene kleur, zijn glimlach en het hartje boven zijn hoofd.</p>
  <p>Gloopie Golf is met aanraken, de muis of het toetsenbord te spelen (pijltjes om te richten en de kracht te kiezen, spatie om te slaan).</p>
  <p>Blubber Blast is met aanraken, de muis of het toetsenbord te spelen (alleen: spatie; met z'n tweeën: L en A). Het draait om snel tikken.</p>
  <p>Klikkerklok is met één tik of de spatiebalk te spelen, maar draait om snel reageren op een bewegende wijzer.</p>
  <p>Bubbel Bots is met de muis, met aanraken of met het toetsenbord te spelen (pijltjes om te richten, spatie om te schieten, S om te wisselen). Elke kleur bot heeft dezelfde vorm, dus het spel vraagt wel dat je kleuren kunt onderscheiden.</p>
  <p>Stapelslijm draait om timing: het spel is met één tik of de spatiebalk te spelen, maar vraagt wel dat je de bewegende blokken kunt zien.</p>
  <p>Loop je ergens tegenaan? Laat het ons weten via ${mail()}. We nemen iedere melding mee in de volgende verbeteringen.</p>`,true)
};
export const PAGE_SLUGS=Object.keys(PAGES);
export function getPage(slug){return PAGES[slug]?PAGES[slug]():null;}
