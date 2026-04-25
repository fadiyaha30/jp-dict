import { createTheme, MantineColorsTuple } from "@mantine/core";

const green: MantineColorsTuple = [
  "#e6f7f2",
  "#c2eade",
  "#9edcc9",
  "#79cfb4",
  "#54c19f",
  "#1D9E75", // [5] primary
  "#178060",
  "#12634b",
  "#0d4736",
  "#082b21",
];

export const theme = createTheme({
  primaryColor: "green",
  primaryShade: 5,
  colors: { green },
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
  defaultRadius: "md",
  components: {
    Badge: {
      defaultProps: {
        variant: "light",
      },
    },
    Card: {
      defaultProps: {
        shadow: "xs",
        withBorder: true,
      },
    },
  },
});
