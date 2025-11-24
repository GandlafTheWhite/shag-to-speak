import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { WORD_SETS } from "@/data/wordSets";
import { LEARNING_TOPICS } from "@/data/topics";
import type { User } from "@/pages/Index";

interface WordSetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onAddSet: (setId: string) => void;
}

const WordSetsDialog = ({
  open,
  onOpenChange,
  user,
  onAddSet,
}: WordSetsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Готовые наборы слов
          </DialogTitle>
          <DialogDescription>Нужен ли этот функционал?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-accent/50 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Icon
                name="MessageCircle"
                size={24}
                className="text-primary flex-shrink-0 mt-1"
              />
              <p className="text-sm leading-relaxed">
                Привет! Мы не понимаем, нужен ли этот функционал при текущей
                концепции ИИ-генерации!
              </p>
            </div>
            <p className="text-sm leading-relaxed pl-9">
              Если ты считаешь, что было бы удобно добавить готовые наборы слов
              - напиши нам!
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              window.open("https://t.me/+Tr9zf7kjYjwwYzZi", "_blank")
            }
          >
            <Icon name="MessageCircle" size={20} className="mr-2" />
            Написать в поддержку
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WordSetsDialog;
