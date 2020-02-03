**10. Pre-push Hooks**

10.1 Beachte die in der **[package.json](../../package.json)** konfigurierten pre-push Hooks. Diese werden bei jedem **git push** ausgeführt und brechen im Falle eines Errors den push ab.

10.1.1 **[Linter](./linter.md)**: Halte die Linter Regeln ein. Ein Linter dient dazu den Code einheitlich zu strukturieren und Fehler zu vermeiden. Siehe dazu **[eslint](https://eslint.org/docs/about/)**

10.1.2 **[JSDoc](./jsdoc.md)**: Schreibe valides JSDoc. JSDoc dient der Dokumentation von Javascript-Datein direkt im Quellcode. Es hilft besonders neuen aber auch erfahrenen Entwicklern den Quellcode zu verstehen. Aus einem validen JSDoc lässt sich eine Dokumentation als HTML erzeugen. Sie dazu **[JSDoc](https://jsdoc.app/about-getting-started.html)**

10.1.3 **[Unittests](./unitTests.md)**: Schreibe gültige Unittests. Durch Unittest werden geschrieben Funktionen des Quellcodes getestet. Außerdem wird dutch Unittest sichergestellt, dass Änderungen des Quellcodes (z.B. bei Erweiterungen oder beim Refactoring) die vorhandene Funktionalität nicht kaputt macht. Dabei prüft ein Unittest den Rückgabewert einer Funktion, der konkrete Eingabewerte übergeben werden.
