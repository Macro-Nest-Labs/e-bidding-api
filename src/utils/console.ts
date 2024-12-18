/* eslint-disable no-console */
enum ConsoleColors {
  RESET = 0,
  RED = 31,
  GREEN = 32,
  YELLOW = 33,
  BLUE = 34,
  MAGENTA = 35,
  CYAN = 36,
  WHITE = 37,
  DEFAULT = 38,
}

export const log = (message: string, color: keyof typeof ConsoleColors = 'DEFAULT', bgColor?: keyof typeof ConsoleColors) => {
  const colorCode = ConsoleColors[color];
  const bgColorCode = bgColor ? ConsoleColors[bgColor] + 10 : ''; // Adding 10 to get the background color code

  const formattedMessage = `\u001b[${colorCode}m${bgColorCode ? `\u001b[${bgColorCode}m` : ''}[+] ${message}\u001b[0m`;

  console.log(formattedMessage);
};
