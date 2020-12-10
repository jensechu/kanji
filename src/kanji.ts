import { WaniKani } from './waniKani';

export namespace Kanji {
    export type KanjiCategory = {
        [subcategoryName: string]: {
            [kanji: string]: {
                meanings: string[],
                onyomiReadings: string[],
                kunyomiReadings: string[],
            },
        },
    };

    export type KanjiData = {
        category: string,
        subcategory: string,
        character: string,
        meanings: string[],
        onyomiReadings: string[],
        kunyomiReadings: string[],
    };

    type KanjiId = number;
    
    const categories: {
        [categoryName: string]: {
            [subcategoryName: string]: {
                // All of the kanji that should be deselected
                // if  the user clicks the select all button
                // a second time.
                selectAllUndo: KanjiId[] | null,
                // All of the kanji in this subcategory.
                kanji: KanjiId[]
            }
        }
    } = {};
    // All kanji available, indexed by kanji ID.
    const availableKanji: {[kanjiId: number]: KanjiData} = {};

    // A counter that allows for the creation of unique IDs
    //for all of the kanji.
    let kanjiIdCounter = 0;

    export async function init() {
        // Add events to static categories
        const staticCategories = document.getElementById('sidebar')!.querySelectorAll('.category');
        for (const category of staticCategories) {
            const categoryTitle = category.querySelector('.category-title')!;
            const categoryContent = category.querySelector('.category-content')!;

            categoryTitle.addEventListener('click', function() {
                if (categoryContent.classList.contains('expand'))
                    categoryContent.classList.remove('expand');
                else
                    categoryContent.classList.add('expand');
            });
        }

        const jlptData: KanjiCategory = await (await fetch('data/JLPT.json')).json();

        addKanjiCategory("JLPT", jlptData);

        // Accounts for the possibility that the toggles are
        // still checked after a page reload.
        toggleGuideLines();
    }

    export function loadWaniKani() {
        const apiKey = (document.getElementById('waniKaniKey')! as HTMLInputElement).value;

        WaniKani.getKanji(apiKey)
            .then(
                kanji => addKanjiCategory('WaniKani', kanji),
                err => {
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
                },
            );
    }

    export function toggleGuideLines() {
        const content = document.getElementById('content')!;
        if ((document.getElementById('guideLinesToggle')! as HTMLInputElement).checked) {
            content.classList.add('guide-lines');
        } else {
            content.classList.remove('guide-lines');
        }
    }

    function toggleKanji(kanjiId: KanjiId) {
        if (kanjiSelected(kanjiId)) {
            deselectKanji(kanjiId);
        } else {
            selectKanji(kanjiId);
        }
    }

    function kanjiSelected(kanjiId: KanjiId): boolean {
        return document.getElementById(`kanji/${kanjiId}`) != null;
    }

    function selectKanji(kanjiId: KanjiId) {
        const kanjiData: {[key: string]: any} = Object.assign({}, availableKanji[kanjiId]!);
        kanjiData.kanjiId = kanjiId;

        document.getElementById('content')!.prepend(createKanjiRow(kanjiId));

        document.getElementById(`kanji-button/${kanjiId}`)!.classList.add('selected');
    }

    function deselectKanji(kanjiId: KanjiId) {
        document.getElementById(`kanji/${kanjiId}`)?.remove();

        document.getElementById(`kanji-button/${kanjiId}`)!.classList.remove('selected');
    }

    function addKanjiCategory(categoryName: string, categoryData: KanjiCategory) {
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

        document.getElementById('sidebar')!.appendChild(crateKanjiSelectionCategory(categoryName, category));
    }

    function createKanjiRow(kanjiId: KanjiId): HTMLDivElement {
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

    function createKanjiBox(hint: boolean, character?: string): HTMLDivElement {
        const kanjiBox = document.createElement('div');
        kanjiBox.classList.add('kanji-box');

        if (hint)
            kanjiBox.classList.add('kanji-hint-box');
        
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

    function crateKanjiSelectionCategory(categoryName: string, category: {[subcategoryName: string]: {
        selectAllUndo: number[] | null;
        kanji: number[];
    }}): HTMLDivElement {
        const kanjiSelectionCategory = document.createElement('div');

        kanjiSelectionCategory.classList.add('category');

        const categoryTitle = document.createElement('h2');
        categoryTitle.classList.add('category-title');
        categoryTitle.innerText = categoryName;
        kanjiSelectionCategory.appendChild(categoryTitle);

        const categoryContent = document.createElement('div');
        categoryContent.classList.add('category-content');
        kanjiSelectionCategory.appendChild(categoryContent);

        categoryTitle.addEventListener('click', function() {
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

    function createKanjiSelectionSubcategory(subcategoryName: string, subcategory: {
        selectAllUndo: number[] | null;
        kanji: number[];
    }): HTMLDivElement {
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
        
        subcategoryTitle.addEventListener('click', function() {
            if (subcategoryContent.classList.contains('expand'))
                subcategoryContent.classList.remove('expand');
            else
                subcategoryContent.classList.add('expand');
        });

        selectAll.addEventListener('click', function() {
            if (subcategory.selectAllUndo) {
                for (const kanjiId of subcategory.selectAllUndo) {
                    deselectKanji(kanjiId);
                }

                subcategory.selectAllUndo = null;
            } else {
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

    function createKanjiSelectionButton(kanjiId: KanjiId): HTMLDivElement {
        const kanjiSelectionButton = document.createElement('div');
        kanjiSelectionButton.classList.add('kanji-button');
        kanjiSelectionButton.innerText = availableKanji[kanjiId].character;
        kanjiSelectionButton.id = `kanji-button/${kanjiId}`
        kanjiSelectionButton.addEventListener('click', function() {
            toggleKanji(kanjiId);
        });
        return kanjiSelectionButton;
    }
}

Kanji.init();