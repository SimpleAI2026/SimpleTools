# Review package Task 8
BASE: f7a06f07ee7846a6677a434de47bdf17bb3ab21f
HEAD: 3a31e12b06e63e5c511e782b47cf9ec4e1806e7c

## Commits
3a31e12 feat(agent): add /agent route, header entry, and i18n

## Stat
 src/App.vue                         | 19 ++++++++++++++++---
 src/components/layout/AppHeader.vue | 25 ++++++++++++++++++++++++-
 src/i18n/locales/de.ts              | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/en.ts              | 26 ++++++++++++++++++++++++++
 src/i18n/locales/es.ts              | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/fr.ts              | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/ja.ts              | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/ko.ts              | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/pt-BR.ts           | 28 +++++++++++++++++++++++++++-
 src/i18n/locales/zh-CN.ts           | 26 ++++++++++++++++++++++++++
 src/pages/AgentPage.vue             | 15 +++++++++++++++
 src/router/index.ts                 |  7 +++++++
 12 files changed, 276 insertions(+), 10 deletions(-)

## Diff
diff --git a/src/App.vue b/src/App.vue
index 388b71c..e00abcb 100644
--- a/src/App.vue
+++ b/src/App.vue
@@ -1,18 +1,31 @@
 <script setup lang="ts">
+import { computed } from 'vue'
+import { useRoute } from 'vue-router'
 import AppHeader from '@/components/layout/AppHeader.vue'
 import { useSettingsStore } from '@/stores/settings'
 
 useSettingsStore()
+const route = useRoute()
+const isAgent = computed(() => route.name === 'agent')
 </script>
 
 <template>
-  <div class="min-h-screen">
+  <div class="min-h-screen" :class="isAgent ? 'flex h-dvh flex-col overflow-hidden' : ''">
     <AppHeader />
-    <main class="mx-auto w-full max-w-6xl px-4 py-6">
+    <main
+      :class="
+        isAgent
+          ? 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-0 sm:px-4'
+          : 'mx-auto w-full max-w-6xl px-4 py-6'
+      "
+    >
       <RouterView />
     </main>
-    <footer class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs">
+    <footer
+      v-if="!isAgent"
+      class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs"
+    >
       {{ $t('app.privacy') }}
     </footer>
   </div>
 </template>
diff --git a/src/components/layout/AppHeader.vue b/src/components/layout/AppHeader.vue
index d83d96f..b9b2743 100644
--- a/src/components/layout/AppHeader.vue
+++ b/src/components/layout/AppHeader.vue
@@ -1,11 +1,11 @@
 <script setup lang="ts">
 import { ref } from 'vue'
-import { Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
+import { Bot, Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
 import { Button } from '@/components/ui/button'
 import InstallExtensionModal, { type ExtensionKind } from '@/components/layout/InstallExtensionModal.vue'
 import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
 import { useSettingsStore } from '@/stores/settings'
 
 const settings = useSettingsStore()
 
 function onLocaleChange(event: Event) {
@@ -74,16 +74,39 @@ function openInstall(kind: ExtensionKind) {
             class="sm:hidden"
             :aria-label="$t('app.extensions.vscode')"
             data-testid="vscode-extension-entry-icon"
             @click="openInstall('vscode')"
           >
             <Code2 />
           </Button>
         </template>
+        <Button
+          variant="ghost"
+          size="sm"
+          class="hidden sm:inline-flex"
+          as-child
+          data-testid="agent-entry"
+        >
+          <RouterLink to="/agent" :aria-label="$t('app.agent')">
+            <Bot />
+            <span>{{ $t('app.agent') }}</span>
+          </RouterLink>
+        </Button>
+        <Button
+          variant="ghost"
+          size="icon"
+          class="sm:hidden"
+          as-child
+          data-testid="agent-entry-icon"
+        >
+          <RouterLink to="/agent" :aria-label="$t('app.agent')">
+            <Bot />
+          </RouterLink>
+        </Button>
         <Button
           variant="ghost"
           size="icon"
           as-child
           data-testid="github-link"
         >
           <a
             :href="GITHUB_URL"
diff --git a/src/i18n/locales/de.ts b/src/i18n/locales/de.ts
index 6878d22..a03b96a 100644
--- a/src/i18n/locales/de.ts
+++ b/src/i18n/locales/de.ts
@@ -17,16 +17,18 @@ const de: MessageSchema = {
     addFavorite: "Zu Favoriten hinzufügen",
     removeFavorite: "Aus Favoriten entfernen",
     notFound: "Seite nicht gefunden",
     notFoundDesc: "Die von Ihnen angeforderte Seite oder das von Ihnen angeforderte Tool existiert nicht.",
     loading: "Laden…",
     loadError: "Das Werkzeug konnte nicht geladen werden. Bitte aktualisieren.",
     privacy: "Alles läuft lokal in Ihrem Browser.",
     toolCount: "{n} Werkzeuge",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Chrome-Erweiterung",
       vscode: "VS Code-Erweiterung",
       chromeTitle: "Installieren Sie die Chrome-Erweiterung",
       vscodeTitle: "Installieren Sie die VS Code-Erweiterung",
       close: "Schließen",
       chromeStep1: "Klicken Sie unten auf „Herunterladen“, um das ZIP-Paket zu erhalten.",
       chromeStep2: "Entpacken Sie es. Das entpackte Ordnerstammverzeichnis sollte manifest.json enthalten.",
@@ -207,12 +209,36 @@ const de: MessageSchema = {
       format: "Ausgabeformat",
       quality: "Qualität",
       resize: "Größe ändern und herunterladen",
       original: "Original",
       result: "Ergebnis",
       notImage: "Bitte wählen Sie eine Bilddatei aus",
       failed: "Die Bildverarbeitung ist fehlgeschlagen"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default de
diff --git a/src/i18n/locales/en.ts b/src/i18n/locales/en.ts
index b60d9b9..1c8582c 100644
--- a/src/i18n/locales/en.ts
+++ b/src/i18n/locales/en.ts
@@ -17,16 +17,18 @@ const en: MessageSchema = {
     addFavorite: 'Add to favorites',
     removeFavorite: 'Remove from favorites',
     notFound: 'Page not found',
     notFoundDesc: 'The page or tool you requested does not exist.',
     loading: 'Loading…',
     loadError: 'Failed to load the tool. Please refresh.',
     privacy: 'Everything runs locally in your browser.',
     toolCount: '{n} tools',
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: 'Chrome extension',
       vscode: 'VS Code extension',
       chromeTitle: 'Install Chrome extension',
       vscodeTitle: 'Install VS Code extension',
       close: 'Close',
       chromeStep1: 'Click Download below to get the ZIP package.',
       chromeStep2: 'Unzip it. The unzipped folder root should contain manifest.json.',
@@ -208,11 +210,35 @@ const en: MessageSchema = {
       quality: 'Quality',
       resize: 'Resize & download',
       original: 'Original',
       result: 'Result',
       notImage: 'Please choose an image file',
       failed: 'Image processing failed',
     },
   },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default en
diff --git a/src/i18n/locales/es.ts b/src/i18n/locales/es.ts
index 4985bd8..f9c618d 100644
--- a/src/i18n/locales/es.ts
+++ b/src/i18n/locales/es.ts
@@ -17,16 +17,18 @@ const es: MessageSchema = {
     addFavorite: "Añadir a favoritos",
     removeFavorite: "Quitar de favoritos",
     notFound: "Página no encontrada",
     notFoundDesc: "La página o herramienta que solicitaste no existe.",
     loading: "Cargando…",
     loadError: "No se pudo cargar la herramienta. Por favor actualice.",
     privacy: "Todo se ejecuta localmente en su navegador.",
     toolCount: "{n} herramientas",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extensión de Chrome",
       vscode: "Extensión de código VS",
       chromeTitle: "Instalar la extensión de Chrome",
       vscodeTitle: "Instalar la extensión VS Code",
       close: "Cerrar",
       chromeStep1: "Haga clic en Descargar a continuación para obtener el paquete ZIP.",
       chromeStep2: "Descomprímelo. La raíz de la carpeta descomprimida debe contener manifest.json.",
@@ -207,12 +209,36 @@ const es: MessageSchema = {
       format: "Formato de salida",
       quality: "Calidad",
       resize: "Cambiar tamaño y descargar",
       original: "Original",
       result: "Resultado",
       notImage: "Por favor elija un archivo de imagen",
       failed: "Error al procesar la imagen"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default es
diff --git a/src/i18n/locales/fr.ts b/src/i18n/locales/fr.ts
index 1800d7a..336ace4 100644
--- a/src/i18n/locales/fr.ts
+++ b/src/i18n/locales/fr.ts
@@ -17,16 +17,18 @@ const fr: MessageSchema = {
     addFavorite: "Ajouter aux favoris",
     removeFavorite: "Supprimer des favoris",
     notFound: "Page introuvable",
     notFoundDesc: "La page ou l'outil que vous avez demandé n'existe pas.",
     loading: "Chargement…",
     loadError: "Échec du chargement de l'outil. Veuillez actualiser.",
     privacy: "Tout s'exécute localement dans votre navigateur.",
     toolCount: "{n} outils",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extension Chrome",
       vscode: "Extension du code VS",
       chromeTitle: "Installer l'extension Chrome",
       vscodeTitle: "Installer l'extension VS Code",
       close: "Fermer",
       chromeStep1: "Cliquez sur Télécharger ci-dessous pour obtenir le package ZIP.",
       chromeStep2: "Décompressez-le. La racine du dossier décompressé doit contenir manifest.json.",
@@ -207,12 +209,36 @@ const fr: MessageSchema = {
       format: "Format de sortie",
       quality: "Qualité",
       resize: "Redimensionner et télécharger",
       original: "Original",
       result: "Résultat",
       notImage: "Veuillez choisir un fichier image",
       failed: "Le traitement de l'image a échoué"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default fr
diff --git a/src/i18n/locales/ja.ts b/src/i18n/locales/ja.ts
index 611377b..aa90415 100644
--- a/src/i18n/locales/ja.ts
+++ b/src/i18n/locales/ja.ts
@@ -17,16 +17,18 @@ const ja: MessageSchema = {
     addFavorite: "お気に入りに追加",
     removeFavorite: "お気に入りから削除",
     notFound: "ページが見つかりません",
     notFoundDesc: "要求したページまたはツールは存在しません。",
     loading: "読み込み中…",
     loadError: "ツールのロードに失敗しました。リフレッシュしてください。",
     privacy: "すべてがブラウザ内でローカルに実行されます。",
     toolCount: "{n} ツール",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Chrome拡張機能",
       vscode: "VS コード拡張機能",
       chromeTitle: "Chrome拡張機能をインストールする",
       vscodeTitle: "VS Code拡張機能をインストールする",
       close: "閉じる",
       chromeStep1: "以下の [ダウンロード] をクリックして ZIP パッケージを入手します。",
       chromeStep2: "解凍してください。解凍したフォルダーのルートには、manifest.json が含まれている必要があります。",
@@ -207,12 +209,36 @@ const ja: MessageSchema = {
       format: "出力フォーマット",
       quality: "品質",
       resize: "サイズ変更とダウンロード",
       original: "オリジナル",
       result: "結果",
       notImage: "画像ファイルを選択してください",
       failed: "画像処理に失敗しました"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ja
diff --git a/src/i18n/locales/ko.ts b/src/i18n/locales/ko.ts
index d1bac73..95a8ebc 100644
--- a/src/i18n/locales/ko.ts
+++ b/src/i18n/locales/ko.ts
@@ -17,16 +17,18 @@ const ko: MessageSchema = {
     addFavorite: "즐겨찾기에 추가",
     removeFavorite: "즐겨찾기에서 제거",
     notFound: "페이지를 찾을 수 없습니다",
     notFoundDesc: "요청하신 페이지나 도구가 존재하지 않습니다.",
     loading: "로드 중…",
     loadError: "도구를 로드하지 못했습니다. 새로고침하세요.",
     privacy: "모든 것이 브라우저에서 로컬로 실행됩니다.",
     toolCount: "{n} 도구",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "크롬 확장 프로그램",
       vscode: "VS 코드 확장",
       chromeTitle: "Chrome 확장 프로그램 설치",
       vscodeTitle: "VS Code 확장 설치",
       close: "닫기",
       chromeStep1: "ZIP 패키지를 받으려면 아래 다운로드를 클릭하세요.",
       chromeStep2: "압축을 푼다. 압축을 푼 폴더 루트에는 Manifest.json이 포함되어 있어야 합니다.",
@@ -207,12 +209,36 @@ const ko: MessageSchema = {
       format: "출력 형식",
       quality: "품질",
       resize: "크기 조정 및 다운로드",
       original: "원래의",
       result: "결과",
       notImage: "이미지 파일을 선택해주세요",
       failed: "이미지 처리 실패"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ko
diff --git a/src/i18n/locales/pt-BR.ts b/src/i18n/locales/pt-BR.ts
index 638da32..2973fc7 100644
--- a/src/i18n/locales/pt-BR.ts
+++ b/src/i18n/locales/pt-BR.ts
@@ -17,16 +17,18 @@ const ptBR: MessageSchema = {
     addFavorite: "Adicionar aos favoritos",
     removeFavorite: "Remover dos favoritos",
     notFound: "Página não encontrada",
     notFoundDesc: "A página ou ferramenta que você solicitou não existe.",
     loading: "Carregando…",
     loadError: "Falha ao carregar a ferramenta. Atualize.",
     privacy: "Tudo é executado localmente no seu navegador.",
     toolCount: "{n} ferramentas",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extensão do Chrome",
       vscode: "Extensão do código VS",
       chromeTitle: "Instale a extensão do Chrome",
       vscodeTitle: "Instale a extensão do VS Code",
       close: "Fechar",
       chromeStep1: "Clique em Download abaixo para obter o pacote ZIP.",
       chromeStep2: "Descompacte-o. A raiz da pasta descompactada deve conter manifest.json.",
@@ -207,12 +209,36 @@ const ptBR: MessageSchema = {
       format: "Formato de saída",
       quality: "Qualidade",
       resize: "Redimensionar e baixar",
       original: "Original",
       result: "Resultado",
       notImage: "Escolha um arquivo de imagem",
       failed: "Falha no processamento de imagem"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ptBR
diff --git a/src/i18n/locales/zh-CN.ts b/src/i18n/locales/zh-CN.ts
index 3da96ea..7dfa0f3 100644
--- a/src/i18n/locales/zh-CN.ts
+++ b/src/i18n/locales/zh-CN.ts
@@ -15,16 +15,18 @@ const zhCN = {
     addFavorite: '加入收藏',
     removeFavorite: '取消收藏',
     notFound: '页面不存在',
     notFoundDesc: '你访问的页面或工具不存在。',
     loading: '加载中…',
     loadError: '工具加载失败，请刷新重试。',
     privacy: '所有处理均在本地浏览器中完成。',
     toolCount: '共 {n} 个工具',
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: 'Chrome 插件',
       vscode: 'VS Code 插件',
       chromeTitle: '安装 Chrome 插件',
       vscodeTitle: '安装 VS Code 插件',
       close: '关闭',
       chromeStep1: '点击下方「下载」获取 ZIP 安装包。',
       chromeStep2: '解压 ZIP；解压后的文件夹根目录应包含 manifest.json。',
@@ -206,12 +208,36 @@ const zhCN = {
       quality: '质量',
       resize: '调整并下载',
       original: '原图',
       result: '结果',
       notImage: '请选择图片文件',
       failed: '图片处理失败',
     },
   },
+  agent: {
+    newChat: '新会话',
+    threads: '会话',
+    deleteThread: '删除会话',
+    placeholder: '输入消息…（可让模型调用本机工具）',
+    send: '发送',
+    stop: '停止',
+    settings: '模型设置',
+    settingsTitle: 'BYOK 设置',
+    settingsDesc: '密钥仅保存在本机 localStorage，不会上传到 SimpleTools 服务器。',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: '模型',
+    systemPrompt: '系统提示',
+    rememberKey: '在本机记住 API Key',
+    save: '保存',
+    cancel: '取消',
+    empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
+    missingSettings: '请先配置 Base URL、API Key 与模型。',
+    toolCall: '调用工具',
+    toolResult: '工具结果',
+    streaming: '生成中…',
+    error: '出错了',
+  },
 }
 
 export default zhCN
 export type MessageSchema = typeof zhCN
diff --git a/src/pages/AgentPage.vue b/src/pages/AgentPage.vue
new file mode 100644
index 0000000..6f0775c
--- /dev/null
+++ b/src/pages/AgentPage.vue
@@ -0,0 +1,15 @@
+<script setup lang="ts">
+import { onMounted } from 'vue'
+import { useAgentStore } from '@/stores/agent'
+
+const agent = useAgentStore()
+onMounted(() => {
+  void agent.init()
+})
+</script>
+
+<template>
+  <div class="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-8 text-sm" data-testid="agent-page">
+    {{ $t('agent.empty') }}
+  </div>
+</template>
diff --git a/src/router/index.ts b/src/router/index.ts
index 4914fc2..2056eeb 100644
--- a/src/router/index.ts
+++ b/src/router/index.ts
@@ -15,23 +15,30 @@ export const router = createRouter({
     { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
     {
       path: '/tools/:slug',
       name: 'tool',
       component: () => import('@/pages/ToolPage.vue'),
       props: true,
       beforeEnter: (to) => (getTool(String(to.params.slug)) ? true : { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }),
     },
+    {
+      path: '/agent',
+      name: 'agent',
+      component: () => import('@/pages/AgentPage.vue'),
+    },
     { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
   ],
   scrollBehavior: () => ({ top: 0 }),
 })
 
 router.afterEach((to) => {
   const t = i18n.global.t
   if (to.name === 'tool') {
     const slug = String(to.params.slug)
     useUserStore().addRecent(slug)
     document.title = `${t(`tools.${slug}.name`)} · SimpleTools`
+  } else if (to.name === 'agent') {
+    document.title = `${t('app.agentTitle')} · SimpleTools`
   } else {
     document.title = 'SimpleTools'
   }
 })
