# Belegblick

TIFF-Prüfarbeitsplatz mit lokalem TIFF-Decoder (UTIF 3.1.0, pako 1.0.11), optionaler OpenAI-Auslesung, feldweiser Prüfung und JSON-Export. Keine Dokumentdaten werden mit der App ausgeliefert; das Beispiel ist fiktiv.

## Start

Node 22 oder neuer. `npm start`, dann http://127.0.0.1:4177. `npm test` prüft die Freigabelogik, Legacy-Import, Rohwerterhalt, Eingabegrenzen und API-Ablauf mit simuliertem Provider.

## Nutzung

1. TIFF/PNG/JPG öffnen (bis 5 Seiten, 25 MB, 40 MP pro Seite). Originalauflösung bleibt erhalten. Anfragegrenze nach Umwandlung 3,4 MB in Base64, sonst weniger Seiten/kleinere Auflösung verwenden.
2. Unter KI einrichten einen eigenen OpenAI-API-Schlüssel für diese Sitzung eingeben und Versand bestätigen. Alternativ JSON importieren, auch das zuvor erstellte Format mit dokument/tiere.
3. Felder unter 95 %, Handschrift, unbekannte Einschätzungen, Änderungen und erkannte Datumswidersprüche einzeln bestätigen. Kein Sammelfreigabeknopf. Ein leerer Wert kann nach Prüfung bewusst bestätigt werden.
4. JSON generieren und herunterladen. Prüfstand kann separat gesichert und importiert werden. Importierte Bestätigungen werden bewusst zurückgesetzt.

## Grenzen

95 % ist eine Modell-Selbsteinschätzung, kein kalibrierter Genauigkeitsnachweis. Keine Vollständigkeitsgarantie; alle Felder sind bearbeitbar und ergänzbar. Keine automatische Milchmengen- oder Codeinterpretation. Unterhalb der Schwelle darf kein finaler Export erfolgen. Alle Rohwerte, Korrekturen, Prüfzeiten und Modell-Scores sind im Prüfprotokoll enthalten. Ein Klick auf Bestätigen setzt keine KI-Konfidenz auf 100 %.

Originalbild wird nach TIFF-Dekodierung als PNG gesendet. OpenAI-Antwortusage enthält tatsächliche Eingabe-, Ausgabe- und gesamte Tokens. Keine erfundenen Tokenmesswerte. Originalmodus kann erhebliche API-Kosten verursachen.

Die API verwendet absichtlich direkten OpenAI-HTTP-Zugriff (BYOK), keine fremde Team-Abrechnung und keinen offenen serverseitigen API-Schlüssel. Browser sendet den Schlüssel nur im Authorization-Header an dieselbe Domain; keine dauerhafte Speicherung, kein Logging im Anwendungscode. Ein öffentlicher App-Aufruf kann ohne eigenen Schlüssel keine KI-Kosten auslösen. `store:false` ersetzt nicht die Aufbewahrungsbedingungen des API-Anbieters. Keine Datenbank, keine automatische Browser-Speicherung, keine serverseitigen Dateien. Seite offen lassen oder Prüfstand sichern.

## Vercel

Buildloses Frontend in public und Node-Funktion api/extract.mjs. Keine Umgebungsvariablen benötigt. Es werden nur Anwendungscode und Bibliotheken veröffentlicht; die Downloads und realen Beispielbelege bleiben ausserhalb des Projekts. Vercel-Projekt: belegblick (prj_gVlTe7eJ17MvAmqClDJmbJStAbsy).
