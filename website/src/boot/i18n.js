import { createI18n } from 'vue-i18n'
import messages from "src/i18n";

export default async ({ app, Vue }) => {
  const i18n = createI18n({
    locale: "en-us",
    fallbackLocale: "en-us",
    messages
  });

  // Set i18n instance on app
  app.use(i18n);
};
