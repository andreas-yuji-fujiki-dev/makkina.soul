import { useCallback, useEffect, useState } from "react";
import type { Area, Card, CardSeed, ColumnId, KanbanColumnDef, Priority } from "@app-types/kanban.types";
import { db } from "@services/db";
import { appendOrder, betweenOrder } from "@utils/kanban";
import { describeWriteError } from "@utils/errors";

interface NewCardInput {
  title: string;
  area: Area;
  prio: Priority;
}

export function useCards(showNotice: (text: string) => void, columns: KanbanColumnDef[] = []) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const unsubscribe = db.collection<CardSeed>("cards").onSnapshot(
      (snap) => {
        setCards(
          snap.docs.map((d) => ({ ...(d.data() as CardSeed), id: d.id })),
        );
      },
      () => showNotice("O kanban parou de sincronizar. Recarregue a página."),
    );
    return unsubscribe;
  }, [showNotice]);

  const addCard = useCallback(
    (input: NewCardInput) => {
      const firstCol = columns[0]?.id ?? "todo";
      const data: CardSeed = {
        title: input.title,
        note: "",
        area: input.area,
        prio: input.prio,
        col: firstCol,
        created: Date.now(),
        movedAt: Date.now(),
        order: appendOrder(cards, firstCol),
      };
      db.collection<CardSeed>("cards").add(data).catch((e) => showNotice(describeWriteError(e)));
    },
    [cards, columns, showNotice],
  );

  const exceedsWipLimit = useCallback(
    (card: Card, col: ColumnId) => {
      const limit = columns.find((c) => c.id === col)?.wipLimit;
      if (limit == null) return false;
      const count = cards.filter((c) => c.col === col).length;
      return card.col !== col && count >= limit;
    },
    [cards, columns],
  );

  const moveCard = useCallback(
    (card: Card, col: ColumnId) => {
      if (exceedsWipLimit(card, col)) {
        showNotice("Limite de cartões dessa coluna atingido. Termine algo antes de puxar outro.");
        return;
      }
      db.doc<CardSeed>(`cards/${card.id}`)
        .update({ col, movedAt: Date.now(), order: appendOrder(cards, col) })
        .catch((e) => showNotice(describeWriteError(e)));
    },
    [cards, exceedsWipLimit, showNotice],
  );

  const reorderCard = useCallback(
    (card: Card, col: ColumnId, beforeOrder: number | null, afterOrder: number | null) => {
      if (exceedsWipLimit(card, col)) {
        showNotice("Limite de cartões dessa coluna atingido. Termine algo antes de puxar outro.");
        return;
      }
      db.doc<CardSeed>(`cards/${card.id}`)
        .update({
          col,
          order: betweenOrder(beforeOrder, afterOrder),
          movedAt: col !== card.col ? Date.now() : card.movedAt,
        })
        .catch((e) => showNotice(describeWriteError(e)));
    },
    [exceedsWipLimit, showNotice],
  );

  const updateCard = useCallback(
    (card: Card, edits: Pick<Card, "title" | "note" | "area" | "prio">) => {
      db.doc<CardSeed>(`cards/${card.id}`).update(edits).catch((e) => showNotice(describeWriteError(e)));
    },
    [showNotice],
  );

  const removeCard = useCallback(
    (card: Card) => {
      db.doc<CardSeed>(`cards/${card.id}`).delete().catch((e) => showNotice(describeWriteError(e)));
    },
    [showNotice],
  );

  return { cards, addCard, moveCard, reorderCard, updateCard, removeCard };
}
