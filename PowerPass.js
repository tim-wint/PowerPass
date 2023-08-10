/**
 * Dieses Skript prüft die Stärke eines vom Benutzer eingegebenen Passworts anhand verschiedener Kriterien.
 * 
 * Es berechnet die Entropie des Passworts und bewertet seine Stärke auf einer Skala von 1 - 5.
 * 
 * Details zur Entropie jedes Musters und Gesamtentropie sind in der Konsole zu finden
 * 
 * @author Tim Winterleitner
 * Erstellt am: 10.08.2023
*/

//Import Wörterlisten + mögliche Räumliche Muster
import {
	vornamenM,
	woerterDE,
	vornamenF,
	nachnamen,
	keyboardAdjacencyQWERTZ
} from './data.js';

let userInput = "";

// Input des Benutzers aktualisieren
function updateUserInput() {
	const inputField = document.getElementById("passwordInput");
	userInput = inputField.value;

	// Passwortstärke berechnen & bewerten
	checkPassword();
}


function checkPassword() {

	//Gefundene Passwortmuster hier speichern
	let foundPatterns = [];


	/**=================================================================================
    // Zeichenabfolgen aussortieren (1234, abcde)
    //
    // @param {string} password
    // @returns {object} remainingPasswd, extractedSequences, entropy
    //=================================================================================*/

	function extractSequences(password) {

		// Erkannte Sequenzen hier speichern
		let extractedSequences = [];

		// Passwort neu zuweisen, während Sequenzen extrahiert werden
		let remainingPasswd = password;

		// Entropie initialisieren
		let entropy = 0;

		// Mögliche Sequenzen
		const sequences = [
			"abcdefghijklmnopqrstuvwxyz",
			"abcdefghijklmnopqrstuvwxyz"
			.split("")
			.reverse()
			.join(""),
			"1234567890",
			"1234567890".split("").reverse().join(""),
		];

		// Loop durch alle möglichen Sequenzen
		for (let sequence of sequences) {
			for (let i = 0; i < sequence.length - 2; i++) {

				// Sequenzsubstrings extrahieren
				let sub = sequence.slice(i, i + 3);

				// Index des Teilstrings im verbleibenden Passwort finden
				let index = remainingPasswd.indexOf(sub);

				// While-loop, um den Vorgang fortzusetzen
				while (index !== -1) {
					let j = i + 3;

					// Versuchen, die längere Sequenz abzugleichen
					while (
						j < sequence.length &&
						remainingPasswd.startsWith(sequence.slice(i, j + 1), index)
					) {
						j++;
					}

					// Sequenz aussortieren
					let seq = remainingPasswd.slice(index, index + j - i);
					extractedSequences.push(seq);

					// Entropie für gefundene Sequenzen berechnen
					let seqEntropy = Math.log2(Math.pow(94, seq.length)) * 0.5;
					entropy += seqEntropy;
					foundPatterns.push({
						pattern: seq,
						type: "Zeichenabfolge",
						bits: seqEntropy
					});

					// remainingPasswd nach Entfernen der erkannten Sequenz aktualisieren
					remainingPasswd =
						remainingPasswd.slice(0, index) +
						remainingPasswd.slice(index + j - i);
					index = remainingPasswd.indexOf(sub);
				}
			}
		}
		return {
			remainingPasswd,
			extractedSequences,
			entropy
		};
	}


	/**====================================================================
	// Jahre aussortieren (1900 - 2023)
	//
	// @param {string} password
	// @returns {object} password, extractedYears
	========================================================================*/

	function extractYears(password) {

		// Erkannte Sequenzen hier speichern
		let extractedYears = [];

		// REGEX um vierstellige Jahre zu finden
		let yearPattern = /(?<!\d)(19|20)\d{2}(?!\d)/g;

		let match;

		// Alle Übereinstimmungen des Jahr-Musters aus dem Passwort aussortieren
		while ((match = yearPattern.exec(password))) {

			// Jede Übereinstimmung zum Array extractedYears hinzufügen
			extractedYears.push(match[0]);

			// Jahreszahlen aus password entfernen
			password = password.replace(match[0], "");

			// Entropie für gefundene Jahreszahlen berechnen
			let yearEntropy = Math.log2(Math.pow(10, match[0].length)) * 0.4;
			foundPatterns.push({
				pattern: match[0],
				type: "Jahr",
				bits: yearEntropy,
			});
		}

		return {
			password,
			extractedYears,
		};
	}


	/**====================================================================
	// Wiederholungen aussortieren
	//
	// @param {string} password
	// @returns {object} password, extractedRepeats
	========================================================================*/

	function extractRepeats(password) {

		// Erkannte Wiederholungen hier speichern
		let extractedRepeats = [];

		// REGEX um Wiederholungen zu finden
		let repeatPattern = /(.)\1{2,}/g;

		let match;

		// Alle Übereinstimmungen des Wiederholungsmusters aus dem Passwort aussortieren
		while (match = repeatPattern.exec(password)) {
			extractedRepeats.push(match[0]);
			password = password.replace(match[0], "");

			// Entropie für gefundene Wiederholungen berechnen
			let repeatEntropy = Math.log2(Math.pow(94, match[0].length)) * 0.3;
			foundPatterns.push({
				pattern: match[0],
				type: "Wiederholung",
				bits: repeatEntropy,
			});
		}

		return {
			password,
			extractedRepeats,
		};
	}


	/**====================================================================
	// Nach Wörtern der wordlists im Passwort suchen
	//
	// @param {string} password
	// @returns {object} password, entropy
	//========================================================================*/

	function findMatchesInWordlists(password) {

		// Wörterlisten kombinieren und in combinedWordlist speichern
		let wordLists = [woerterDE, vornamenM, vornamenF, nachnamen];
		let combinedWordList = [].concat(...wordLists);

		let entropy = 0;
		let matchFound;

		// Wordlist nach Länge sortieren
		combinedWordList.sort((a, b) => b.length - a.length);

		// Loop, bis keine Übereinstimmungen mehr gefunden werden
		do {
			matchFound = false;
			for (let word of combinedWordList) {
				let pattern = new RegExp(word, "gi");
				if (pattern.test(password)) {
					let wordEntropy = 5; // Jedes gefundene Wort =+ 5 Bits Entropie
					entropy += wordEntropy;
					password = password.replace(pattern, "");

					// Gefundene Wörter nach Typ klassifizieren
					let type;
					if (woerterDE.includes(word)) {
						type = "Häufiges Wort";
					} else if (vornamenM.includes(word)) {
						type = "Häufiger männlicher Vorname";
					} else if (vornamenF.includes(word)) {
						type = "Häufiger weiblicher Vorname";
					} else if (nachnamen.includes(word)) {
						type = "Häufiger Nachname";
					}

					// Gefundene Wörter zum Array foundPatterns hinzufügen
					foundPatterns.push({
						pattern: word,
						type: type,
						bits: wordEntropy
					});

					matchFound = true;
					break; // Beende den Loop, sobald eine Übereinstimmung gefunden wurde
				}
			}
		} while (matchFound);

		return {
			password,
			entropy
		};
	}


	/**=================================================================================
    // Räumliche Muster aussortieren (qwertz)
    //
    // @param {string} password
    // @returns {object} password, extractedKeyboardAdjacency
    //=================================================================================*/

	function extractKeyboardAdjacency(password) {

		// Erkannte Räumliche Muster hier speichern
		let extractedKeyboardAdjacency = [];

		// Loop durch alle Zeichen des Passworts, sucht nach räumlichen Mustern bis nächstes Zeichen nicht mehr passt
		let i = 0;
		while (i < password.length - 1) {
			if (
				keyboardAdjacencyQWERTZ[password[i]] &&
				keyboardAdjacencyQWERTZ[password[i]].includes(password[i + 1])
			) {
				let j = i + 2;
				while (
					j < password.length &&
					keyboardAdjacencyQWERTZ[password[j - 1]] &&
					keyboardAdjacencyQWERTZ[password[j - 1]].includes(password[j])
				) {
					j++;
				}

				//Räumliche Muster aussortieren
				let adjacencySequence = password.slice(i, j);
				if (adjacencySequence.length >= 3) {
					extractedKeyboardAdjacency.push(adjacencySequence);
					password = password.replace(adjacencySequence, "");

					// Entropie für gefundene räumliche Muster berechnen
					let adjacencyEntropy = Math.log2(Math.pow(94, adjacencySequence.length)) * 0.6;
					foundPatterns.push({
						pattern: adjacencySequence,
						type: "Räumliches Muster",
						bits: adjacencyEntropy,
					});
				}
				i = j;
			} else {
				i++;
			}
		}

		return {
			password,
			extractedKeyboardAdjacency,
		};
	}


	/**====================================================================
	// Brute force Entropie berechnen
	//
	// @param {string} password
	// @returns {object} entropy
	//========================================================================*/

	function calculateRemainingEntropy(password) {

		let entropy = 0;
		// Entropie für die verbleibenden Zeichen berechnen
		if (password.length > 0) {
			foundPatterns.push({
				pattern: password,
				type: "Brute Force",
				bits: Math.log2(Math.pow(94, password.length))
			});
		}
		return entropy;
	}


	/**====================================================================
	// Passwortstärke bewerten:
	// 1. SHA-1 Hash generieren und mit Pwned Passwords API abgleichen
	// 2. Entropie berechnen
	//
	// @param {string} password
	// @returns {object} rating, message, entropy / totalEntropy
	//========================================================================*/

	function ratePassword(password) {

		// SHA-1 Hash generieren mit jsSHA-library
		const shaObj = new jsSHA("SHA-1", "TEXT", {
			encoding: "UTF8"
		});
		shaObj.update(password);
		const hash = shaObj.getHash("HEX");

		// SHA-1 Hash mit Pwned Passwords API abgleichen
		return fetch(`https://api.pwnedpasswords.com/range/${hash.substring(0, 5)}`)
			.then((response) => response.text())
			.then((hashes) => {
				const hashArray = hashes.split("\r\n");
				const ourHashTail = hash.substring(5).toUpperCase();

				// Überprüfen, ob der Hash in einer Datenbank gefunden wurde
				for (let hash of hashArray) {
					const [hashTail, count] = hash.split(":");

					// Wenn der Hash gefunden wurde, gib eine Warnung aus
					if (hashTail === ourHashTail) {
						const message = `Oh nein! Dein Passwort wurde bereits in ${count} Datenleaks entdeckt! Bitte ändere es umgehend, falls du es jemals benutzt haben sollst`;
						document.getElementById("passwordStrengthMessage").textContent = message;
						return {
							rating: 1,
							message: message,
							entropy: 0,
						}; 
						
					}
				}
				// Funktionen aufrufen

				// extractSequences aufrufen
				const {
					remainingPasswd: passwdAfterSequences,
					extractedSequences,
				} = extractSequences(userInput);

				// extractYears aufrufen
				const {
					password: passwdAfterYears,
					extractedYears
				} = extractYears(passwdAfterSequences);

				// extractRepeats aufrufen
				const {
					password: passwdAfterRepeats,
					extractedRepeats
				} = extractRepeats(passwdAfterYears);

				// findMatchesInWordlists aufrufen
				const {
					password: passwdAfterWordlists,
					entropy: entropyMatch
				} = findMatchesInWordlists(passwdAfterRepeats);

				// extractKeyboardAdjacency aufrufen
				const {
					password: finalPassword,
					extractedKeyboardAdjacency,
				} = extractKeyboardAdjacency(passwdAfterWordlists);

				// calculateRemainingEntropy aufrufen
				const remainingEntropy = calculateRemainingEntropy(finalPassword);

				// Gesamte Entropie berechnen
				let patternEntropy = 0;
				for (let pattern of foundPatterns) {
					patternEntropy += pattern.bits;
				}

				const totalEntropy = patternEntropy + remainingEntropy;

				// Gefundene Passwortmuster nach Reihenfolge im Passwort sortieren
				foundPatterns.sort((a, b) => {
					const indexA = password.indexOf(a.pattern);
					const indexB = password.indexOf(b.pattern);
					return indexA - indexB;
				});

				// Gefundene Passwortmuster auf der Website anzeigen
				const foundPatternsElement = document.getElementById("foundPatterns");
				foundPatternsElement.innerHTML = "";

				let patternString = "";

				// Loop through each found pattern and concatenate it to the patternString
				foundPatterns.forEach((pattern, index) => {
					patternString += `${pattern.pattern} (${pattern.type})`;

					// Add a comma after each pattern except the last one
					if (index !== foundPatterns.length - 1) {
						patternString += ", ";
					}
				});
				foundPatternsElement.textContent = patternString;
				console.log(foundPatterns);

				// Passwortstärke bewerten (Skala von 1-5)
				if (totalEntropy >= 100) {
					const message = "Sehr stark";
					document.getElementById("passwordStrengthMessage").textContent = message;
					return {
						rating: 5,
						message: message,
						totalEntropy,
					};
				} else if (totalEntropy >= 60) {
					const message = "Stark";
					document.getElementById("passwordStrengthMessage").textContent = message;
					return {
						rating: 4,
						message: message,
						totalEntropy,
					};
				} else if (totalEntropy >= 48) {
					const message = "Mittelstark";
					document.getElementById("passwordStrengthMessage").textContent = message;
					return {
						rating: 3,
						message: message,
						totalEntropy,
					};
				} else if (totalEntropy >= 29) {
					const message = "Schwach";
					document.getElementById("passwordStrengthMessage").textContent = message;
					return {
						rating: 2,
						message: message,
						totalEntropy,
					};
				} else {
					const message = "Sehr schwach";
					document.getElementById("passwordStrengthMessage").textContent = message;
					return {
						rating: 1,
						message: message,
						totalEntropy,
					};
				}
			})

			// Fehlermeldung für debugging (v.a. falls die API nicht erreichbar ist)
			.catch((error) => {
				console.error(error);
			});
	}


	/**====================================================================
	// Zeit in verschiedene Einheiten umrechnen
	//
	// @param {number} timeInSeconds
	// @returns {string} time
	//========================================================================*/

	function adjustTimeUnits(timeInSeconds) {
		// Extrem kleine Zeiteinheiten vermeiden
		if (timeInSeconds < 1) return "Direkt";
	
		// Einheiten und ihre Faktoren
		const units = {
			"Minuten": 60,
			"Stunden": 60,
			"Tage": 24,
			"Wochen": 7,
			"Monate": 4.34524,
			"Jahre": 12,
			"Jahrzehnte": 10,
			"Jahrhunderte": 100,
			"Millionen Jahre": 1000,
			"Milliarden Jahre": 1000,
			"Billionen Jahre": 1000,
		};
	
		let currentUnit = "Sekunden";
	
		// Richtige Einheit finden
		for (let unit in units) {
			if (timeInSeconds < units[unit]) {
				break;
			}
			timeInSeconds /= units[unit];
			currentUnit = unit;
		}
		return `${Math.ceil(timeInSeconds)} ${currentUnit}`;
	}
	
	
	// Stärkebalken unter dem Eingabefeld
	function updateProgressBar(strengthRating) {
		const progressBar = document.querySelector(".progress-bar");
		const progressColors = [
			"#d70000", // Sehr schwach
			"#f46523", // Schwach
			"#ffcb17", // Mittelstark
			"#81bd32", // Stark
			"#2b8b34", // Sehr stark
		];
		const progressWidth = (strengthRating) * 20; // 1 - 5 Bewertung in Prozent umrechnen (um Breite des Balkens zu bestimmen)
		
		progressBar.style.width = `${progressWidth}%`;
		progressBar.style.backgroundColor = progressColors[strengthRating - 1];
	}
	
	// Crack-Zeit aktualisieren
	function updateCrackTimeDisplay(crackTimeInSeconds) {
		const crackTimeOutput = document.getElementById("crackTimeOutput");
		crackTimeOutput.textContent = adjustTimeUnits(crackTimeInSeconds);
	}


	/**====================================================================
	// Passwort Crack-Zeit berechnen
	//
	// @callback
	// @param {object} result
	//========================================================================*/

	let passwordCrackTimeInSeconds = "";
	ratePassword(userInput).then((result) => {
		//Crack-Zeit berechnen
		passwordCrackTimeInSeconds = Math.pow(2, result.totalEntropy) / 100000000000;
		
		if (result.totalEntropy == undefined) {
			passwordCrackTimeInSeconds = 0;
		}

		// Update the progress bar
		updateProgressBar(result.rating);

		// Update the crack time display
		updateCrackTimeDisplay(passwordCrackTimeInSeconds);
		
		// Resultat *mit totalEntropy* in der Konsole anzeigen
		console.log(result);
	});
}

// Input des Benutzers aktualisieren, sobald sich der Wert des Eingabefelds ändert
document.addEventListener("DOMContentLoaded", function() {
	const inputField = document.getElementById("passwordInput");
	inputField.addEventListener("input", updateUserInput);
});