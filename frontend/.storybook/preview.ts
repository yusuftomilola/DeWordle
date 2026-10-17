import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  globalTypes: {
    // Stories that opt in (see the Skeletons stories) render in either theme.
    theme: {
      description: "Canvas theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0a0118" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
