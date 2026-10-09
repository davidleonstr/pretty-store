// "Té de Manzanilla" -> "te-de-manzanilla"
// Quita tildes/diéresis (á→a, é→e, ñ→n...) y separa palabras con "-".
export function slugify(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

      
