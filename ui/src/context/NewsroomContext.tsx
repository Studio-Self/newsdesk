import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Newsroom } from "@newsdesk/shared";
import { queryKeys } from "../lib/queryKeys";

interface NewsroomContextValue {
  newsrooms: Newsroom[];
  selectedNewsroom: Newsroom | null;
  selectedNewsroomId: string | null;
  selectNewsroom: (id: string) => void;
  loading: boolean;
}

const NewsroomContext = createContext<NewsroomContextValue | null>(null);

export function NewsroomProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: newsrooms = [], isLoading } = useQuery({
    queryKey: queryKeys.newsrooms,
    queryFn: () => apiFetch<Newsroom[]>("/newsrooms"),
  });

  useEffect(() => {
    if (!selectedId && newsrooms.length > 0) {
      setSelectedId(newsrooms[0].id);
    }
  }, [newsrooms, selectedId]);

  const selectedNewsroom = newsrooms.find((n) => n.id === selectedId) ?? null;

  return (
    <NewsroomContext.Provider
      value={{
        newsrooms,
        selectedNewsroom,
        selectedNewsroomId: selectedId,
        selectNewsroom: setSelectedId,
        loading: isLoading,
      }}
    >
      {children}
    </NewsroomContext.Provider>
  );
}

export function useNewsroom() {
  const ctx = useContext(NewsroomContext);
  if (!ctx) throw new Error("useNewsroom must be used within NewsroomProvider");
  return ctx;
}
