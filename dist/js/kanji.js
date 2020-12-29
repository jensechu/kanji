var kanji = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var WaniKani;
    (function (WaniKani) {
        function getKanji(apiKey) {
            return __awaiter(this, void 0, void 0, function* () {
                const level = yield getLevel(apiKey);
                const accumulatedKanji = {};
                let userLevels = '';
                for (let currentLevel = level; currentLevel > 1; --currentLevel) {
                    accumulatedKanji[`Level ${currentLevel}`] = {};
                    userLevels += `${currentLevel},`;
                }
                accumulatedKanji['Level 1'] = {};
                userLevels += '1';
                let nextUrl = `https://api.wanikani.com/v2/subjects?levels=${userLevels}&types=kanji`;
                while (nextUrl) {
                    const response = yield waniKaniRequest(apiKey, nextUrl);
                    for (const kanji of response.data) {
                        const kanjiInfo = kanji.data;
                        accumulatedKanji[`Level ${kanjiInfo.level}`][kanjiInfo.characters] = {
                            meanings: kanjiInfo.meanings
                                // ensure primary meanings come first
                                .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
                                .map(meaning => meaning.meaning),
                            onyomiReadings: kanjiInfo.readings
                                .filter(reading => reading.type == 'onyomi')
                                // ensure primary readings come first
                                .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
                                .map(reading => reading.reading),
                            kunyomiReadings: kanjiInfo.readings
                                .filter(reading => reading.type == 'kunyomi')
                                .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
                                .map(reading => reading.reading),
                        };
                    }
                    nextUrl = response.pages.next_url;
                }
                return accumulatedKanji;
            });
        }
        WaniKani.getKanji = getKanji;
        function getLevel(apiKey) {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield waniKaniRequest(apiKey, 'https://api.wanikani.com/v2/user')).data.level;
            });
        }
        function waniKaniRequest(apiKey, url) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(url, {
                    headers: {
                        'Wanikani-Revision': '20170710',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                });
                const responseJson = yield response.json();
                if (response.status != 200)
                    throw new WaniKaniError(responseJson.error, responseJson.code);
                else
                    return responseJson;
            });
        }
        class WaniKaniError extends Error {
            constructor(message, code) {
                super(message);
                this.code = code;
            }
        }
        WaniKani.WaniKaniError = WaniKaniError;
    })(WaniKani || (WaniKani = {}));

    (function (Kanji) {
        const categories = {};
        // All kanji available, indexed by kanji ID.
        const availableKanji = {};
        // A counter that allows for the creation of unique IDs
        //for all of the kanji.
        let kanjiIdCounter = 0;
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                // Add events to static categories
                const staticCategories = document.getElementById('sidebar').querySelectorAll('.category');
                for (const category of staticCategories) {
                    const categoryTitle = category.querySelector('.category-title');
                    const categoryContent = category.querySelector('.category-content');
                    categoryTitle.addEventListener('click', function () {
                        if (categoryContent.classList.contains('expand'))
                            categoryContent.classList.remove('expand');
                        else
                            categoryContent.classList.add('expand');
                    });
                }
                const jlptData = yield (yield fetch('data/JLPT.json')).json();
                addKanjiCategory("JLPT", jlptData);
                // Accounts for the possibility that the inputs are
                // set to non-default after a page reload.
                setFont();
                toggleGuideLines();
            });
        }
        Kanji.init = init;
        function loadWaniKani() {
            const apiKey = document.getElementById('waniKaniKey').value;
            WaniKani.getKanji(apiKey)
                .then(kanji => addKanjiCategory('WaniKani', kanji), err => {
                let errorMessage;
                if (err instanceof WaniKani.WaniKaniError)
                    switch (err.code) {
                        case 401:
                            errorMessage = 'Error: Unauthorized (did you input your API key correctly?)';
                            break;
                        default:
                            errorMessage = `WaniKani API Error: ${err.message} (code ${err.code})`;
                            break;
                    }
                else
                    errorMessage = `Unexpected error: ${err.constructor.name}: ${err.message}`;
                alert(errorMessage);
            });
        }
        Kanji.loadWaniKani = loadWaniKani;
        function setFont() {
            const fontSelector = document.getElementById('fontSelector');
            for (const kanjiBox of document.querySelectorAll('.kanji-box'))
                kanjiBox.style.fontFamily = fontSelector.value;
        }
        Kanji.setFont = setFont;
        function toggleGuideLines() {
            const content = document.getElementById('content');
            if (document.getElementById('guideLinesToggle').checked) {
                content.classList.add('guide-lines');
            }
            else {
                content.classList.remove('guide-lines');
            }
        }
        Kanji.toggleGuideLines = toggleGuideLines;
        function toggleKanji(kanjiId) {
            if (kanjiSelected(kanjiId)) {
                deselectKanji(kanjiId);
            }
            else {
                selectKanji(kanjiId);
            }
        }
        function kanjiSelected(kanjiId) {
            return document.getElementById(`kanji/${kanjiId}`) != null;
        }
        function selectKanji(kanjiId) {
            const kanjiData = Object.assign({}, availableKanji[kanjiId]);
            kanjiData.kanjiId = kanjiId;
            document.getElementById('content').prepend(createKanjiRow(kanjiId));
            document.getElementById(`kanji-button/${kanjiId}`).classList.add('selected');
        }
        function deselectKanji(kanjiId) {
            var _a;
            (_a = document.getElementById(`kanji/${kanjiId}`)) === null || _a === void 0 ? void 0 : _a.remove();
            document.getElementById(`kanji-button/${kanjiId}`).classList.remove('selected');
        }
        function addKanjiCategory(categoryName, categoryData) {
            categories[categoryName] = {};
            const category = categories[categoryName];
            for (const subcategoryName in categoryData) {
                const subcategoryData = categoryData[subcategoryName];
                categories[categoryName][subcategoryName] = {
                    selectAllUndo: null,
                    kanji: [],
                };
                const subcategory = categories[categoryName][subcategoryName];
                for (const kanji in subcategoryData) {
                    const kanjiData = subcategoryData[kanji];
                    const kanjiId = kanjiIdCounter++;
                    availableKanji[kanjiId] = {
                        category: categoryName,
                        subcategory: subcategoryName,
                        character: kanji,
                        meanings: kanjiData.meanings,
                        onyomiReadings: kanjiData.onyomiReadings,
                        kunyomiReadings: kanjiData.kunyomiReadings,
                    };
                    subcategory.kanji.push(kanjiId);
                }
            }
            document.getElementById('sidebar').appendChild(crateKanjiSelectionCategory(categoryName, category));
        }
        function createKanjiRow(kanjiId) {
            const numHintKanjiBoxes = 6;
            const numEmptyKanjiBoxes = 16;
            const kanjiRow = document.createElement('div');
            const kanjiData = availableKanji[kanjiId];
            kanjiRow.classList.add('kanji-row');
            kanjiRow.id = `kanji/${kanjiId}`;
            const kanjiDescription = document.createElement('dl');
            kanjiDescription.classList.add('kanji-description');
            kanjiRow.appendChild(kanjiDescription);
            const kanjiTermMeaning = document.createElement('dt');
            kanjiTermMeaning.classList.add('kanji-term');
            kanjiTermMeaning.innerText = 'Meaning:';
            kanjiDescription.appendChild(kanjiTermMeaning);
            const kanjiDefinitionMeaning = document.createElement('dd');
            kanjiDefinitionMeaning.classList.add('kanji-definition');
            kanjiDefinitionMeaning.innerText = kanjiData.meanings.join(', ');
            kanjiDescription.appendChild(kanjiDefinitionMeaning);
            const kanjiTermOnyomi = document.createElement('dt');
            kanjiTermOnyomi.classList.add('kanji-term');
            kanjiTermOnyomi.innerText = 'On Reading:';
            kanjiDescription.appendChild(kanjiTermOnyomi);
            const kanjiDefinitionOnyomi = document.createElement('dd');
            kanjiDefinitionOnyomi.classList.add('kanji-definition');
            kanjiDefinitionOnyomi.innerText = kanjiData.onyomiReadings.join('、');
            kanjiDescription.appendChild(kanjiDefinitionOnyomi);
            const kanjiTermKunyomi = document.createElement('dt');
            kanjiTermKunyomi.classList.add('kanji-term');
            kanjiTermKunyomi.innerText = 'Kun Reading:';
            kanjiDescription.appendChild(kanjiTermKunyomi);
            const kanjiDefinitionKunyomi = document.createElement('dd');
            kanjiDefinitionKunyomi.classList.add('kanji-definition');
            kanjiDefinitionKunyomi.innerText = kanjiData.kunyomiReadings.join('、');
            kanjiDescription.appendChild(kanjiDefinitionKunyomi);
            const kanjiVisuals = document.createElement('div');
            kanjiVisuals.classList.add('kanji-visuals');
            kanjiRow.appendChild(kanjiVisuals);
            const kanjiStrokeOrder = document.createElement('div');
            kanjiStrokeOrder.classList.add('kanji-stroke-order');
            kanjiStrokeOrder.innerText = kanjiData.character;
            kanjiVisuals.appendChild(kanjiStrokeOrder);
            const kanjiBoxes = document.createElement('div');
            kanjiVisuals.appendChild(kanjiBoxes);
            for (let i = 0; i < numHintKanjiBoxes; ++i)
                kanjiBoxes.appendChild(createKanjiBox(true, kanjiData.character));
            for (let i = 0; i < numEmptyKanjiBoxes; ++i)
                kanjiBoxes.appendChild(createKanjiBox(false));
            return kanjiRow;
        }
        function createKanjiBox(hint, character) {
            const kanjiBox = document.createElement('div');
            kanjiBox.classList.add('kanji-box');
            if (hint)
                kanjiBox.classList.add('kanji-hint-box');
            kanjiBox.style.fontFamily = document.getElementById('fontSelector').value;
            const guideLines = document.createElement('img');
            guideLines.src = 'resources/guide-lines.svg';
            kanjiBox.appendChild(guideLines);
            if (character) {
                const characterDiv = document.createElement('div');
                characterDiv.innerText = character;
                kanjiBox.appendChild(characterDiv);
            }
            return kanjiBox;
        }
        function crateKanjiSelectionCategory(categoryName, category) {
            const kanjiSelectionCategory = document.createElement('div');
            kanjiSelectionCategory.classList.add('category');
            const categoryTitle = document.createElement('h2');
            categoryTitle.classList.add('category-title');
            categoryTitle.innerText = categoryName;
            kanjiSelectionCategory.appendChild(categoryTitle);
            const categoryContent = document.createElement('div');
            categoryContent.classList.add('category-content');
            kanjiSelectionCategory.appendChild(categoryContent);
            categoryTitle.addEventListener('click', function () {
                if (categoryContent.classList.contains('expand'))
                    categoryContent.classList.remove('expand');
                else
                    categoryContent.classList.add('expand');
            });
            for (const subcategoryName in category) {
                const subcategory = category[subcategoryName];
                categoryContent.appendChild(createKanjiSelectionSubcategory(subcategoryName, subcategory));
            }
            return kanjiSelectionCategory;
        }
        function createKanjiSelectionSubcategory(subcategoryName, subcategory) {
            const kanjiSelectionSubcategory = document.createElement('div');
            kanjiSelectionSubcategory.classList.add('subcategory');
            const subcategoryHeader = document.createElement('div');
            subcategoryHeader.classList.add('subcategory-header');
            kanjiSelectionSubcategory.appendChild(subcategoryHeader);
            const subcategoryTitle = document.createElement('h3');
            subcategoryTitle.classList.add('subcategory-title');
            subcategoryTitle.innerText = subcategoryName;
            subcategoryHeader.appendChild(subcategoryTitle);
            // whitespace between title and select all
            subcategoryHeader.appendChild(document.createTextNode(' '));
            const selectAll = document.createElement('span');
            selectAll.classList.add('select-all');
            selectAll.innerText = '(select all)';
            subcategoryHeader.appendChild(selectAll);
            const subcategoryContent = document.createElement('div');
            subcategoryContent.classList.add('subcategory-content');
            kanjiSelectionSubcategory.appendChild(subcategoryContent);
            for (const kanjiId of subcategory.kanji) {
                subcategoryContent.appendChild(createKanjiSelectionButton(kanjiId));
            }
            subcategoryTitle.addEventListener('click', function () {
                if (subcategoryContent.classList.contains('expand'))
                    subcategoryContent.classList.remove('expand');
                else
                    subcategoryContent.classList.add('expand');
            });
            selectAll.addEventListener('click', function () {
                if (subcategory.selectAllUndo) {
                    for (const kanjiId of subcategory.selectAllUndo) {
                        deselectKanji(kanjiId);
                    }
                    subcategory.selectAllUndo = null;
                }
                else {
                    subcategory.selectAllUndo = [];
                    for (const kanjiId of subcategory.kanji) {
                        if (!kanjiSelected(kanjiId)) {
                            selectKanji(kanjiId);
                            subcategory.selectAllUndo.push(kanjiId);
                        }
                    }
                }
            });
            return kanjiSelectionSubcategory;
        }
        function createKanjiSelectionButton(kanjiId) {
            const kanjiSelectionButton = document.createElement('div');
            kanjiSelectionButton.classList.add('kanji-button');
            kanjiSelectionButton.innerText = availableKanji[kanjiId].character;
            kanjiSelectionButton.id = `kanji-button/${kanjiId}`;
            kanjiSelectionButton.addEventListener('click', function () {
                toggleKanji(kanjiId);
            });
            return kanjiSelectionButton;
        }
    })(exports.Kanji || (exports.Kanji = {}));
    exports.Kanji.init();

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=kanji.js.map
