import { createTheme, MantineColorsTuple } from "@mantine/core";

const green: MantineColorsTuple = [
  "#e6f7f2", "#c2eade", "#9edcc9", "#79cfb4", "#54c19f",
  "#1D9E75", "#178060", "#12634b", "#0d4736", "#082b21",
];

const dark: MantineColorsTuple = [
  "#e8ede9", "#b0c4b8", "#7a9c88", "#52705e",
  "#1e3229", "#131f17", "#0e1812", "#090f0b",
  "#060c08", "#040907",
];

export const theme = createTheme({
  primaryColor: "green",
  primaryShade: 5,
  colors: { green, dark },
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
  defaultRadius: "md",
  components: {
    Badge: { defaultProps: { variant: "light" } },
    Card: { defaultProps: { withBorder: true } },
  },
});
