import { createTheme, MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#eef2ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8",
  "#4f46e5", // [5] primary
  "#4338ca", "#3730a3", "#312e81", "#1e1b4b",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 5,
  colors: { brand },
  fontFamily: "var(--font-noto-sans-jp), sans-serif",
  defaultRadius: "md",
  components: {
    Badge: { defaultProps: { variant: "light" } },
  },
});
