# ProxyCast 设置页面重构设计

> 参考 LobeHub 的设置架构，为 ProxyCast 设计现代化的设置界面

## 一、设计目标

1. **分类清晰**：将设置项按功能分组，便于用户快速定位
2. **侧边导航**：采用左侧菜单 + 右侧内容的布局
3. **可扩展性**：支持动态添加设置模块
4. **一致性**：与 LobeHub 风格保持一致

## 二、设置分类设计

### 分组结构

```
📁 账号 (Account)
├── 👤 个人资料 (Profile)
└── 📊 数据统计 (Stats)

📁 通用 (General)
├── 🎨 外观 (Appearance)
├── 💬 聊天外观 (Chat Appearance)
└── ⌨️ 快捷键 (Hotkeys)

📁 智能体 (Agent)
├── 🧠 AI 服务商 (Providers)      → 现有 Provider Pool
├── 🤖 助理服务 (Assistant)       → Agent 配置
├── 🔧 技能管理 (Skills/MCP)      → 现有 MCP 页面
├── 🧩 记忆设置 (Memory)          → 新增
├── 🎨 绘画服务 (Image Gen)       → 现有 Image Gen 配置
└── 🎤 语音服务 (Voice/TTS)       → 新增

📁 系统 (System)
├── 🌐 网络代理 (Proxy)           → 现有 ProxySettings
├── 💾 数据存储 (Storage)         → 现有 DirectorySettings
├── 🔒 安全设置 (Security)        → 现有 TlsSettings + RemoteManagement
├── 🔌 外部工具 (External Tools)  → 现有 ExternalToolsSettings
├── 🧪 实验功能 (Experimental)    → 现有 ExperimentalSettings
├── 💻 开发者 (Developer)         → 现有 DeveloperSettings
└── ℹ️ 关于 (About)              → 现有 AboutSection
```

## 三、路由设计

### 设置页面路由枚举

```typescript
// src/types/settings.ts

export enum SettingsGroupKey {
  Account = 'account',
  General = 'general',
  Agent = 'agent',
  System = 'system',
}

export enum SettingsTabs {
  // 账号
  Profile = 'profile',
  Stats = 'stats',
  
  // 通用
  Appearance = 'appearance',
  ChatAppearance = 'chat-appearance',
  Hotkeys = 'hotkeys',
  
  // 智能体
  Providers = 'providers',
  Assistant = 'assistant',
  Skills = 'skills',
  Memory = 'memory',
  ImageGen = 'image-gen',
  Voice = 'voice',
  
  // 系统
  Proxy = 'proxy',
  Storage = 'storage',
  Security = 'security',
  ExternalTools = 'external-tools',
  Experimental = 'experimental',
  Developer = 'developer',
  About = 'about',
}
```

## 四、目录结构

```
src/components/settings/
├── _layout/                      # 布局层
│   ├── index.tsx                # 主布局组件
│   ├── SettingsSidebar.tsx      # 设置侧边栏
│   ├── SettingsSidebarBody.tsx  # 侧边栏导航菜单
│   └── styles.ts                # 布局样式
├── hooks/
│   └── useSettingsCategory.ts   # 设置分类定义
├── features/
│   └── SettingHeader.tsx        # 设置页头部组件
│
├── account/                      # 账号设置组
│   ├── profile/                 # 个人资料
│   │   └── index.tsx
│   └── stats/                   # 数据统计
│       └── index.tsx
│
├── general/                      # 通用设置组
│   ├── appearance/              # 外观设置
│   │   ├── index.tsx
│   │   └── ThemeSelector.tsx
│   ├── chat-appearance/         # 聊天外观
│   │   └── index.tsx
│   └── hotkeys/                 # 快捷键
│       └── index.tsx
│
├── agent/                        # 智能体设置组
│   ├── providers/               # AI 服务商
│   │   └── index.tsx
│   ├── assistant/               # 助理服务
│   │   └── index.tsx
│   ├── skills/                  # 技能/MCP
│   │   └── index.tsx
│   ├── memory/                  # 记忆设置
│   │   └── index.tsx
│   ├── image-gen/               # 绘画服务
│   │   └── index.tsx
│   └── voice/                   # 语音服务
│       └── index.tsx
│
├── system/                       # 系统设置组
│   ├── proxy/                   # 网络代理
│   │   └── index.tsx
│   ├── storage/                 # 数据存储
│   │   └── index.tsx
│   ├── security/                # 安全设置
│   │   └── index.tsx
│   ├── external-tools/          # 外部工具
│   │   └── index.tsx
│   ├── experimental/            # 实验功能
│   │   └── index.tsx
│   ├── developer/               # 开发者
│   │   └── index.tsx
│   └── about/                   # 关于
│       └── index.tsx
│
└── index.tsx                     # 导出入口
```

## 五、核心组件设计

### 5.1 设置分类 Hook

```typescript
// src/components/settings/hooks/useSettingsCategory.ts

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  BarChart3,
  Palette,
  MessageSquare,
  Keyboard,
  Brain,
  Bot,
  Blocks,
  BrainCircuit,
  Image,
  Mic,
  Globe,
  Database,
  Shield,
  Wrench,
  FlaskConical,
  Code,
  Info,
  LucideIcon,
} from 'lucide-react';
import { SettingsGroupKey, SettingsTabs } from '@/types/settings';

export interface CategoryItem {
  key: SettingsTabs;
  label: string;
  icon: LucideIcon;
  experimental?: boolean;
}

export interface CategoryGroup {
  key: SettingsGroupKey;
  title: string;
  items: CategoryItem[];
}

export const useSettingsCategory = (): CategoryGroup[] => {
  const { t } = useTranslation('settings');

  return useMemo(() => {
    const groups: CategoryGroup[] = [];

    // 账号组
    groups.push({
      key: SettingsGroupKey.Account,
      title: t('group.account'),
      items: [
        { key: SettingsTabs.Profile, label: t('tab.profile'), icon: User },
        { key: SettingsTabs.Stats, label: t('tab.stats'), icon: BarChart3 },
      ],
    });

    // 通用组
    groups.push({
      key: SettingsGroupKey.General,
      title: t('group.general'),
      items: [
        { key: SettingsTabs.Appearance, label: t('tab.appearance'), icon: Palette },
        { key: SettingsTabs.ChatAppearance, label: t('tab.chatAppearance'), icon: MessageSquare },
        { key: SettingsTabs.Hotkeys, label: t('tab.hotkeys'), icon: Keyboard },
      ],
    });

    // 智能体组
    groups.push({
      key: SettingsGroupKey.Agent,
      title: t('group.agent'),
      items: [
        { key: SettingsTabs.Providers, label: t('tab.providers'), icon: Brain },
        { key: SettingsTabs.Assistant, label: t('tab.assistant'), icon: Bot },
        { key: SettingsTabs.Skills, label: t('tab.skills'), icon: Blocks },
        { key: SettingsTabs.Memory, label: t('tab.memory'), icon: BrainCircuit },
        { key: SettingsTabs.ImageGen, label: t('tab.imageGen'), icon: Image },
        { key: SettingsTabs.Voice, label: t('tab.voice'), icon: Mic },
      ],
    });

    // 系统组
    groups.push({
      key: SettingsGroupKey.System,
      title: t('group.system'),
      items: [
        { key: SettingsTabs.Proxy, label: t('tab.proxy'), icon: Globe },
        { key: SettingsTabs.Storage, label: t('tab.storage'), icon: Database },
        { key: SettingsTabs.Security, label: t('tab.security'), icon: Shield },
        { key: SettingsTabs.ExternalTools, label: t('tab.externalTools'), icon: Wrench },
        { key: SettingsTabs.Experimental, label: t('tab.experimental'), icon: FlaskConical, experimental: true },
        { key: SettingsTabs.Developer, label: t('tab.developer'), icon: Code },
        { key: SettingsTabs.About, label: t('tab.about'), icon: Info },
      ],
    });

    return groups;
  }, [t]);
};
```

### 5.2 设置布局组件

```typescript
// src/components/settings/_layout/index.tsx

import { useState } from 'react';
import styled from 'styled-components';
import { SettingsSidebar } from './SettingsSidebar';
import { SettingsTabs } from '@/types/settings';

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  background: hsl(var(--background));
`;

const ContentContainer = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
`;

interface SettingsLayoutProps {
  children?: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabs>(SettingsTabs.Profile);

  return (
    <LayoutContainer>
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <ContentContainer>
        {children}
      </ContentContainer>
    </LayoutContainer>
  );
}
```

### 5.3 设置侧边栏组件

```typescript
// src/components/settings/_layout/SettingsSidebar.tsx

import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSettingsCategory, CategoryGroup, CategoryItem } from '../hooks/useSettingsCategory';
import { SettingsTabs } from '@/types/settings';

const SidebarContainer = styled.aside`
  width: 240px;
  min-width: 240px;
  height: 100%;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  overflow-y: auto;
  padding: 16px 8px;
`;

const GroupContainer = styled.div`
  margin-bottom: 8px;
`;

const GroupHeader = styled.button<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s;
    transform: rotate(${({ $expanded }) => $expanded ? '0deg' : '-90deg'});
  }
`;

const GroupItems = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => $expanded ? 'flex' : 'none'};
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
`;

const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'hsl(var(--accent))' : 'transparent'};
  cursor: pointer;
  font-size: 14px;
  color: ${({ $active }) => $active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'};
  transition: all 0.15s;
  
  &:hover {
    background: hsl(var(--accent));
    color: hsl(var(--foreground));
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ExperimentalBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  background: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
  border-radius: 4px;
  margin-left: auto;
`;

interface SettingsSidebarProps {
  activeTab: SettingsTabs;
  onTabChange: (tab: SettingsTabs) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const categoryGroups = useSettingsCategory();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    account: true,
    general: true,
    agent: true,
    system: true,
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SidebarContainer>
      {categoryGroups.map((group) => (
        <GroupContainer key={group.key}>
          <GroupHeader 
            $expanded={expandedGroups[group.key] ?? true}
            onClick={() => toggleGroup(group.key)}
          >
            {group.title}
            <ChevronDown />
          </GroupHeader>
          <GroupItems $expanded={expandedGroups[group.key] ?? true}>
            {group.items.map((item) => (
              <NavItem
                key={item.key}
                $active={activeTab === item.key}
                onClick={() => onTabChange(item.key)}
              >
                <item.icon />
                {item.label}
                {item.experimental && <ExperimentalBadge>实验</ExperimentalBadge>}
              </NavItem>
            ))}
          </GroupItems>
        </GroupContainer>
      ))}
    </SidebarContainer>
  );
}
```

### 5.4 设置页头组件

```typescript
// src/components/settings/features/SettingHeader.tsx

import styled from 'styled-components';
import { ReactNode } from 'react';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: hsl(var(--border));
`;

interface SettingHeaderProps {
  title: ReactNode;
  extra?: ReactNode;
}

export function SettingHeader({ title, extra }: SettingHeaderProps) {
  return (
    <HeaderContainer>
      <TitleRow>
        <Title>{title}</Title>
        {extra}
      </TitleRow>
      <Divider />
    </HeaderContainer>
  );
}
```

## 六、i18n 配置

```json
// src/i18n/locales/zh-CN/settings.json
{
  "group": {
    "account": "账号",
    "general": "通用",
    "agent": "智能体",
    "system": "系统"
  },
  "tab": {
    "profile": "个人资料",
    "stats": "数据统计",
    "appearance": "外观",
    "chatAppearance": "聊天外观",
    "hotkeys": "快捷键",
    "providers": "AI 服务商",
    "assistant": "助理服务",
    "skills": "技能管理",
    "memory": "记忆设置",
    "imageGen": "绘画服务",
    "voice": "语音服务",
    "proxy": "网络代理",
    "storage": "数据存储",
    "security": "安全设置",
    "externalTools": "外部工具",
    "experimental": "实验功能",
    "developer": "开发者",
    "about": "关于"
  }
}
```

## 七、迁移计划

### 阶段 1：基础架构（1-2 天）
1. 创建设置类型定义 (`src/types/settings.ts`)
2. 创建设置分类 Hook (`useSettingsCategory.ts`)
3. 创建布局组件 (`_layout/`)
4. 添加 i18n 配置

### 阶段 2：迁移现有组件（2-3 天）
1. 将 `GeneralSettings.tsx` 拆分为 `appearance/` 和 `chat-appearance/`
2. 将 `ProxySettings.tsx` 迁移到 `system/proxy/`
3. 将 `DirectorySettings.tsx` 迁移到 `system/storage/`
4. 将 `TlsSettings.tsx` + `RemoteManagementSettings.tsx` 合并到 `system/security/`
5. 将 `ExternalToolsSettings.tsx` 迁移到 `system/external-tools/`
6. 将其他设置组件按分类迁移

### 阶段 3：新增功能（2-3 天）
1. 添加 `account/profile/` - 用户个人资料
2. 添加 `account/stats/` - 使用统计
3. 添加 `general/hotkeys/` - 快捷键设置
4. 添加 `agent/memory/` - 记忆管理
5. 添加 `agent/voice/` - 语音服务配置

### 阶段 4：集成 & 测试（1 天）
1. 更新 `App.tsx` 路由
2. 更新 `AppSidebar.tsx` 导航
3. 端到端测试

## 八、与 LobeHub 的对应关系

| LobeHub 设置项 | ProxyCast 对应 | 备注 |
|---------------|---------------|------|
| Profile | account/profile | 用户资料 |
| Stats | account/stats | 使用统计 |
| Common (外观) | general/appearance | 主题、语言等 |
| Chat Appearance | general/chat-appearance | 聊天气泡样式 |
| Hotkey | general/hotkeys | 快捷键配置 |
| Provider | agent/providers | AI 服务商配置 |
| Agent | agent/assistant | 助理配置 |
| Skill | agent/skills | MCP/技能管理 |
| Memory | agent/memory | 记忆设置 |
| Image | agent/image-gen | 绘画服务 |
| TTS | agent/voice | 语音服务 |
| Proxy | system/proxy | 网络代理 |
| Storage | system/storage | 数据存储 |
| About | system/about | 关于页面 |

## 九、UI 设计参考

### 颜色方案
- 使用 ProxyCast 现有的 CSS 变量（`hsl(var(--xxx))`）
- 侧边栏背景：`--card`
- 激活项背景：`--accent`
- 分组标题：`--muted-foreground`

### 间距规范
- 侧边栏宽度：240px
- 内容区左右 padding：32px
- 组间距：8px
- 项间距：2px
- 项内 padding：10px 12px

### 动画效果
- 分组展开/收起：0.2s ease
- 悬停效果：0.15s ease
- 页面切换：无动画（保持简洁）

---

**设计完成时间**: 2026-02-09
**预计开发时间**: 5-8 天
**参考项目**: LobeHub (lobehub/lobe-chat)
