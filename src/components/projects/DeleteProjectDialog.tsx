/**
 * 删除项目确认对话框
 *
 * 提供危险操作警告，支持选择是否同时删除目录
 */

import { useState } from "react";
import { AlertTriangle, Trash2, FolderX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Project } from "@/lib/api/project";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deleteDirectory: boolean) => Promise<void>;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [deleteDirectory, setDeleteDirectory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(deleteDirectory);
      onOpenChange(false);
      setDeleteDirectory(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setDeleteDirectory(false);
      }
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            删除项目
          </DialogTitle>
          <DialogDescription>
            确定要删除项目 <strong>"{project.name}"</strong> 吗？
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 警告信息 */}
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
            <p className="text-destructive font-medium mb-1">
              ⚠️ 此操作不可恢复
            </p>
            <p className="text-muted-foreground">
              删除后，项目的所有内容记录将从数据库中移除。
            </p>
          </div>

          {/* 删除目录选项 */}
          <div className="flex items-start space-x-3 rounded-lg border p-3">
            <Checkbox
              id="delete-directory"
              checked={deleteDirectory}
              onCheckedChange={(checked) =>
                setDeleteDirectory(checked === true)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="delete-directory"
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <FolderX className="h-4 w-4 text-destructive" />
                同时删除项目目录
              </Label>
              <p className="text-xs text-muted-foreground">
                将删除目录：
                <code className="bg-muted px-1 rounded">
                  {project.rootPath}
                </code>
              </p>
              {deleteDirectory && (
                <p className="text-xs text-destructive font-medium">
                  ⚠️ 目录中的所有文件将被永久删除！
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              "删除中..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteDirectory ? "删除项目和目录" : "删除项目"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
