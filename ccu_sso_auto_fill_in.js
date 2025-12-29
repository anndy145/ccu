// ==UserScript==
// @name         中正大學單一入口與成績查詢自動化
// @namespace    1
// @version      1.3
// @description  支援單一入口、CAS 與 KIKI 成績查詢頁面
// @author       Andy
// @match        https://cas.ccu.edu.tw/login*
// @match        https://portal.ccu.edu.tw/*
// @match        https://kiki.ccu.edu.tw/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ========== 使用者設定區 ==========
    const CONFIG = {
        username: "您的學號",
        password: "您的密碼",
        AUTO_LOGIN: true,         // 是否自動點擊登入
        START_DELAY: 500,         // 進入頁面後多久開始填寫
        SUBMIT_DELAY: 1000,       // 填寫完成後多久點擊登入
        POLLING_INTERVAL: 1000    // 檢查欄位頻率
    };

    // 1. 處理 Portal 入口頁面
    if (window.location.hostname === 'portal.ccu.edu.tw') {
        const loginBtn = document.querySelector('.signin-btn a');
        if (loginBtn) {
            loginBtn.click();
        }
        return;
    }

    // 強制填寫函數
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
            let userField, passField, submitBtn;

            // --- 判斷頁面類型並抓取欄位 ---
            if (window.location.href.includes('kiki.ccu.edu.tw')) {
                // 成績查詢頁面使用 name 屬性
                userField = document.querySelector('input[name="id"]');
                passField = document.querySelector('input[name="password"]');
                submitBtn = document.querySelector('input[type="submit"]');
            } else {
                // 一般 CAS 登入頁面使用 id 屬性
                userField = document.getElementById('username');
                passField = document.getElementById('password');
                submitBtn = document.querySelector('button[name="submitBtn"]');
            }

            // --- 執行填寫 ---
            if (userField && passField) {
                const userDone = forceFill(userField, CONFIG.username);
                const passDone = forceFill(passField, CONFIG.password);

                if (userDone && passDone) {
                    clearInterval(timer);
                    console.log("帳密填寫完成");

                    if (CONFIG.AUTO_LOGIN && submitBtn) {
                        setTimeout(() => {
                            submitBtn.click();
                        }, CONFIG.SUBMIT_DELAY);
                    }
                }
            }

            if (attempts >= maxAttempts) clearInterval(timer);
            attempts++;
        }, CONFIG.POLLING_INTERVAL);
    }

    setTimeout(startProcess, CONFIG.START_DELAY);
})();