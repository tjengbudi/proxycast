/**
 * 剧本画布类型定义
 */

/** 对白 */
export interface Dialogue {
  id: string;
  characterId: string;
  characterName: string;
  content: string;
  direction?: string; // 表演指示
  emotion?: string;
}

/** 场景 */
export interface Scene {
  id: string;
  number: number;
  location: string;
  time: string; // 日/夜/晨/昏
  description?: string;
  dialogues: Dialogue[];
}

/** 剧本画布状态 */
export interface ScriptCanvasState {
  type: "script";
  scenes: Scene[];
  currentSceneId: string;
  title?: string;
  synopsis?: string;
}

/** 创建初始剧本状态 */
export function createInitialScriptState(content?: string): ScriptCanvasState {
  const defaultScene: Scene = {
    id: crypto.randomUUID(),
    number: 1,
    location: "内景",
    time: "日",
    description: "",
    dialogues: [],
  };

  // 如果有内容，尝试解析
  if (content) {
    const scenes = parseScriptContent(content);
    if (scenes.length > 0) {
      return {
        type: "script",
        scenes,
        currentSceneId: scenes[0].id,
      };
    }
  }

  return {
    type: "script",
    scenes: [defaultScene],
    currentSceneId: defaultScene.id,
  };
}

/** 解析剧本内容 */
function parseScriptContent(content: string): Scene[] {
  const scenes: Scene[] = [];
  const lines = content.split("\n");

  let currentScene: Scene | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // 场景标题：## 第X场 或 场景X
    const sceneMatch = trimmed.match(
      /^(?:##\s*)?(?:第(\d+)场|场景\s*(\d+))[：:]\s*(.+)?/,
    );
    if (sceneMatch) {
      if (currentScene) {
        scenes.push(currentScene);
      }
      const sceneNum = parseInt(sceneMatch[1] || sceneMatch[2]);
      currentScene = {
        id: crypto.randomUUID(),
        number: sceneNum,
        location: sceneMatch[3] || "内景",
        time: "日",
        dialogues: [],
      };
      continue;
    }

    // 对白：角色名：内容
    const dialogueMatch = trimmed.match(/^([^：:]+)[：:]\s*(.+)/);
    if (dialogueMatch && currentScene) {
      currentScene.dialogues.push({
        id: crypto.randomUUID(),
        characterId: "",
        characterName: dialogueMatch[1].trim(),
        content: dialogueMatch[2].trim(),
      });
    }
  }

  if (currentScene) {
    scenes.push(currentScene);
  }

  return scenes;
}

/** 将剧本状态转换为文本 */
export function scriptStateToText(state: ScriptCanvasState): string {
  let text = "";

  if (state.title) {
    text += `# ${state.title}\n\n`;
  }

  if (state.synopsis) {
    text += `${state.synopsis}\n\n`;
  }

  for (const scene of state.scenes) {
    text += `## 第${scene.number}场：${scene.location}（${scene.time}）\n\n`;

    if (scene.description) {
      text += `*${scene.description}*\n\n`;
    }

    for (const dialogue of scene.dialogues) {
      if (dialogue.direction) {
        text += `（${dialogue.direction}）\n`;
      }
      text += `${dialogue.characterName}：${dialogue.content}\n`;
    }

    text += "\n";
  }

  return text;
}
