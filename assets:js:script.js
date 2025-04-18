// Google スプレッドシートと連携して資産情報を表示するためのスクリプト

// 設定部分
const SPREADSHEET_ID = '10RZ-YUnj8-ExAFQM3KFhORq7UlGy94Kzhfn_reQ_7jQ'; // あなたのスプレッドシートIDに置き換えてください
const SHEET_INDEX = 1; // シート番号（通常は1から始まる）

/**
 * ページ読み込み時に実行される初期化関数
 */
async function initializeAssetData() {
    try {
        // スプレッドシートからデータを取得
        const assetData = await fetchSpreadsheetData();
        console.log('取得したデータ:', assetData);
        
        // 資産情報の表示を更新
        updateAssetDisplay(assetData);
    } catch (error) {
        console.error('資産データの初期化に失敗しました:', error);
    }
}

/**
 * Googleスプレッドシートからデータを取得する関数
 */
async function fetchSpreadsheetData() {
    try {
        // 公開されたスプレッドシートのJSON形式のデータを取得するURL
        const url = `https://spreadsheets.google.com/feeds/cells/${SPREADSHEET_ID}/${SHEET_INDEX}/public/values?alt=json`;
        
        console.log('スプレッドシートからデータを取得中...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 必要なデータを解析して抽出
        return parseSpreadsheetData(data);
    } catch (error) {
        console.error('スプレッドシートからのデータ取得に失敗しました:', error);
        
        // エラー時はダミーデータを返す
        return {
            assetAmount: 1250000,
            lastUpdate: "2025年4月17日"
        };
    }
}

/**
 * スプレッドシートのデータを解析する関数
 */
function parseSpreadsheetData(data) {
    // スプレッドシートのセルデータを取得
    const entries = data.feed.entry || [];
    const cells = {};
    
    // すべてのセルのデータをマッピング
    entries.forEach(entry => {
        const cell = entry.gs$cell;
        const row = parseInt(cell.row);
        const col = parseInt(cell.col);
        if (!cells[row]) cells[row] = {};
        cells[row][col] = cell.$t;
    });
    
    // スプレッドシートの構造に基づいてデータを抽出
    // 例: A2セルに総資産額、B2セルに最終更新日
    const assetAmount = parseFloat((cells[2] && cells[2][1]) || '0');
    const lastUpdate = (cells[2] && cells[2][2]) || '不明';
    
    return {
        assetAmount,
        lastUpdate
    };
}

/**
 * 資産表示を更新する関数
 */
function updateAssetDisplay(data) {
    // 資産総額のカウントアップアニメーション
    const assetCounter = document.getElementById('assetCounter');
    if (assetCounter) {
        const options = {
            decimalPlaces: 0,
            duration: 2.5,
            separator: ',',
            suffix: ' 円'
        };
        
        const countUp = new CountUp(assetCounter, data.assetAmount, options);
        if (!countUp.error) {
            countUp.start();
        } else {
            console.error(countUp.error);
            assetCounter.textContent = data.assetAmount.toLocaleString() + ' 円';
        }
    }
    
    // 最終更新日の表示
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = data.lastUpdate;
    }
}

// ページロード時に実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('資産データの初期化を開始します...');
    initializeAssetData();
});

// 元のfetchAssetData関数を上書き
window.fetchAssetData = fetchSpreadsheetData;