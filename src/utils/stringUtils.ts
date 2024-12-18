export const sanitize = (text: string) =>
  text
    .trim()
    .replace(/[^\d\w\s]/gi, '')
    .replace(/[\s]+/g, ' ')
    .trim();

export const textToSlug = (text: string) =>
  // Replace non-alphanumeric characters with a dash
  // Replace multiple dashes with a single dash
  // Remove leading and trailing dashes
  text
    .trim()
    .toLowerCase()
    .replace(/[\W\s]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/[-]+$/g, '')
    .replace(/^[^a-zA-Z]+/g, '');

export const uppercaseFirst = (str: string) => {
  `${str[0].toUpperCase()}${str.substring(1)}`;
};

export default { sanitize, textToSlug, uppercaseFirst };
