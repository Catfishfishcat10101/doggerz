const { plugin } = require("postcss");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
        colors: {
            doggerzBlue: '#5ac8fc',
            doggerzGreen: '#4cd964',
            doggerzBrown: '#a16207',
        },
        fontFamily: {
            'doggerz': ['Doggerz', 'sans-serif'],
        },
    },
},
plugins: [],
};