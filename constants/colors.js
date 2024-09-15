
// colors.js
const lightColors = {
  background: 'white',
  text: '#333',
  cardBackground: '#F3F3F3',
  iconColor: 'grey',
  iconFocus: 'black',
  borderColor: '#E0E0E0',
  border: '#E0E0E0',
  buttonColor: '#007bff', // Button color for light theme (example: blue)
};

const darkColors = {
  background: '#121212', // Very dark gray, almost black
  cardBackground: '#1f1f1f', // Slightly lighter than the main background
  text: '#e1e1e1', // Soft light gray for text
  iconColor: '#b0b0b0', // Light gray for icons, slightly different for a subtle effect
  iconFocus: 'white',
  borderColor: '#e1e1e1', // Medium dark gray for borders
  border: 'black',
  buttonColor: '#1e90ff', // Button color for dark theme (example: lighter blue)
};

const colors = {
  light: lightColors,
  dark: darkColors,
};

export default colors;

