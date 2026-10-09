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
  <p>Gloop is een plek voor korte, vrolijke spelletjes die je in een paar minuten speelt. Geen download, geen advertenties en een account is niet nodig. Gewoon even een potje.</p>
  <p>Gloop en Gloopie worden gemaakt in ${SITE.city?esc(SITE.city):v('','PLAATS')}. Er komen regelmatig nieuwe games bij.</p>
  <h2>Onze uitgangspunten</h2>
  <ul>
    <li><b>Gratis spelen.</b> Alle games zijn gratis te spelen.</li>
    <li><b>Privacy eerst.</b> Geen tracking, geen advertentienetwerken, geen verkoop van gegevens.</li>
    <li><b>Voor iedereen.</b> Geschikt voor jong en oud en te spelen op telefoon, tablet en computer.</li>
    <li><b>Eerlijk.</b> Komen er later betaalde extra's, dan zijn die optioneel en krijg je er nooit een oneerlijk voordeel mee.</li>
  </ul>
  <h2>Credits</h2>
  <p>Ontwerp, games, mascotte Gloopie en code: ${v(SITE.owner,'NAAM EIGENAAR')}, alles eigen werk. Lettertypen: Fredoka (Milena Brandão) en Nunito (Vernon Adams e.a.), beide onder de SIL Open Font License 1.1.</p>
  <p>Vragen of een leuk game-idee? Kijk bij <a href="/contact">contact</a>.</p>`),

faq:()=>page('Veelgestelde vragen',`
  <details class="faq"><summary>Is Gloop gratis?</summary><p>Ja. Alle games zijn gratis te spelen. Mochten er later betaalde extra's komen, zoals cosmetische items, dan zijn die altijd optioneel en nooit nodig om te spelen of te winnen.</p></details>
  <details class="faq"><summary>Heb ik een account nodig?</summary><p>Nee. Je kunt direct spelen. Met een account bewaar je je records en speel je op elk apparaat verder. Je hebt alleen een spelersnaam en een pincode van 4 of 6 cijfers nodig, geen e-mailadres.</p></details>
  <details class="faq"><summary>Waar worden mijn records bewaard?</summary><p>Zonder account alleen in de opslag van je eigen browser. Wis je je browsergegevens of speel je op een ander apparaat, dan begin je opnieuw. Met een account bewaren we je records ook bij je account. Je kunt alles zelf wissen via <a href="/profiel">Profiel</a>.</p></details>
  <details class="faq"><summary>Ik ben mijn pincode vergeten</summary><p>Omdat we geen e-mailadres vragen, kunnen we je pincode niet terugsturen. Maak gewoon een nieuw account met een andere naam. Wil je het oude account laten verwijderen? Laat je ouder of verzorger ons mailen via ${mail()} met de spelersnaam en <b>Privacy</b> in het onderwerp.</p></details>
  <details class="faq"><summary>Is Gloop geschikt voor kinderen?</summary><p>Ja. De games bevatten geen geweld, geen chat en geen advertenties. Voor een account vragen we alleen een bijnaam en een pincode, geen e-mailadres of echte naam. Ben je jonger dan 16? Vraag dan je ouder of verzorger of je een account mag maken of ons mag mailen.</p></details>
  <details class="faq"><summary>Hoe verdien ik stickers?</summary><p>Gewoon door te spelen! Je krijgt stickers voor bijvoorbeeld je eerste potje, voor elke game 10 keer spelen en voor knappe scores. Je ziet ze in het stickerboek op <a href="/profiel#stickers">Profiel</a>. Met een account kun je met stickers ook spulletjes voor je eigen Gloop vrijspelen, zoals een petje of een kroon. Je kunt nooit iets kopen.</p></details>
  <details class="faq"><summary>Wie is de Maker van Gloop?</summary><p>Zie je bij de Gloop Kampioenen een Gloop met een paarse hoge hoed en het labeltje <b>Maker van Gloop</b>? Dat is de maker van deze site. Alleen die kan de Makershoed dragen; je kunt hem niet verdienen of kopen.</p></details>
  <details class="faq"><summary>Wat zijn Gloopmunten?</summary><p>Na elk potje krijg je Gloopmunten, en extra bij een record, de dagelijkse uitdaging of een nieuwe sticker. In de <a href="/winkel">Gloop-winkel</a> koop je daarmee bijzondere gezichtjes, spulletjes en achtergronden voor je Gloop. Munten kun je nooit kopen met echt geld: alleen door te spelen. Er staan dus ook geen betalingen of advertenties op Gloop.</p></details>
  <details class="faq"><summary>Wat zijn stickeralbums?</summary><p>Het stickerboek heeft albums met een thema, zoals Ruimte, Halloween, Sinterklaas en Kerst. Maak je een album helemaal vol, dan krijgt je Gloop een speciaal spulletje, zoals een ruimtehelm, heksenhoed, mijter of kerstmuts. Seizoensstickers (zoals Halloween, Sinterklaas en Kerst) kun je alleen in die periode verdienen, maar ze komen elk jaar terug. Staat er bij een album <i>Binnenkort</i>? Dan blijven de stickers een verrassing tot het seizoen begint. Stickers die je al hebt, houd je altijd.</p></details>
  <details class="faq"><summary>Wat betekenen Makkelijk, Normaal en Moeilijk?</summary><p>Bij veel games kies je hoe moeilijk het is. 🌱 Makkelijk is fijn voor jonge kinderen, 🔥 Moeilijk is voor echte kanjers. Elk niveau heeft zijn eigen records en een eigen wereldranglijst. Kies het niveau al vóór de uitleg: op Makkelijk gaat de uitleg vanzelf langzamer. Je kunt het tempo ook zelf aanpassen met <b>🐢 Langzamer</b>. Het niveau verander je later via het tandwiel ⚙️; dan begin je een nieuw potje.</p></details>
  <details class="faq"><summary>Mijn kind kan nog niet lezen. Kan het toch spelen?</summary><p>Ja! De eerste keer dat je een game speelt, krijg je een korte uitleg met bewegende plaatjes en een wijzend handje. Je oefent meteen zelf, en Gloop laat zien wat je moet doen. Wil je de uitleg nog een keer zien? Tik op het tandwiel ⚙️ bij de game en kies <b>Uitleg bekijken</b>.</p></details>
  <details class="faq"><summary>Kan ik Gloop als app installeren?</summary><p>Ja! Op Android, en op de computer met Chrome of Edge, zie je de knop <b>Installeren</b> (of <b>Gloop als app</b> onderaan de pagina). Op een iPhone of iPad tik je op <b>Deel</b> en kies je <b>Zet op beginscherm</b>; op een Mac met Safari kies je <b>Archief → Voeg toe aan Dock</b>. Gloop staat dan tussen je apps, met Gloopie als icoontje. Games die je al eens hebt geopend, werken dan ook zonder internet. Je hebt geen app store nodig. Updates komen vanzelf: zie je <b>Er is een nieuwe versie van Gloop</b>, tik dan op <b>Vernieuwen</b>.</p></details>
  <details class="faq"><summary>Werkt Gloop op mijn telefoon?</summary><p>Ja, op alle moderne browsers op telefoon, tablet en computer. Installeren is niet nodig.</p></details>
  <details class="faq"><summary>Hoe kom ik bij de Gloop Kampioenen?</summary><p>Maak een account en speel! Je beste score per game komt dan vanzelf op de wereldranglijst, de <a href="/ranglijst">Gloop Kampioenen</a>, met alleen je spelersnaam. Wil je er niet op? Zet het uit in <a href="/profiel">Profiel</a>.</p></details>
  <details class="faq"><summary>Is de ranglijst eerlijk?</summary><p>We controleren scores op wat in een game echt mogelijk is. Zien we valsspelen of een ongepaste naam, dan halen we die speler van de ranglijst.</p></details>
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
  <div class="box"><p><b>In het kort:</b> Gloop heeft geen tracking en geen advertenties. Zonder account blijven je records en spelersnaam op je eigen apparaat. Maak je een account, dan bewaren we alleen je spelersnaam, een versleutelde versie van je pincode en je records. We vragen nooit om een e-mailadres of je echte naam.</p></div>
  <h2>1. Wie is verantwoordelijk?</h2>
  <p>${WHO()}, is de verwerkingsverantwoordelijke volgens de Algemene verordening gegevensbescherming (AVG). Contact: ${mail()}.</p>
  <h2>2. Welke gegevens verwerken we, en waarom?</h2>
  <div class="table-wrap"><table>
    <tr><th>Gegevens</th><th>Doel</th><th>Grondslag</th><th>Bewaartermijn</th></tr>
    <tr><td>Zonder account: spelersnaam, records, aantal gespeelde potjes, status dagelijkse uitdaging</td><td>Je voortgang tonen</td><td>Staat alleen op je eigen apparaat; wij ontvangen dit niet</td><td>Tot je het wist via Profiel of je browsergegevens</td></tr>
    <tr><td>Account: spelersnaam, versleutelde pincode (wij kunnen je pincode niet zien), je gekozen Gloop (kleur, gezichtje en spulletje), records per niveau, stickers, Gloopmunten en gekochte dingen uit de Gloop-winkel, aantal gespeelde potjes (ook per seizoensthema, zoals Halloween), status dagelijkse uitdaging, datum van aanmaken en laatste gebruik</td><td>Je account aanbieden en je voortgang op elk apparaat bewaren</td><td>Uitvoering van de dienst waar je zelf om vraagt (art. 6 lid 1 b AVG). Ben je jonger dan 16, dan alleen met toestemming van je ouder of verzorger</td><td>Tot je je account verwijdert via Profiel. Accounts die ruim een jaar (400 dagen) niet zijn gebruikt, verwijderen we automatisch</td></tr>
    <tr><td>Wereldranglijst (Gloop Kampioenen): spelersnaam, je gekozen Gloop en beste score per game</td><td>Laten zien wie de beste is. Deze gegevens zijn voor iedereen op de site zichtbaar</td><td>Uitvoering van de dienst. Staat standaard aan bij een account; je zet het zelf uit in Profiel</td><td>Zolang je account bestaat en je het niet uitzet</td></tr>
    <tr><td>Inlogsessie: een willekeurige code in een cookie</td><td>Onthouden dat je bent ingelogd</td><td>Uitvoering van de dienst</td><td>60 dagen, of tot je uitlogt</td></tr>
    <tr><td>Beheer: het beheer van Gloop kan spelersnamen, je Gloop, records, aantal gespeelde potjes en de datum van aanmaken en laatste gebruik bekijken</td><td>De ranglijst eerlijk en de site veilig houden: ongepaste namen aanpassen, valse scores weghalen, spelers verbergen of accounts verwijderen. Een weggehaalde score onthouden we, zodat die niet terugkomt</td><td>Gerechtvaardigd belang (art. 6 lid 1 f AVG)</td><td>Zolang je account bestaat</td></tr>
    <tr><td>Inlogpogingen: spelersnaam en IP-adres</td><td>Voorkomen dat iemand je pincode raadt of veel nep-accounts maakt</td><td>Gerechtvaardigd belang (art. 6 lid 1 f AVG)</td><td>Maximaal 1 uur</td></tr>
    <tr><td>Technische gegevens: IP-adres, tijdstip, opgevraagde pagina, browsertype</td><td>De site leveren, beveiligen en misbruik tegengaan</td><td>Gerechtvaardigd belang (art. 6 lid 1 f AVG)</td><td>Kort, in de regel maximaal 14 dagen</td></tr>
    <tr><td>Je e-mailadres en wat je ons schrijft</td><td>Je vraag beantwoorden</td><td>Gerechtvaardigd belang, of je verzoek zelf</td><td>Tot je vraag is afgehandeld, maximaal 12 maanden</td></tr>
  </table></div>
  <p>Geluidjes in de games worden in je browser zelf gemaakt; daarvoor gaat niets naar een server.</p>
  <p>We gebruiken geen analytics, maken geen profielen, nemen geen geautomatiseerde besluiten en verkopen of verhuren nooit gegevens.</p>
  <h2>3. Wie ontvangt gegevens?</h2>
  <p><b>Hosting:</b> de site wordt gehost door ${v(SITE.hosting,'HOSTINGPARTIJ')} (Vercel Inc.). Vercel verwerkt technische gegevens, zoals je IP-adres, namens ons om de site te leveren en te beveiligen.</p>
  <p><b>Database:</b> accounts worden opgeslagen bij Supabase, in een datacenter binnen de Europese Unie. Supabase verwerkt deze gegevens namens ons. Alleen de server van Gloop heeft toegang tot de database.</p>
  <p><b>Broncode:</b> de code van Gloop staat bij GitHub. Daar worden geen gegevens van bezoekers opgeslagen.</p>
  <p><b>E-mail:</b> voor e-mail gebruiken we Gmail van Google. Berichten die je ons stuurt, worden daarom op servers van Google bewaard.</p>
  ${FONTS_TXT()}
  <p>Sommige van deze partijen zijn (ook) buiten de Europese Economische Ruimte gevestigd, bijvoorbeeld in de Verenigde Staten. Doorgifte gebeurt dan op basis van het EU-VS Data Privacy Framework of standaardcontractbepalingen van de Europese Commissie.</p>
  <h2>4. Kinderen</h2>
  <p>Gloop is ook bedoeld voor kinderen. Daarom kun je spelen zonder account, en vragen we voor een account zo weinig mogelijk: een bijnaam en een pincode. Geen e-mailadres, geen echte naam, geen leeftijd en geen foto. Op de wereldranglijst tonen we alleen de spelersnaam en scores, nooit iets anders. Ben je jonger dan 16? Dan mag je alleen een account maken of contact opnemen als je ouder of verzorger dat goed vindt. Een ouder kan ons altijd vragen een account of andere gegevens van een kind te verwijderen.</p>
  <h2>5. Jouw rechten</h2>
  <p>Je hebt het recht op inzage, correctie, verwijdering, beperking van de verwerking, bezwaar en overdraagbaarheid van je gegevens. Stuur je verzoek naar ${mail()} met <b>Privacy</b> in het onderwerp. We reageren binnen een maand. Gegevens op je eigen apparaat en je account wis je zelf direct via <a href="/profiel">Profiel</a>.</p>
  <p>Ben je het niet eens met hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl" rel="noopener" target="_blank">Autoriteit Persoonsgegevens</a>. We horen het natuurlijk graag eerst zelf.</p>
  <h2>6. Beveiliging</h2>
  <p>De site is alleen bereikbaar via een versleutelde verbinding (HTTPS). Pincodes slaan we alleen versleuteld op (met scrypt), zodat ook wij ze niet kunnen lezen. Na een paar foute inlogpogingen moet je even wachten, zodat niemand een pincode kan raden. We houden onze servers en software up-to-date en geven alleen toegang aan wie dat echt nodig heeft.</p>
  <h2>7. Wijzigingen</h2>
  <p>Voegen we iets nieuws toe, zoals betalingen, dan passen we deze verklaring vooraf aan. De datum bovenaan laat zien wanneer dat voor het laatst gebeurde.</p>`,true),

cookies:()=>page('Cookieverklaring',`
  <div class="box"><p><b>In het kort:</b> Gloop gebruikt geen tracking- of advertentiecookies. Alleen als je inlogt, plaatsen we één functionele cookie om te onthouden dat je bent ingelogd. Daarom zie je ook geen cookiebanner.</p></div>
  <h2>Wat slaan we wel op?</h2>
  <p>Om je records en spelersnaam te onthouden, gebruiken we de lokale opslag van je browser (<i>localStorage</i>). Dat werkt vergelijkbaar met een functionele cookie. Zonder account worden deze gegevens niet naar ons verstuurd; met een account bewaren we je records ook bij je account. Log je in, dan plaatsen we daarnaast een inlogcookie.</p>
  <div class="table-wrap"><table>
    <tr><th>Naam</th><th>Soort</th><th>Doel</th><th>Bewaard</th></tr>
    <tr><td>gloop:v1</td><td>Lokale opslag, functioneel</td><td>Spelersnaam, records, aantal gespeelde potjes, de dagelijkse uitdaging, je stickers (en hoeveel potjes je speelde tijdens een seizoensthema), je Gloopmunten en wat je in de Gloop-winkel hebt gekocht, welke uitleg, startschermen en nieuwtjes je al hebt gezien, je gekozen niveau per game en of het geluid aan staat onthouden</td><td>Tot je het wist of uitlogt</td></tr>
    <tr><td>gloop-… (cache)</td><td>Opslag van de app, functioneel</td><td>Pagina's, games en plaatjes van Gloop bewaren, zodat de site snel laadt en als app ook zonder internet werkt. Bevat geen gegevens over jou</td><td>Tot een nieuwe versie van Gloop, of tot je het wist</td></tr>
    <tr><td>gloop:installBanner</td><td>Lokale opslag, functioneel</td><td>Onthouden dat je de melding "Zet Gloop op je telefoon" hebt weggeklikt</td><td>Tot je het wist</td></tr>
    <tr><td>gloop_sessie</td><td>Cookie, functioneel (alleen als je inlogt)</td><td>Onthouden dat je bent ingelogd. Bevat alleen een willekeurige code, geen naam of pincode</td><td>60 dagen, of tot je uitlogt</td></tr>
    <tr><td>gloop_beheer</td><td>Cookie, functioneel (alleen voor het beheer van Gloop, niet voor spelers)</td><td>Onthouden dat een beheerder het beheerwachtwoord heeft ingevuld</td><td>2 uur, of tot het beheer wordt gesloten</td></tr>
  </table></div>
  <p>Voor functionele opslag die nodig is voor een dienst waar je zelf om vraagt, is volgens de Telecommunicatiewet (artikel 11.7a) geen toestemming nodig.</p>
  <h2>Derden</h2>
  <p>Onze hostingpartij kan een strikt noodzakelijke beveiligingscookie plaatsen om bots en aanvallen te herkennen. Die wordt niet gebruikt om je te volgen.</p>
  ${FONTS_TXT()}
  <h2>Opslag wissen of blokkeren</h2>
  <p>Wis alles in één keer via <a href="/profiel">Profiel</a>, of via de instellingen van je browser. Blokkeer je lokale opslag of cookies, dan werken de games nog steeds, maar worden je records niet bewaard en kun je niet inloggen.</p>
  <p>Gaan we ooit analytische of andere niet-noodzakelijke cookies gebruiken, dan vragen we eerst je toestemming en passen we deze verklaring aan.</p>`,true),

voorwaarden:()=>page('Gebruiksvoorwaarden',`
  <h2>1. Over deze voorwaarden</h2>
  <p>Deze voorwaarden gelden voor het gebruik van Gloop (${WHO()}). Door Gloop te gebruiken ga je ermee akkoord. Ben je jonger dan 16, lees ze dan samen met je ouder of verzorger.</p>
  <h2>2. Gratis gebruik</h2>
  <p>Gloop en alle games zijn gratis te spelen voor persoonlijk, niet-commercieel gebruik. Je hebt geen account nodig.</p>
  <h2>2a. Accounts</h2>
  <p>Een account is gratis en niet verplicht. Je maakt het met een spelersnaam en een pincode. Houd je pincode geheim en gebruik geen account van iemand anders. Ben je jonger dan 16, dan mag je alleen een account maken als je ouder of verzorger dat goed vindt. Je kunt je account altijd zelf verwijderen via Profiel. Accounts die ruim een jaar niet zijn gebruikt, verwijderen we automatisch.</p>
  <h2>3. Wat niet mag</h2>
  <ul>
    <li>Scores of de werking van games manipuleren, bijvoorbeeld met scripts, bots of aangepaste code</li>
    <li>De site aanvallen, overbelasten, of proberen toegang te krijgen tot systemen</li>
    <li>Games, afbeeldingen, de mascotte of code kopiëren, verkopen of op een andere site plaatsen zonder onze toestemming</li>
    <li>Gloop gebruiken voor iets wat in strijd is met de wet</li>
  </ul>
  <h2>4. Spelersnamen</h2>
  <p>Kies een bijnaam en geen volledige echte naam. Namen die beledigend, discriminerend of misleidend zijn of die zich voordoen als iemand anders, zijn niet toegestaan. Zulke namen mogen we aanpassen of verwijderen, ook bij een account. Met een account staat je spelersnaam met je beste scores op de openbare wereldranglijst, tenzij je dat uitzet in Profiel. Valsspelen of een ongepaste naam kan ertoe leiden dat we je van de ranglijst halen of je account verwijderen.</p>
  <h2>5. Intellectueel eigendom</h2>
  <p>De naam Gloop, het logo, de mascotte Gloopie, de games, teksten, vormgeving en code zijn eigendom van ${v(SITE.owner,'NAAM EIGENAAR')} en beschermd door het auteursrecht en merkenrecht. Zie ook de <a href="/disclaimer">disclaimer en copyright</a>.</p>
  <h2>6. Beschikbaarheid</h2>
  <p>We doen ons best om Gloop altijd bereikbaar te houden, maar kunnen dat niet garanderen. We mogen games toevoegen, aanpassen of verwijderen en de site tijdelijk offline halen voor onderhoud. Zonder account staan records alleen op je eigen apparaat; wij kunnen ze dan niet terughalen als ze verloren gaan. Ben je je pincode vergeten, dan kunnen we die niet terugzetten.</p>
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
    <li>Je kunt alles spelen zoals jij dat wilt: met de muis, door te tikken op een telefoon of tablet, of met het toetsenbord</li>
    <li>Ook de uitleg bij de games werkt met muis, aanraken en toetsenbord</li>
    <li>Alles is met het toetsenbord te bedienen, met een duidelijke focusrand</li>
    <li>Voldoende contrast tussen tekst en achtergrond, ook in de donkere modus</li>
    <li>In Memo Mania verschillen de paartjes in kleur én gezichtje, dus ook te spelen als je kleuren slecht onderscheidt</li>
    <li>Animaties staan uit als je apparaat is ingesteld op minder beweging</li>
    <li>Elke game heeft een uitleg met bewegende plaatjes, een wijzend handje en oefenstapjes, zodat ook kinderen die nog niet (goed) lezen kunnen meespelen. Via het tandwiel ⚙️ bij de game bekijk je de uitleg opnieuw</li>
    <li>Met het tandwiel ⚙️ zet je een game op pauze, bijvoorbeeld als je even weg moet. Na de pauze telt het spel rustig af (3, 2, 1)</li>
    <li>Knoppen en kaartjes hebben beschrijvende labels voor schermlezers</li>
  </ul>
  <h2>Bekende beperkingen</h2>
  <p>Reactie Rush draait om snel reageren op een visuele verandering. De tekst verandert mee ("Wacht" wordt "TIK!"), maar het spel is minder geschikt voor mensen die een schermlezer gebruiken.</p>
  <p>Mep de Blob is met aanraken, de muis of de cijfertoetsen 1 tot 9 te spelen (in dezelfde volgorde als een numeriek toetsenblok). Gloopie herken je aan zijn groene kleur, zijn glimlach en het hartje boven zijn hoofd.</p>
  <p>Gloopie Golf is met aanraken, de muis of het toetsenbord te spelen (pijltjes om te richten en de kracht te kiezen, spatie om te slaan).</p>
  <p>Blubber Blast is met aanraken, de muis of het toetsenbord te spelen (alleen: spatie; met z'n tweeën: L en A). Het draait om snel tikken.</p>
  <p>Klikkerklok is met één tik of de spatiebalk te spelen, maar draait om snel reageren op een bewegende wijzer.</p>
  <p>Bubbel Bots is met de muis, met aanraken of met het toetsenbord te spelen (pijltjes om te richten, spatie om te schieten, S om te wisselen). Elke kleur bot heeft dezelfde vorm, dus het spel vraagt wel dat je kleuren kunt onderscheiden.</p>
  <p>Gloop Popper is met aanraken, de muis of het toetsenbord te spelen (cijfertoetsen 1 tot 5 knallen de bovenste bubbel in die baan). Elke Gloop heeft een eigen kleur en gezichtje, en de speciale bubbels hebben een eigen plaatje. Het spel draait om snel tikken; op Makkelijk gaat alles langzamer en heb je 5 hartjes.</p>
  <p>Gloop in de Ruimte is met aanraken, de muis (slepen) of het toetsenbord te spelen (pijltjes of A en D). Het spel draait om snel ontwijken van bewegende dingen. Op Makkelijk gaat alles langzamer en heb je 5 hartjes.</p>
  <p>Gloopie Zegt is met aanraken, de muis of het toetsenbord te spelen (cijfertoetsen 1 tot 6, of Tab en Enter). Elke Gloopie heeft een eigen kleur, gezichtje en toontje, dus je kunt hem ook spelen als je kleuren slecht onderscheidt.</p>
  <p>Stapelslijm draait om timing: het spel is met één tik of de spatiebalk te spelen, maar vraagt wel dat je de bewegende blokken kunt zien.</p>
  <p>Loop je ergens tegenaan? Laat het ons weten via ${mail()}. We nemen iedere melding mee in de volgende verbeteringen.</p>`,true)
};
export const PAGE_SLUGS=Object.keys(PAGES);
export function getPage(slug){return PAGES[slug]?PAGES[slug]():null;}
