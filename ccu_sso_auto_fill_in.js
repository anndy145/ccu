// ==UserScript==
// @name         中正大學單一入口自動化 (防無限重試版)
// @version      1.3
// @description  可自訂延遲時間並限制重試次數
// @author       Andy
// @match         https://cas.ccu.edu.tw/login*
// @match         https://portal.ccu.edu.tw/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 使用者設定區 ==========
    const CONFIG = {
        username: "你的帳號",
        password: "你的密碼",
        AUTO_LOGIN: true,         // 是否自動點擊登入

        // --- 延遲與次數設定 ---
        START_DELAY: 500,         // 進入頁面後多久開始填寫 (ms)
        SUBMIT_DELAY: 1500,       // 填寫完成後，過多久點擊登入 (ms)
        POLLING_INTERVAL: 1000,   // 檢查欄位的頻率 (ms)
        MAX_ATTEMPTS: 10          // 最大嘗試次數 (若欄位未出現或填寫失敗，超過此數則放棄)
    };
    // =================================

    // 1. 處理入口頁面 (自動點擊「登入」進入 CAS)
    if (window.location.hostname === 'portal.ccu.edu.tw') {
        const loginBtn = document.querySelector('.signin-btn a');
        if (loginBtn) {
            console.log("[自動化] 偵測到入口按鈕，跳轉中...");
            loginBtn.click();
        }
        return;
    }

    // 2. 模擬真實輸入行為
    function forceFill(element, value) {
        if (!element) return false;
        element.value = value;
        ['input', 'change', 'blur', 'focus'].forEach(evtName => {
            element.dispatchEvent(new Event(evtName, { bubbles: true }));
        });
        return element.value === value;
    }

    function startProcess() {
        let attempts = 0;

        const timer = setInterval(() => {
            attempts++;
            const userField = document.getElementById('username');
            const passField = document.getElementById('password');

            // 判斷欄位是否都出現了
            if (userField && passField) {
                const userDone = forceFill(userField, CONFIG.username);
                const passDone = forceFill(passField, CONFIG.password);

                if (userDone && passDone) {
                    clearInterval(timer);
                    console.log("[自動化] 帳密填寫成功！");

                    if (CONFIG.AUTO_LOGIN) {
                        const submitBtn = document.querySelector('button[name="submitBtn"]');
                        if (submitBtn) {
                            console.log(`[自動化] ${CONFIG.SUBMIT_DELAY}ms 後將自動提交...`);
                            setTimeout(() => {
                                submitBtn.click();
                            }, CONFIG.SUBMIT_DELAY);
                        }
                    }
                }
            } else {
                console.log(`[自動化] 等待欄位中... 第 ${attempts}/${CONFIG.MAX_ATTEMPTS} 次嘗試`);
            }

            // 超過最大次數，停止檢查以免無限 loop 消耗效能
            if (attempts >= CONFIG.MAX_ATTEMPTS) {
                clearInterval(timer);
                console.warn(`[自動化] 已達最大重試次數 (${CONFIG.MAX_ATTEMPTS})，停止自動執行。`);
            }
        }, CONFIG.POLLING_INTERVAL);
    }

    // 啟動腳本
    setTimeout(startProcess, CONFIG.START_DELAY);

})();