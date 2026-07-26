import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type Lang = "en" | "fr";

const translations = {
  en: {
    permissionNeeded: "Permission needed",
    allowGallery: "Allow gallery access to change profile picture",

    empty: "Empty",
    writeComplaint: "Write your complaint first",

    sent: "Sent",
    complaintSent: "Your complaint was sent to staff",

    error: "Error",
    couldNotSend: "Could not send",

    releaseTable: "This will release your current table. Continue?",
    cancel: "Cancel",
    change: "Change",
    changeTable: "Change Table",

    missingFields: "Missing fields",
    enterPasswords: "Enter both passwords",

    success: "Success",
    passwordUpdated: "Password updated",
    couldNotUpdate: "Could not update password",

    settings: "Settings",

    profilePicture: "Profile Picture",
    changePhoto: "Change Photo",

    darkMode: "Dark Mode",

    table: "Table",
    noTable: "No table selected",

    changePassword: "Change Password",
    currentPassword: "Current password",
    newPassword: "New password",
    updatePassword: "Update Password",

    staffContact: "Staff Contact",

    sendComplaint: "Send a Complaint",
    writeIssue: "Write your issue...",
    sendToStaff: "Send to Staff",

    language: "Language",
  },

  fr: {
    permissionNeeded: "Permission nécessaire",
    allowGallery: "Autorisez l'accès à la galerie",

    empty: "Vide",
    writeComplaint: "Écrivez votre réclamation",

    sent: "Envoyé",
    complaintSent: "Votre réclamation a été envoyée",

    error: "Erreur",
    couldNotSend: "Impossible d'envoyer",

    releaseTable: "Cela libérera votre table actuelle. Continuer ?",
    cancel: "Annuler",
    change: "Changer",
    changeTable: "Changer de table",

    missingFields: "Champs manquants",
    enterPasswords: "Entrez les deux mots de passe",

    success: "Succès",
    passwordUpdated: "Mot de passe mis à jour",
    couldNotUpdate: "Impossible de mettre à jour",

    settings: "Paramètres",

    profilePicture: "Photo de profil",
    changePhoto: "Changer la photo",

    darkMode: "Mode sombre",

    table: "Table",
    noTable: "Aucune table sélectionnée",

    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    updatePassword: "Mettre à jour",

    staffContact: "Contact du personnel",

    sendComplaint: "Envoyer une réclamation",
    writeIssue: "Écrivez votre problème...",
    sendToStaff: "Envoyer au personnel",

    language: "Langue",
  },
};

type LanguageContextType = {
  lang: Lang;
  t: (key: keyof (typeof translations)["en"]) => string;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    AsyncStorage.getItem("lang").then((val) => {
      if (val === "fr" || val === "en") setLangState(val);
    });
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    AsyncStorage.setItem("lang", newLang);
  };

  const t = (key: keyof (typeof translations)["en"]) =>
    translations[lang][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
