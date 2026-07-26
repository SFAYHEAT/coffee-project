import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type TableContextType = {
  table: string | null;
  setTableNumber: (value: string) => Promise<void>;
  clearTable: () => Promise<void>;
};

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [table, setTable] = useState<string | null>(null);

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      const saved = await AsyncStorage.getItem("table");

      if (saved) {
        setTable(saved);
      }
    } catch (error) {
      console.log("LOAD TABLE ERROR", error);
    }
  };

  const setTableNumber = async (value: string) => {
    setTable(value);

    await AsyncStorage.setItem("table", value);
  };

  const clearTable = async () => {
    setTable(null);

    await AsyncStorage.removeItem("table");
  };

  return (
    <TableContext.Provider
      value={{
        table,
        setTableNumber,
        clearTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("useTable must be used inside TableProvider");
  }

  return context;
}
