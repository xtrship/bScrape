import puppeteer from "puppeteer";
import fs from 'fs/promises';

const RATE_LIMIT = 18; 
const RATE_LIMIT_WINDOW = 90000; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
    try {
        const rawData = await fs.readFile('games.json', 'utf8');
        const gamesData = JSON.parse(rawData);

        // Check if gamesData has the expected structure
        if (!Array.isArray(gamesData) || gamesData.length === 0) {
            throw new Error("Invalid games data format. Expected an array of game data.");
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        let shotData = {};
        let pageCount = 0;
        let cycleStartTime = Date.now();

        // Set a maximum number of games to process
        const MAX_GAMES = process.env.MAX_GAMES || 5;

        // Process games one year at a time
        for (const yearData of gamesData) {
            console.log(`Processing year: ${yearData.year}`);
            shotData[yearData.year] = [];
            
            const gamesToProcess = yearData.games.slice(0, MAX_GAMES);

            for (const game of gamesToProcess) {
                // Check if we need to pause for rate limiting
                if (pageCount >= RATE_LIMIT) {
                    const elapsedTime = Date.now() - cycleStartTime;
                    if (elapsedTime < RATE_LIMIT_WINDOW) {
                        console.log(`Rate limit reached. Pausing for ${(RATE_LIMIT_WINDOW - elapsedTime) / 1000} seconds.`);
                        await delay(RATE_LIMIT_WINDOW - elapsedTime);
                    }
                    pageCount = 0;
                    cycleStartTime = Date.now();
                }

                console.log(`Processing game: ${game.date}`);
                
                await page.goto(game.link, { waitUntil: 'domcontentloaded' });

                pageCount++;

                const brookLopezMakes = await page.evaluate(() => {
                    try {
                        const makesTooltips = document.querySelectorAll('div.tooltip.make[tip*="Brook Lopez"]');
                        console.log(`Number of tooltip elements found: ${makesTooltips.length}`); // Log the number of tooltips
                        const results = [];

                        makesTooltips.forEach(tooltip => {
                            const style = tooltip.getAttribute('style');
                            const shotData = {};

                            const topMatch = style.match(/top:\s*(\d+)px/);
                            const leftMatch = style.match(/left:\s*(\d+)px/);
                            const downMatch = style.match(/down:\s*(\d+)px/);
                            const rightMatch = style.match(/right:\s*(\d+)px/);
                            
                            if (topMatch) shotData["top"] = parseInt(topMatch[1]);
                            if (leftMatch) shotData["left"] = parseInt(leftMatch[1]);
                            if (downMatch) shotData["down"] = parseInt(downMatch[1]);
                            if (rightMatch) shotData["right"] = parseInt(rightMatch[1]);

                            if (Object.keys(shotData).length > 0) {
                                results.push(shotData);
                            }
                        });

                        return results;
                    } catch (error) {
                        console.error("Error during evaluation:", error);
                        return [];
                    }
                });

                shotData[yearData.year].push({
                    date: game.date,
                    shots: brookLopezMakes
                });

                console.log(`Processed ${brookLopezMakes.length} shots for game ${game.date}`);
                if (brookLopezMakes.length === 0) {
                    console.warn(`No shot data found for game ${game.date}`);
                }
            }

            console.log(`Finished processing year: ${yearData.year}`);
        }

        await browser.close();

        // Write the shot data to a new JSON file
        await fs.writeFile('bropez_shots.json', JSON.stringify(shotData, null, 2));
        console.log('Shot data has been written to bropez_shots.json');
        
    } catch (err) {
        // Enhanced error handling
        if (err.code === 'ENOENT') {
            console.error("File not found. Please ensure the 'games.json' file exists.");
        } else {
            console.error("An error occurred:", err.message);
        }
    }
}

main();
