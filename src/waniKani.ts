import { Kanji } from './kanji';

export namespace WaniKani {
    type WaniKaniErrorResponse = {error: string, code: number};

    export async function getKanji(apiKey: string) {
        const level = await getLevel(apiKey);

        const accumulatedKanji: Kanji.KanjiCategory = {};
        let userLevels = '';
        for (let currentLevel = level; currentLevel > 1; --currentLevel) {
            accumulatedKanji[`Level ${currentLevel}`] = {};

            userLevels += `${currentLevel},`;
        }
        accumulatedKanji['Level 1'] = {};
        userLevels += '1';

        let nextUrl: string | null = `https://api.wanikani.com/v2/subjects?levels=${userLevels}&types=kanji`;
        while (nextUrl) {
            const response: {
                data: {
                    data: {
                        level: number,
                        characters: string,
                        meanings: {
                            meaning: string,
                            primary: boolean
                        }[],
                        readings: {
                            type: 'onyomi' | 'kunyomi' | 'nanori',
                            primary: boolean,
                            reading: string
                        }[],
                    },
                }[],
                pages: {
                    next_url: string | null,
                },
            } = await waniKaniRequest(apiKey, nextUrl);

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
    }

    async function getLevel(apiKey: string): Promise<number> {
        return (await waniKaniRequest(apiKey, 'https://api.wanikani.com/v2/user')).data.level;
    }

    async function waniKaniRequest(apiKey: string, url: string): Promise<any> {
        const response = await fetch(url, {
            headers: {
                'Wanikani-Revision': '20170710',
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        const responseJson = await response.json();
        
        if (response.status != 200)
            throw new WaniKaniError(
                (responseJson as WaniKaniErrorResponse).error,
                (responseJson as WaniKaniErrorResponse).code,
            );
        else
            return responseJson;
    }

    export class WaniKaniError extends Error {
        code: number;

        constructor(message: string, code: number) {
            super(message);

            this.code = code;
        }
    }
}