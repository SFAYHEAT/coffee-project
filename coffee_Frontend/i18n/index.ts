import { I18n } from "i18n-js";

const translations = {
  en: {
    goodMorning: "Good Morning",
    myCart: "My Cart",
    checkout: "Checkout",
    total: "Total",
    settings: "Settings",
    logout: "Log Out",
  },

  fr: {
    goodMorning: "Bonjour",
    myCart: "Mon Panier",
    checkout: "Commander",
    total: "Total",
    settings: "Paramètres",
    logout: "Déconnexion",
  },
};

export const i18n = new I18n(translations);

i18n.defaultLocale = "en";
i18n.locale = "en";
