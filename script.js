// グローバル変数
let currentNum1 = 0;
let currentNum2 = 0;
let currentOperator = '+';
let correctCount = 0;
let totalCount = 0;
let maxProblems = 10; // 問題数の設定用
let timerInterval = null; // タイマー用
let timeLeft = 0; // 残り時間
let startTime = 0; // 開始時間を記録する変数
let wrongProblems = []; // 間違えた問題を保存する配列
let currentAnswer = ''; // 現在の入力値
let problemResults = []; // 各問題の結果
let userSettings = {
    difficulty: 'easy',
    operators: ['+'],
    problemCount: 10,
    maxNumber: 10
};

// 画面要素
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

// DOM要素
const problemCardElement = document.querySelector('.problem-card');
const answerAreaElement = document.querySelector('.answer-area');
const settingsAreaElement = document.querySelector('.settings-area');
const resultAreaElement = document.querySelector('.result-area');
const reviewAreaElement = document.querySelector('.review-area');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const operatorElement = document.getElementById('operator');
const messageBoxElement = document.getElementById('message-box');
const answerPlaceholder = document.querySelector('.answer-placeholder');
const numberKeys = document.querySelectorAll('.number-key');
const checkButton = document.getElementById('check-btn');
const correctCountElement = document.getElementById('correct-count');
const totalCountElement = document.getElementById('total-count');
const accuracyElement = document.getElementById('accuracy');
const startButton = document.getElementById('start-btn');
const retryButton = document.getElementById('retry-btn');
const currentProblemElement = document.getElementById('current-problem');
const totalProblemsElement = document.getElementById('total-problems');
const pointsElement = document.getElementById('points');
const reviewProblemsElement = document.getElementById('review-problems');
const reviewButton = document.getElementById('review-btn');
const resultChartElement = document.getElementById('result-chart');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

// 難易度タブ
const easyTabElement = document.getElementById('easy-tab');
const normalTabElement = document.getElementById('normal-tab');
const hardTabElement = document.getElementById('hard-tab');

// 難易度ボタン
const easyBtnElement = document.getElementById('easy-btn');
const normalBtnElement = document.getElementById('normal-btn');
const hardBtnElement = document.getElementById('hard-btn');

// 演算子ボタン
const opButtons = document.querySelectorAll('.op-btn');

// 問題数ボタン
const optionButtons = document.querySelectorAll('.option-btn');

// 画面読み込み関数
async function loadScreen(screenName) {
    const mainContent = document.getElementById('main-content');
    
    try {
        const response = await fetch(`${screenName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${screenName}.html`);
        }
        
        const htmlContent = await response.text();
        mainContent.innerHTML = htmlContent;
        
        // 画面に応じたイベントリスナーを設定
        setupEventListeners(screenName);
        
        // 画面特有の初期化処理
        if (screenName === 'game') {
            initGameScreen();
        } else if (screenName === 'result') {
            updateResultScreen();
        }
    } catch (error) {
        console.error('画面読み込みエラー:', error);
        mainContent.innerHTML = `<div class="error">画面の読み込みに失敗しました。</div>`;
    }
}

// 画面ごとのイベントリスナー設定
function setupEventListeners(screenName) {
    if (screenName === 'start') {
        // 難易度ボタン
        const easyBtn = document.getElementById('easy-btn');
        const normalBtn = document.getElementById('normal-btn');
        const hardBtn = document.getElementById('hard-btn');
        
        if (easyBtn) easyBtn.addEventListener('click', () => setDifficulty('easy'));
        if (normalBtn) normalBtn.addEventListener('click', () => setDifficulty('normal'));
        if (hardBtn) hardBtn.addEventListener('click', () => setDifficulty('hard'));
        
        // 演算子ボタン
        const opButtons = document.querySelectorAll('.op-btn');
        opButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const op = btn.getAttribute('data-op');
                toggleOperator(btn, op);
            });
        });
        
        // 問題数ボタン
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.getAttribute('data-value');
                if (value) setProblemCount(btn, parseInt(value));
            });
        });
        
        // スタートボタン
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', startGame);
        
    } else if (screenName === 'game') {
        // 数字キーパッドのイベントリスナー
        const numberKeys = document.querySelectorAll('.number-key');
        numberKeys.forEach(key => {
            key.addEventListener('click', () => {
                const value = key.getAttribute('data-value');
                addNumberToAnswer(value);
            });
        });
        
        // 答え合わせボタン
        const checkBtn = document.getElementById('check-btn');
        if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
        
    } else if (screenName === 'result') {
        // リトライボタン
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => loadScreen('start'));
        
        // 復習ボタン
        const reviewBtn = document.getElementById('review-btn');
        if (reviewBtn) reviewBtn.addEventListener('click', reviewWrongProblems);
    }
}

// ゲーム画面の初期化
function initGameScreen() {
    // 問題数の表示更新
    const totalProblemsElement = document.getElementById('total-problems');
    if (totalProblemsElement) totalProblemsElement.textContent = maxProblems;
    
    // 問題生成
    generateProblem();
}

// 結果画面の更新
function updateResultScreen() {
    // 終了時間を計算
    const endTime = Date.now();
    const totalTimeInSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(totalTimeInSeconds / 60);
    const seconds = totalTimeInSeconds % 60;
    
    // 結果表示の更新
    const correctCountElement = document.getElementById('correct-count');
    const totalCountElement = document.getElementById('total-count');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (correctCountElement) correctCountElement.textContent = correctCount;
    if (totalCountElement) totalCountElement.textContent = totalCount;
    if (minutesElement) minutesElement.textContent = minutes;
    if (secondsElement) secondsElement.textContent = seconds;
    
    // 結果メッセージの更新
    const resultMessageElement = document.querySelector('.result-message');
    if (resultMessageElement) {
        if (correctCount === totalCount) {
            resultMessageElement.textContent = 'パーフェクト！すごいね！';
        } else if (correctCount / totalCount >= 0.8) {
            resultMessageElement.textContent = 'とてもじょうずにできたね！';
        } else if (correctCount / totalCount >= 0.6) {
            resultMessageElement.textContent = 'よくがんばったね！';
        } else {
            resultMessageElement.textContent = 'つぎはもっとがんばろう！';
        }
    }
    
    // 間違えた問題があれば表示
    if (wrongProblems.length > 0) {
        showWrongProblems();
    }
}

// ゲーム開始
function startGame() {
    // 演算子が選択されているか確認
    if (userSettings.operators.length === 0) {
        alert('けいさんのしゅるいを えらんでください');
        return;
    }
    
    // カウンターをリセット
    correctCount = 0;
    totalCount = 0;
    problemResults = [];
    wrongProblems = [];
    
    // 最大問題数の設定
    maxProblems = userSettings.problemCount;
    
    // 開始時間を記録
    startTime = Date.now();
    
    // ゲーム画面に切り替え
    loadScreen('game');
}

// 問題生成関数
function generateProblem() {
    // 問題数に達したらゲーム終了
    if (totalCount >= maxProblems) {
        endGame();
        return;
    }
    
    // DOM要素を再取得（非同期ロードの後なので必要）
    const num1Element = document.getElementById('num1');
    const num2Element = document.getElementById('num2');
    const operatorElement = document.getElementById('operator');
    const currentProblemElement = document.getElementById('current-problem');
    const pointsElement = document.getElementById('points');
    const answerPlaceholder = document.querySelector('.answer-placeholder');
    const messageBoxElement = document.getElementById('message-box');
    
    if (!num1Element || !num2Element || !operatorElement || 
        !currentProblemElement || !pointsElement || 
        !answerPlaceholder || !messageBoxElement) {
        console.error('必要なDOM要素が見つかりません');
        return;
    }
    
    // 問題番号を更新
    currentProblemElement.textContent = totalCount + 1;
    
    const maxNumber = userSettings.maxNumber;
    
    // 現在の入力をリセット
    currentAnswer = '';
    answerPlaceholder.textContent = '?';
    
    // メッセージを更新
    messageBoxElement.textContent = 'こたえをいれてね';
    messageBoxElement.className = 'message-box';
    
    // 演算子の選択
    currentOperator = userSettings.operators[Math.floor(Math.random() * userSettings.operators.length)];
    operatorElement.textContent = currentOperator;
    
    if (currentOperator === '+') {
        // たしざんの場合
        currentNum1 = Math.floor(Math.random() * maxNumber) + 1;
        currentNum2 = Math.floor(Math.random() * maxNumber) + 1;
    } else if (currentOperator === '-') {
        // ひきざんの場合（答えが負にならないように）
        currentNum1 = Math.floor(Math.random() * maxNumber) + 1;
        currentNum2 = Math.floor(Math.random() * currentNum1) + 1;
    } else if (currentOperator === '×') {
        // かけざんの場合
        currentNum1 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
        currentNum2 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
    }
    
    num1Element.textContent = currentNum1;
    num2Element.textContent = currentNum2;
    
    // 残りポイント表示
    pointsElement.textContent = `${(maxProblems - totalCount) * 10}ぴょう`;
}

// 答え合わせ関数
function checkAnswer() {
    const answerPlaceholder = document.querySelector('.answer-placeholder');
    const messageBoxElement = document.getElementById('message-box');
    
    if (!answerPlaceholder || !messageBoxElement) {
        console.error('必要なDOM要素が見つかりません');
        return;
    }
    
    if (currentAnswer === '') {
        messageBoxElement.textContent = 'こたえを にゅうりょくしてね';
        messageBoxElement.className = 'message-box incorrect';
        return;
    }
    
    const userAnswer = parseInt(currentAnswer);
    let correctAnswer;
    
    if (currentOperator === '+') {
        correctAnswer = currentNum1 + currentNum2;
    } else if (currentOperator === '-') {
        correctAnswer = currentNum1 - currentNum2;
    } else if (currentOperator === '×') {
        correctAnswer = currentNum1 * currentNum2;
    }
    
    const isCorrect = userAnswer === correctAnswer;
    
    // 問題の結果を記録
    problemResults.push({
        num1: currentNum1,
        num2: currentNum2,
        operator: currentOperator,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    });
    
    // 正誤表示
    if (isCorrect) {
        messageBoxElement.textContent = 'せいかい！';
        messageBoxElement.className = 'message-box correct';
        answerPlaceholder.classList.add('pop');
        correctCount++;
    } else {
        messageBoxElement.textContent = `ざんねん。こたえは ${correctAnswer}`;
        messageBoxElement.className = 'message-box incorrect';
        // 間違えた問題を記録
        wrongProblems.push({
            num1: currentNum1,
            num2: currentNum2,
            operator: currentOperator,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer
        });
    }
    
    totalCount++;
    
    // アニメーション終了時にクラスを削除
    setTimeout(() => {
        answerPlaceholder.classList.remove('pop');
    }, 300);
    
    // 次の問題生成またはゲーム終了
    setTimeout(() => {
        if (totalCount < maxProblems) {
            generateProblem();
        } else {
            endGame();
        }
    }, 1500);
}

// ゲーム終了関数
function endGame() {
    // 終了時間を取得して経過時間を計算
    const endTime = Date.now();
    const totalTimeInSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(totalTimeInSeconds / 60);
    const seconds = totalTimeInSeconds % 60;
    
    // 結果表示
    correctCountElement.textContent = correctCount;
    totalCountElement.textContent = totalCount;
    
    // 時間表示
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds;
    
    // 正解率の計算と表示（もし表示していれば）
    if (accuracyElement) {
        accuracyElement.textContent = Math.round((correctCount / totalCount) * 100);
    }
    
    // グラフ表示
    createResultChart();
    
    // 結果メッセージ
    const resultMessageElement = document.querySelector('.result-message');
    if (correctCount === totalCount) {
        resultMessageElement.textContent = 'パーフェクト！すごいね！';
    } else if (correctCount / totalCount >= 0.8) {
        resultMessageElement.textContent = 'とてもじょうずにできたね！';
    } else if (correctCount / totalCount >= 0.6) {
        resultMessageElement.textContent = 'よくがんばったね！';
    } else {
        resultMessageElement.textContent = 'つぎはもっとがんばろう！';
    }
    
    // 表示切替
    answerAreaElement.style.display = 'none';
    resultAreaElement.style.display = 'block';
    
    // 間違えた問題があれば復習エリアを表示
    if (wrongProblems.length > 0) {
        showWrongProblems();
    }
    
    console.log(`ゲーム終了: ${minutes}分${seconds}秒かかりました。${correctCount}/${totalCount}問正解。`);
}

// 結果チャートの作成
function createResultChart() {
    resultChartElement.innerHTML = '';
    
    problemResults.forEach((result, index) => {
        const bar = document.createElement('div');
        bar.className = result.isCorrect ? 'chart-bar' : 'chart-bar incorrect';
        
        // 高さを設定（最大100%）
        const height = result.isCorrect ? '100%' : '50%';
        bar.style.height = height;
        
        resultChartElement.appendChild(bar);
    });
}

// 間違えた問題を表示
function showWrongProblems() {
    const reviewArea = document.getElementById('review-area');
    reviewProblemsElement.innerHTML = '';
    
    wrongProblems.forEach((problem, index) => {
        const problemElement = document.createElement('div');
        problemElement.className = 'review-problem';
        problemElement.innerHTML = `
            ${problem.num1} ${problem.operator} ${problem.num2} = <span class="correct">${problem.correctAnswer}</span>
            (あなた: <span class="incorrect">${problem.userAnswer}</span>)
        `;
        reviewProblemsElement.appendChild(problemElement);
    });
    
    reviewArea.style.display = 'block';
}

// 間違えた問題を復習
function reviewWrongProblems() {
    // 間違えた問題だけでゲームを再開
    maxProblems = wrongProblems.length;
    const tempWrongProblems = [...wrongProblems];
    
    // 復習エリアを非表示
    reviewAreaElement.style.display = 'none';
    resultAreaElement.style.display = 'none';
    
    // ゲーム再開
    startGame();
    
    // 通常の問題生成をスキップして間違えた問題を使う
    const originalGenerateProblem = generateProblem;
    generateProblem = function() {
        if (totalCount >= maxProblems || tempWrongProblems.length === 0) {
            // 元の問題生成関数に戻す
            generateProblem = originalGenerateProblem;
            endGame();
            return;
        }
        
        const problem = tempWrongProblems.shift();
        currentNum1 = problem.num1;
        currentNum2 = problem.num2;
        currentOperator = problem.operator;
        
        num1Element.textContent = currentNum1;
        num2Element.textContent = currentNum2;
        operatorElement.textContent = currentOperator;
        
        // 現在の入力をリセット
        currentAnswer = '';
        answerPlaceholder.textContent = '?';
        
        // メッセージを更新
        messageBoxElement.textContent = 'こたえをいれてね';
        messageBoxElement.className = 'message-box';
        
        // 問題番号を更新
        currentProblemElement.textContent = totalCount + 1;
        
        // 残りポイント表示
        pointsElement.textContent = `${(maxProblems - totalCount) * 10}ぴょう`;
    };
    
    // 最初の問題を表示
    generateProblem();
}

// キーボード入力のサポート（グローバルに設定）
document.addEventListener('keydown', (e) => {
    // gameScreenがDOM上に存在するか確認
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        // 数字キー (0-9)
        if (e.key >= '0' && e.key <= '9') {
            addNumberToAnswer(e.key);
        }
        // Enter キー
        else if (e.key === 'Enter') {
            const checkBtn = document.getElementById('check-btn');
            if (checkBtn) checkBtn.click();
        }
        // Backspace キー
        else if (e.key === 'Backspace') {
            if (currentAnswer.length > 0) {
                currentAnswer = currentAnswer.slice(0, -1);
                const answerPlaceholder = document.querySelector('.answer-placeholder');
                if (answerPlaceholder) {
                    answerPlaceholder.textContent = currentAnswer.length > 0 ? currentAnswer : '?';
                }
            }
        }
    }
});

// 難易度タブの切り替え
function switchTab(difficulty) {
    // タブの状態更新
    [easyTabElement, normalTabElement, hardTabElement].forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (difficulty === 'easy') {
        easyTabElement.classList.add('active');
    } else if (difficulty === 'normal') {
        normalTabElement.classList.add('active');
    } else {
        hardTabElement.classList.add('active');
    }
    
    setDifficulty(difficulty);
}

// 難易度設定
function setDifficulty(difficulty) {
    userSettings.difficulty = difficulty;
    
    // ボタンの状態更新
    [easyBtnElement, normalBtnElement, hardBtnElement].forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (difficulty === 'easy') {
        easyBtnElement.classList.add('active');
        userSettings.maxNumber = 10;
    } else if (difficulty === 'normal') {
        normalBtnElement.classList.add('active');
        userSettings.maxNumber = 20;
    } else {
        hardBtnElement.classList.add('active');
        userSettings.maxNumber = 30;
    }
}

// 演算子設定
function toggleOperator(button, operator) {
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        // 演算子を追加
        if (!userSettings.operators.includes(operator)) {
            userSettings.operators.push(operator);
        }
    } else {
        // 演算子を削除（ただし少なくとも1つは必要）
        if (userSettings.operators.length > 1) {
            userSettings.operators = userSettings.operators.filter(op => op !== operator);
        } else {
            // 最後の1つは削除できないようにする
            button.classList.add('active');
        }
    }
}

// 問題数設定
function setProblemCount(button, count) {
    userSettings.problemCount = count;
    maxProblems = count;
    
    // ボタンの状態更新
    optionButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

// 数字をキーパッドから入力
function addNumberToAnswer(number) {
    // 2桁以上にならないようにする
    if (currentAnswer.length < 2) {
        currentAnswer += number;
        answerPlaceholder.textContent = currentAnswer;
        answerPlaceholder.classList.add('pop');
        setTimeout(() => {
            answerPlaceholder.classList.remove('pop');
        }, 300);
    }
}

// メイン初期化
document.addEventListener('DOMContentLoaded', () => {
    // 最初に開始画面を読み込む
    loadScreen('start');
}); 