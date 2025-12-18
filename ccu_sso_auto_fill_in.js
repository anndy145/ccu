// ==UserScript==
// @name         中正大學單一入口自動化 (自訂延遲版)
// @namespace    1
// @version      1.2
// @description  可自訂延遲時間的自動化腳本
// @author       Andy
// @match        https://cas.ccu.edu.tw/login*
// @match        https://portal.ccu.edu.tw/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 使用者設定區 ==========
    const CONFIG = {
        username: "你的帳號",
        password: "你的密碼",
        AUTO_LOGIN: true,        // 是否自動點擊登入

        // --- 延遲時間設定 (單位: 毫秒, 1000ms = 1秒) ---
        START_DELAY: 500,        // 進入頁面後多久開始填寫 
        SUBMIT_DELAY: 2000,      // 填寫完成後，過多久點擊登入
        POLLING_INTERVAL: 1000    // 如果欄位還沒出現，每隔多久重新檢查一次
    };
    // =================================

    // 1. 處理入口頁面
    if (window.location.hostname === 'portal.ccu.edu.tw') {
        const loginBtn = document.querySelector('.signin-btn a');
        if (loginBtn) {
            console.log("偵測到入口按鈕，跳轉中...");
            loginBtn.click();
        }
        return;
    }

    // 2. 處理 CAS 登入頁面
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
        const maxAttempts = 10;

        const timer = setInterval(() => {
            const userField = document.getElementById('username');
            const passField = document.getElementById('password');

            if (userField && passField) {
                const userDone = forceFill(userField, CONFIG.username);
                const passDone = forceFill(passField, CONFIG.password);

                if (userDone && passDone) {
                    clearInterval(timer);
                    console.log("帳密填寫完成");

                    if (CONFIG.AUTO_LOGIN) {
                        const submitBtn = document.querySelector('button[name="submitBtn"]');
                        if (submitBtn) {
                            console.log(`${CONFIG.SUBMIT_DELAY}ms 後自動登入...`);
                            setTimeout(() => {
                                submitBtn.click();
                            }, CONFIG.SUBMIT_DELAY);
                        }
                    }
                }
            }

            if (attempts >= maxAttempts) clearInterval(timer);
            attempts++;
        }, CONFIG.POLLING_INTERVAL);
    }

    // 依照設定的初始延遲啟動
    setTimeout(startProcess, CONFIG.START_DELAY);

})();