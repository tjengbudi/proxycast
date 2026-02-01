/**
 * 角色管理面板
 *
 * 显示角色卡片列表，支持新建、编辑、删除角色
 */

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Edit2,
  Trash2,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Character,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  listCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/lib/api/memory";
import { toast } from "sonner";

interface CharacterPanelProps {
  projectId: string;
}

interface CharacterFormData {
  name: string;
  aliases: string;
  description: string;
  personality: string;
  background: string;
  appearance: string;
  is_main: boolean;
}

const emptyFormData: CharacterFormData = {
  name: "",
  aliases: "",
  description: "",
  personality: "",
  background: "",
  appearance: "",
  is_main: false,
};

export function CharacterPanel({ projectId }: CharacterPanelProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [formData, setFormData] = useState<CharacterFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listCharacters(projectId);
      setCharacters(list);
    } catch (error) {
      console.error("加载角色失败:", error);
      toast.error("加载角色失败");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleOpenCreate = () => {
    setEditingCharacter(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      aliases: character.aliases.join(", "),
      description: character.description || "",
      personality: character.personality || "",
      background: character.background || "",
      appearance: character.appearance || "",
      is_main: character.is_main,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("请输入角色名称");
      return;
    }

    setSaving(true);
    try {
      const aliases = formData.aliases
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingCharacter) {
        const request: UpdateCharacterRequest = {
          name: formData.name,
          aliases,
          description: formData.description || undefined,
          personality: formData.personality || undefined,
          background: formData.background || undefined,
          appearance: formData.appearance || undefined,
          is_main: formData.is_main,
        };
        await updateCharacter(editingCharacter.id, request);
        toast.success("角色已更新");
      } else {
        const request: CreateCharacterRequest = {
          project_id: projectId,
          name: formData.name,
          aliases,
          description: formData.description || undefined,
          personality: formData.personality || undefined,
          background: formData.background || undefined,
          appearance: formData.appearance || undefined,
          is_main: formData.is_main,
        };
        await createCharacter(request);
        toast.success("角色已创建");
      }
      setDialogOpen(false);
      loadCharacters();
    } catch (error) {
      console.error("保存角色失败:", error);
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (character: Character) => {
    if (!confirm(`确定要删除角色 "${character.name}" 吗？`)) {
      return;
    }

    try {
      await deleteCharacter(character.id);
      toast.success("角色已删除");
      loadCharacters();
    } catch (error) {
      console.error("删除角色失败:", error);
      toast.error("删除失败");
    }
  };

  // 分离主角和配角
  const mainCharacters = characters.filter((c) => c.is_main);
  const sideCharacters = characters.filter((c) => !c.is_main);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          共 {characters.length} 个角色
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadCharacters}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            新建角色
          </Button>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <User className="h-12 w-12 mb-4 opacity-50" />
            <p className="mb-4">还没有角色</p>
            <Button onClick={handleOpenCreate}>创建第一个角色</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 主角 */}
            {mainCharacters.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  主要角色
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mainCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onEdit={() => handleOpenEdit(character)}
                      onDelete={() => handleDelete(character)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 配角 */}
            {sideCharacters.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  次要角色
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sideCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onEdit={() => handleOpenEdit(character)}
                      onDelete={() => handleDelete(character)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCharacter ? "编辑角色" : "新建角色"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">角色名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="输入角色名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aliases">别名（逗号分隔）</Label>
                <Input
                  id="aliases"
                  value={formData.aliases}
                  onChange={(e) =>
                    setFormData({ ...formData, aliases: e.target.value })
                  }
                  placeholder="小明, 阿明"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_main"
                checked={formData.is_main}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_main: checked })
                }
              />
              <Label htmlFor="is_main">主要角色</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">角色简介</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="简要描述这个角色"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">性格特点</Label>
              <Textarea
                id="personality"
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                placeholder="描述角色的性格特点"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">背景故事</Label>
              <Textarea
                id="background"
                value={formData.background}
                onChange={(e) =>
                  setFormData({ ...formData, background: e.target.value })
                }
                placeholder="角色的背景故事"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appearance">外貌描述</Label>
              <Textarea
                id="appearance"
                value={formData.appearance}
                onChange={(e) =>
                  setFormData({ ...formData, appearance: e.target.value })
                }
                placeholder="角色的外貌特征"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 角色卡片组件
interface CharacterCardProps {
  character: Character;
  onEdit: () => void;
  onDelete: () => void;
}

function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium flex items-center gap-1">
              {character.name}
              {character.is_main && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              )}
            </h4>
            {character.aliases.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {character.aliases.join(", ")}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {character.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {character.description}
        </p>
      )}

      {character.personality && (
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">性格：</span>
          <span className="text-xs">{character.personality}</span>
        </div>
      )}
    </div>
  );
}
