/**
 * Dieses Skript generiert ein zufälliges Passwort basierend auf den vom Benutzer ausgewählten Optionen.
 *  
 * Das Passwort wird in ein Input-Feld geschrieben, das der Benutzer kopieren kann.
 * 
 * @author Tim Winterleitner
 * Erstellt am: 10.08.2023
*/

// Character sets für Kleinbuchstaben, Großbuchstaben, Zahlen und Sonderzeichen
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const specialChars = '!@#$%^&*'; // Viele Websites erlauben nur eine begrenzte Anzahl von Sonderzeichen

// Kopieren des generierten Passworts in die Zwischenablage
function copyToClipboard() {
const generatedPassword = document.getElementById('generated-password');
generatedPassword.select();
document.execCommand('copy');
}

// Generierung eines neuen Passworts basierend auf den vom Benutzer ausgewählten Optionen
function generatePassword() {

// Zugriff auf die Benutzereingaben bezüglich Passwortlänge und Zeicheneinschluss
const length = document.getElementById('password-length').value;
const includeLowercase = document.getElementById('include-lowercase').checked;
const includeUppercase = document.getElementById('include-uppercase').checked;
const includeNumbers = document.getElementById('include-numbers').checked;
const includeSpecial = document.getElementById('include-special').checked;

// Sicherstellen, dass mindestens 20 % der Passwortlänge die ausgewählten Character sets einschließen (Vermeiden von Clustering-Illusionen)
const numChars = Math.ceil(length * 0.2);

// Alle zulässigen Zeichen für das Passwort speichern
let allowedChars = ''; 
// Character sets basierend auf der Benutzerwahl zur allowedChars-Zeichenkette hinzufügen
if (includeLowercase) allowedChars += lowercaseChars;
if (includeUppercase) allowedChars += uppercaseChars;
if (includeNumbers) allowedChars += numberChars;
if (includeSpecial) allowedChars += specialChars;

// Generieren der erforderlichen Anzahl von Zeichen aus den ausgewählten Character sets
for (let i = 0; i < numChars; i++) {
const randomIndex = Math.floor(Math.random() * allowedChars.length);
allowedChars += allowedChars.charAt(randomIndex);
}

// Aufbau der Passwort-Zeichenkette mit einer Länge, die der vom Benutzer angegebenen Länge entspricht
let password = '';
for (let i = 0; i < length; i++) {
const randomIndex = Math.floor(Math.random() * allowedChars.length);
password += allowedChars.charAt(randomIndex);
}

// Festlegen des Werts des Passwort-Eingabefelds auf das generierte Passwort
document.getElementById('generated-password').value = password;
}

// Passwortgenerierung bei Benutzerinteraktion mit Checkboxen und Slider beginnen
document.getElementById('password-length').addEventListener('input', generatePassword);
document.getElementById('include-lowercase').addEventListener('change', generatePassword);
document.getElementById('include-uppercase').addEventListener('change', generatePassword);
document.getElementById('include-numbers').addEventListener('change', generatePassword);
document.getElementById('include-special').addEventListener('change', generatePassword);
document.getElementById('regenerate').addEventListener('click', generatePassword);

// Generieren eines Passworts beim Laden der Seite
generatePassword();

// Kopieren des Passworts in die Zwischenablage, sobald der copy-to-clipboard Button geklickt wird
document.getElementById('copy-to-clipboard').addEventListener('click', copyToClipboard);

// Slider für die Passwortlänge
const passwordLengthSlider = document.getElementById('password-length');
const passwordLengthDisplay = document.getElementById('password-length-display');

// Anzeigen der Passwortlänge als Zahl oberhalb vom Slider
passwordLengthSlider.addEventListener('input', function() {
const newPasswordLength = this.value;
passwordLengthDisplay.textContent = newPasswordLength;
});