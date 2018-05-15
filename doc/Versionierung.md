# Versionsnummer vergeben #

Bei der Masterportal-Versionierung halten wir uns an die Regeln der semantischen Versionierung, die dem folgenden Aufbau entspricht:

**MAJOR.MINOR.PATCH**

Versionsnummern, die diesem Beispiel folgen sind beispielsweise 0.0.1, 1.0.0 oder 2.5.265. Dabei gelten folgende Regeln:

1. Die **MAJOR**-Versionsnummer wird erhöht, wenn sich die öffentliche API des Packages ändert, sodass sie nicht mehr kompatibel zu der vorherigen Version ist.
2. Die **MINOR**-Versionsnummer wird erhöht, wenn Funktionalität ergänzt wird, dabei aber nicht die öffentliche API inkompatibel zu älteren Versionen wird.
3. Die **PATCH**-Versionsnummer wird bei BugFixes erhöht, die keine Auswirkungen auf die API des Packages haben, sodass ebenfalls die Abwärtskompatibilität erhalten bleibt.
