import type { AppLocale } from './index'

type ToolText = { name: string; description: string }
type ProgrammingMessages = Record<string, Record<AppLocale, ToolText>>

const descriptions: Record<string, Record<AppLocale, string>> = {
  python: {
    'zh-CN': '在浏览器中编辑和运行 Python，附快速入门教程。', en: 'Edit and run Python in your browser, with quick-start tutorials.', ja: 'ブラウザーで Python を編集・実行できる入門教程付きツールです。', ko: '브라우저에서 Python을 편집하고 실행하는 입문 튜토리얼 제공 도구입니다.', de: 'Python im Browser bearbeiten und ausführen, mit Schnellstart-Tutorials.', fr: 'Modifiez et exécutez Python dans le navigateur, avec des tutoriels de démarrage.', es: 'Edita y ejecuta Python en el navegador, con tutoriales de inicio.', 'pt-BR': 'Edite e execute Python no navegador, com tutoriais de início.',
  },
  ruby: {
    'zh-CN': '在浏览器中编辑和运行 Ruby，附快速入门教程。', en: 'Edit and run Ruby in your browser, with quick-start tutorials.', ja: 'ブラウザーで Ruby を編集・実行できる入門教程付きツールです。', ko: '브라우저에서 Ruby를 편집하고 실행하는 입문 튜토리얼 제공 도구입니다.', de: 'Ruby im Browser bearbeiten und ausführen, mit Schnellstart-Tutorials.', fr: 'Modifiez et exécutez Ruby dans le navigateur, avec des tutoriels de démarrage.', es: 'Edita y ejecuta Ruby en el navegador, con tutoriales de inicio.', 'pt-BR': 'Edite e execute Ruby no navegador, com tutoriais de início.',
  },
  javascript: {
    'zh-CN': '使用 QuickJS 编辑和运行 JavaScript，附快速入门教程。', en: 'Edit and run JavaScript with QuickJS, including quick-start tutorials.', ja: 'QuickJS で JavaScript を編集・実行できる入門教程付きツールです。', ko: 'QuickJS로 JavaScript를 편집하고 실행하며 입문 튜토리얼을 제공합니다.', de: 'JavaScript mit QuickJS bearbeiten und ausführen, inklusive Schnellstart-Tutorials.', fr: 'Modifiez et exécutez JavaScript avec QuickJS, avec des tutoriels de démarrage.', es: 'Edita y ejecuta JavaScript con QuickJS, con tutoriales de inicio.', 'pt-BR': 'Edite e execute JavaScript com QuickJS, com tutoriais de início.',
  },
  typescript: {
    'zh-CN': '剥离类型后运行 TypeScript，附快速入门教程。', en: 'Run TypeScript after type stripping, with quick-start tutorials.', ja: '型を除去して TypeScript を実行できる入門教程付きツールです。', ko: '타입을 제거한 TypeScript를 실행하며 입문 튜토리얼을 제공합니다.', de: 'TypeScript nach dem Entfernen der Typen ausführen, mit Schnellstart-Tutorials.', fr: 'Exécutez TypeScript après suppression des types, avec des tutoriels de démarrage.', es: 'Ejecuta TypeScript tras eliminar los tipos, con tutoriales de inicio.', 'pt-BR': 'Execute TypeScript após remover os tipos, com tutoriais de início.',
  },
  sqlite: {
    'zh-CN': '在本地 SQLite 中编辑和执行 SQL，附交互式教程。', en: 'Edit and execute SQL in local SQLite, with interactive tutorials.', ja: 'ローカル SQLite で SQL を編集・実行できる、インタラクティブ教程付きです。', ko: '로컬 SQLite에서 SQL을 편집하고 실행하며 대화형 튜토리얼을 제공합니다.', de: 'SQL in lokalem SQLite bearbeiten und ausführen, mit interaktiven Tutorials.', fr: 'Modifiez et exécutez SQL dans SQLite local, avec tutoriels interactifs.', es: 'Edita y ejecuta SQL en SQLite local, con tutoriales interactivos.', 'pt-BR': 'Edite e execute SQL no SQLite local, com tutoriais interativos.',
  },
  c: {
    'zh-CN': '使用 Clang 在浏览器中编译和运行 C，附快速入门。', en: 'Compile and run C with Clang in your browser, with a quick-start tutorial.', ja: 'ブラウザーで Clang を使って C をコンパイル・実行し、入門教程を提供します。', ko: '브라우저에서 Clang으로 C를 컴파일하고 실행하며 입문 튜토리얼을 제공합니다.', de: 'C mit Clang im Browser kompilieren und ausführen, mit Schnellstart-Tutorial.', fr: 'Compilez et exécutez C avec Clang dans le navigateur, avec tutoriel de démarrage.', es: 'Compila y ejecuta C con Clang en el navegador, con tutorial de inicio.', 'pt-BR': 'Compile e execute C com Clang no navegador, com tutorial de início.',
  },
  cpp: {
    'zh-CN': '使用 Clang 在浏览器中编译和运行 C++，附快速入门。', en: 'Compile and run C++ with Clang in your browser, with a quick-start tutorial.', ja: 'ブラウザーで Clang を使って C++ をコンパイル・実行し、入門教程を提供します。', ko: '브라우저에서 Clang으로 C++를 컴파일하고 실행하며 입문 튜토리얼을 제공합니다.', de: 'C++ mit Clang im Browser kompilieren und ausführen, mit Schnellstart-Tutorial.', fr: 'Compilez et exécutez C++ avec Clang dans le navigateur, avec tutoriel de démarrage.', es: 'Compila y ejecuta C++ con Clang en el navegador, con tutorial de inicio.', 'pt-BR': 'Compile e execute C++ com Clang no navegador, com tutorial de início.',
  },
  php: {
    'zh-CN': '在浏览器中编辑和运行 PHP，附快速入门教程。', en: 'Edit and run PHP in your browser, with quick-start tutorials.', ja: 'ブラウザーで PHP を編集・実行できる入門教程付きツールです。', ko: '브라우저에서 PHP를 편집하고 실행하는 입문 튜토리얼 제공 도구입니다.', de: 'PHP im Browser bearbeiten und ausführen, mit Schnellstart-Tutorials.', fr: 'Modifiez et exécutez PHP dans le navigateur, avec des tutoriels de démarrage.', es: 'Edita y ejecuta PHP en el navegador, con tutoriales de inicio.', 'pt-BR': 'Edite e execute PHP no navegador, com tutoriais de início.',
  },
  lua: {
    'zh-CN': '在浏览器中编辑和运行 Lua，附快速入门教程。', en: 'Edit and run Lua in your browser, with quick-start tutorials.', ja: 'ブラウザーで Lua を編集・実行できる入門教程付きツールです。', ko: '브라우저에서 Lua를 편집하고 실행하는 입문 튜토리얼 제공 도구입니다.', de: 'Lua im Browser bearbeiten und ausführen, mit Schnellstart-Tutorials.', fr: 'Modifiez et exécutez Lua dans le navigateur, avec des tutoriels de démarrage.', es: 'Edita y ejecuta Lua en el navegador, con tutoriales de inicio.', 'pt-BR': 'Edite e execute Lua no navegador, com tutoriais de início.',
  },
  go: {
    'zh-CN': '使用 Yaegi 在浏览器中运行 Go，附快速入门教程。', en: 'Run Go with Yaegi in your browser, with quick-start tutorials.', ja: 'ブラウザーで Yaegi を使って Go を実行できる入門教程付きツールです。', ko: '브라우저에서 Yaegi로 Go를 실행하며 입문 튜토리얼을 제공합니다.', de: 'Go mit Yaegi im Browser ausführen, mit Schnellstart-Tutorials.', fr: 'Exécutez Go avec Yaegi dans le navigateur, avec des tutoriels de démarrage.', es: 'Ejecuta Go con Yaegi en el navegador, con tutoriales de inicio.', 'pt-BR': 'Execute Go com Yaegi no navegador, com tutoriais de início.',
  },
  shell: {
    'zh-CN': '在轻量 WASI Shell 中运行脚本，附交互式教程。', en: 'Run scripts in a lightweight WASI shell, with interactive tutorials.', ja: '軽量 WASI Shell でスクリプトを実行できる、インタラクティブ教程付きです。', ko: '가벼운 WASI Shell에서 스크립트를 실행하며 대화형 튜토리얼을 제공합니다.', de: 'Skripte in einer leichten WASI-Shell ausführen, mit interaktiven Tutorials.', fr: 'Exécutez des scripts dans un shell WASI léger, avec tutoriels interactifs.', es: 'Ejecuta scripts en un shell WASI ligero, con tutoriales interactivos.', 'pt-BR': 'Execute scripts em um shell WASI leve, com tutoriais interativos.',
  },
  rust: {
    'zh-CN': '在浏览器中编译和运行 Rust，附快速入门教程。', en: 'Compile and run Rust in your browser, with quick-start tutorials.', ja: 'ブラウザーで Rust をコンパイル・実行できる入門教程付きツールです。', ko: '브라우저에서 Rust를 컴파일하고 실행하는 입문 튜토리얼 제공 도구입니다.', de: 'Rust im Browser kompilieren und ausführen, mit Schnellstart-Tutorials.', fr: 'Compilez et exécutez Rust dans le navigateur, avec des tutoriels de démarrage.', es: 'Compila y ejecuta Rust en el navegador, con tutoriales de inicio.', 'pt-BR': 'Compile e execute Rust no navegador, com tutoriais de início.',
  },
  java: {
    'zh-CN': '使用 TeaVM 在浏览器中编译和运行 Java，附快速入门教程。', en: 'Compile and run Java with TeaVM in your browser, with quick-start tutorials.', ja: 'TeaVM で Java をブラウザー内にコンパイル・実行できる入門教程付きツールです。', ko: 'TeaVM으로 Java를 브라우저에서 컴파일하고 실행하며 입문 튜토리얼을 제공합니다.', de: 'Java mit TeaVM im Browser kompilieren und ausführen, mit Schnellstart-Tutorials.', fr: 'Compilez et exécutez Java avec TeaVM dans le navigateur, avec des tutoriels de démarrage.', es: 'Compila y ejecuta Java con TeaVM en el navegador, con tutoriales de inicio.', 'pt-BR': 'Compile e execute Java com TeaVM no navegador, com tutoriais de início.',
  },
  linux: {
    'zh-CN': '在浏览器中的本地 Linux 虚拟机里运行 Shell 和学习命令。', en: 'Run shell scripts and learn commands in a local Linux virtual machine.', ja: 'ローカル Linux 仮想マシンで Shell を実行し、コマンドを学習します。', ko: '로컬 Linux 가상 머신에서 Shell을 실행하고 명령어를 학습합니다.', de: 'Shell-Skripte ausführen und Befehle in einer lokalen Linux-VM lernen.', fr: 'Exécutez des scripts shell et apprenez les commandes dans une VM Linux locale.', es: 'Ejecuta scripts de shell y aprende comandos en una máquina virtual Linux local.', 'pt-BR': 'Execute scripts shell e aprenda comandos em uma máquina virtual Linux local.',
  },
  deeplearning: {
    'zh-CN': '使用 Pyodide 和 NumPy 运行深度学习示例，附完整教程。', en: 'Run deep-learning examples with Pyodide and NumPy, with full tutorials.', ja: 'Pyodide と NumPy で深層学習の例を実行し、完全な教程を提供します。', ko: 'Pyodide와 NumPy로 딥러닝 예제를 실행하며 전체 튜토리얼을 제공합니다.', de: 'Deep-Learning-Beispiele mit Pyodide und NumPy ausführen, mit vollständigen Tutorials.', fr: 'Exécutez des exemples de deep learning avec Pyodide et NumPy, avec tutoriels complets.', es: 'Ejecuta ejemplos de aprendizaje profundo con Pyodide y NumPy, con tutoriales completos.', 'pt-BR': 'Execute exemplos de deep learning com Pyodide e NumPy, com tutoriais completos.',
  },
}

const names: Record<string, string> = {
  python: 'Python', ruby: 'Ruby', javascript: 'JavaScript', typescript: 'TypeScript', sqlite: 'SQLite', c: 'C', cpp: 'C++', php: 'PHP', lua: 'Lua', go: 'Go', shell: 'Shell', rust: 'Rust', java: 'Java', linux: 'Linux', deeplearning: 'DeepLearning',
}

const extensionIds = new Set(['javascript', 'typescript', 'sqlite', 'lua', 'shell', 'java'])
const allRuntimes = import.meta.env.VITE_ENABLE_ALL_CODE_RUNTIMES !== 'false'

export const PROGRAMMING_MESSAGES: ProgrammingMessages = Object.fromEntries(
  Object.entries(descriptions).filter(([id]) => allRuntimes || extensionIds.has(id)).map(([id, texts]) => [
    `code-${id}`,
    Object.fromEntries(Object.entries(texts).map(([locale, description]) => [locale, { name: names[id], description }])),
  ]),
) as ProgrammingMessages
