export default {
  'zh-CN': {
    name: 'A/B 转化分析', description: '对两组独立的成功数和试验数做大样本比例检验。', disclaimer: '小样本不强行报显著。这不是序贯检验，也不保证因果。',
    trials: '试验人数', conversions: '成功转化数', groupA: 'A 组（对照）', groupB: 'B 组（实验）', direction: '检验方向', twoSided: '双侧：A 与 B 不同', greater: '单侧：A 高于 B', less: '单侧：A 低于 B', rateA: 'A 转化率', rateB: 'B 转化率', difference: 'A − B 差值', notApplicable: '样本量或期望计数不足，正态近似不适用；不要据此判断显著性。', significant: '在当前 α 下达到统计显著，但仍需检查随机分组、实验周期与多重窥视。', notSignificant: '当前证据未达到统计显著；这不等于两组完全相同。',
    usageTitle: '使用方法', step1: '分别输入独立 A、B 两组的试验数和成功转化数。', step2: '选择预先确定的检验方向，查看转化率、差值、z 和 p。', step3: '导出结果并记录实验周期与分组条件，避免把结果当成因果保证。',
  },
  en: {
    name: 'A/B conversion test', description: 'Run a large-sample two-proportion test on two independent counts.', disclaimer: 'Small samples are not called significant. This is not a sequential or causal test.',
    trials: 'Trials', conversions: 'Successful conversions', groupA: 'Group A (control)', groupB: 'Group B (variant)', direction: 'Alternative hypothesis', twoSided: 'Two-sided: A differs from B', greater: 'One-sided: A is higher than B', less: 'One-sided: A is lower than B', rateA: 'A conversion rate', rateB: 'B conversion rate', difference: 'A − B difference', notApplicable: 'The sample size or expected counts are too small for the normal approximation. Do not infer significance.', significant: 'Statistically significant at the selected α; still check randomization, duration, and repeated peeking.', notSignificant: 'The evidence is not statistically significant; this does not prove the groups are identical.',
    usageTitle: 'How to use', step1: 'Enter independent trial and successful-conversion counts for groups A and B.', step2: 'Choose the predeclared hypothesis and review conversion rates, difference, z, and p.', step3: 'Export the analysis with the experiment period and assignment conditions; it is not a causal guarantee.',
  },
  ja: {
    name: 'A/B転換分析', description: '独立した二群の成功数と試行数で大標本の比率検定をします。', disclaimer: '小標本を有意と強断定しません。逐次検定や因果保証ではありません。',
    trials: '試行数', conversions: 'コンバージョン数', groupA: 'A群（対照）', groupB: 'B群（変更）', direction: '対立仮説', twoSided: '両側：AとBが異なる', greater: '片側：AがBより高い', less: '片側：AがBより低い', rateA: 'A転換率', rateB: 'B転換率', difference: 'A − B の差', notApplicable: '標本数または期待度数が不足し、正規近似を使えません。有意性を判断しないでください。', significant: '選択したαで統計的に有意ですが、無作為割付、期間、反復確認も確認してください。', notSignificant: '統計的に有意ではありません。両群が同じである証明ではありません。',
    usageTitle: '使い方', step1: '独立したA群とB群の試行数とコンバージョン数を入力します。', step2: '事前に決めた仮説を選び、転換率、差、z、pを確認します。', step3: '期間と割付条件を記録して結果を保存します。因果の保証ではありません。',
  },
  ko: {
    name: 'A/B 전환 분석', description: '독립된 두 집단의 성공 수와 시행 수로 큰 표본 비율 검정을 합니다.', disclaimer: '작은 표본을 유의하다고 강제하지 않습니다. 순차 검정이나 인과 보장이 아닙니다.',
    trials: '시행 수', conversions: '성공 전환 수', groupA: 'A 그룹(대조)', groupB: 'B 그룹(실험)', direction: '대립가설', twoSided: '양측: A와 B가 다름', greater: '단측: A가 B보다 높음', less: '단측: A가 B보다 낮음', rateA: 'A 전환율', rateB: 'B 전환율', difference: 'A − B 차이', notApplicable: '표본 또는 기대 빈도가 부족해 정규 근사를 사용할 수 없습니다. 유의성을 판단하지 마세요.', significant: '선택한 α에서 통계적으로 유의하지만 무작위 배정, 기간, 반복 확인도 점검하세요.', notSignificant: '통계적으로 유의하지 않으며 두 그룹이 같다는 증거는 아닙니다.',
    usageTitle: '사용 방법', step1: '독립된 A와 B의 시행 수와 전환 수를 입력합니다.', step2: '사전에 정한 가설을 고르고 전환율, 차이, z, p를 확인합니다.', step3: '기간과 배정 조건을 기록하고 결과를 저장합니다. 인과 보장은 아닙니다.',
  },
  de: {
    name: 'A/B-Auswertung', description: 'Testet zwei unabhängige Anteile mit einer Normalapproximation.', disclaimer: 'Kleine Stichproben gelten nicht als signifikant; kein sequentieller oder kausaler Test.',
    trials: 'Versuche', conversions: 'Erfolgreiche Conversions', groupA: 'Gruppe A (Kontrolle)', groupB: 'Gruppe B (Variante)', direction: 'Alternativhypothese', twoSided: 'Zweiseitig: A unterscheidet sich von B', greater: 'Einseitig: A ist höher als B', less: 'Einseitig: A ist niedriger als B', rateA: 'Conversion-Rate A', rateB: 'Conversion-Rate B', difference: 'Differenz A − B', notApplicable: 'Stichprobe oder erwartete Häufigkeiten reichen nicht für die Normalapproximation. Keine Signifikanz ableiten.', significant: 'Bei gewähltem α statistisch signifikant; Randomisierung, Dauer und wiederholtes Prüfen dennoch kontrollieren.', notSignificant: 'Nicht statistisch signifikant; das beweist keine Gleichheit der Gruppen.',
    usageTitle: 'So geht es', step1: 'Geben Sie Versuche und Conversions für die unabhängigen Gruppen A und B ein.', step2: 'Wählen Sie die vorab festgelegte Hypothese und prüfen Sie Raten, Differenz, z und p.', step3: 'Exportieren Sie das Ergebnis mit Zeitraum und Zuordnung; es ist keine Kausalitätsgarantie.',
  },
  fr: {
    name: 'Analyse A/B', description: 'Compare deux proportions indépendantes avec une approximation normale.', disclaimer: 'Les petits échantillons ne sont pas déclarés significatifs ; ni test séquentiel ni preuve causale.',
    trials: 'Essais', conversions: 'Conversions réussies', groupA: 'Groupe A (témoin)', groupB: 'Groupe B (variante)', direction: 'Hypothèse alternative', twoSided: 'Bilatéral : A diffère de B', greater: 'Unilatéral : A est supérieur à B', less: 'Unilatéral : A est inférieur à B', rateA: 'Taux de conversion A', rateB: 'Taux de conversion B', difference: 'Différence A − B', notApplicable: 'Effectifs insuffisants pour l’approximation normale. Ne déduisez aucune significativité.', significant: 'Significatif au seuil α choisi ; vérifiez encore randomisation, durée et consultations répétées.', notSignificant: 'Non significatif ; cela ne prouve pas que les groupes sont identiques.',
    usageTitle: 'Mode d’emploi', step1: 'Saisissez les essais et conversions des groupes indépendants A et B.', step2: 'Choisissez l’hypothèse prévue et examinez taux, différence, z et p.', step3: 'Exportez le résultat avec la période et l’affectation ; ce n’est pas une garantie causale.',
  },
  es: {
    name: 'Análisis A/B', description: 'Compara dos proporciones independientes con aproximación normal.', disclaimer: 'Las muestras pequeñas no se declaran significativas; no es secuencial ni prueba causal.',
    trials: 'Pruebas', conversions: 'Conversiones correctas', groupA: 'Grupo A (control)', groupB: 'Grupo B (variante)', direction: 'Hipótesis alternativa', twoSided: 'Bilateral: A difiere de B', greater: 'Unilateral: A es mayor que B', less: 'Unilateral: A es menor que B', rateA: 'Conversión A', rateB: 'Conversión B', difference: 'Diferencia A − B', notApplicable: 'Muestra o frecuencias insuficientes para la aproximación normal. No inferir significación.', significant: 'Significativo con el α elegido; revise también aleatorización, duración y consultas repetidas.', notSignificant: 'No es estadísticamente significativo; no demuestra que los grupos sean iguales.',
    usageTitle: 'Cómo usarlo', step1: 'Introduce pruebas y conversiones de los grupos independientes A y B.', step2: 'Elige la hipótesis prevista y revisa tasas, diferencia, z y p.', step3: 'Exporta el resultado con el periodo y la asignación; no garantiza causalidad.',
  },
  'pt-BR': {
    name: 'Análise A/B', description: 'Compara duas proporções independentes com aproximação normal.', disclaimer: 'Amostras pequenas não são chamadas de significativas; não é sequencial nem prova causal.',
    trials: 'Tentativas', conversions: 'Conversões bem-sucedidas', groupA: 'Grupo A (controle)', groupB: 'Grupo B (variante)', direction: 'Hipótese alternativa', twoSided: 'Bilateral: A difere de B', greater: 'Unilateral: A é maior que B', less: 'Unilateral: A é menor que B', rateA: 'Conversão A', rateB: 'Conversão B', difference: 'Diferença A − B', notApplicable: 'Amostra ou frequências insuficientes para a aproximação normal. Não infira significância.', significant: 'Significativo no α escolhido; verifique randomização, duração e consultas repetidas.', notSignificant: 'Não é estatisticamente significativo; isso não prova que os grupos são iguais.',
    usageTitle: 'Como usar', step1: 'Informe tentativas e conversões dos grupos independentes A e B.', step2: 'Escolha a hipótese prevista e revise taxas, diferença, z e p.', step3: 'Exporte o resultado com período e alocação; não é garantia causal.',
  },
}
