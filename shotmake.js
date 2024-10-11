import puppeteer from "puppeteer";

let url = "https://www.basketball-reference.com/boxscores/shot-chart/200810290WAS.html";


const main = async () => {
    try {
        // Default setup to go to the browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        // Script to get the title
        const title = await page.title();
        console.log(title);

        // Get the values for Brook Lopez's makes
        const brookLopezMakes = await page.evaluate(() => {
            const makesTooltips = document.querySelectorAll('div.tooltip.make[tip*="Brook Lopez"]'); // Select makes for Brook Lopez
            const results = [];

            makesTooltips.forEach(tooltip => {
                const style = tooltip.getAttribute('style');
                const shotData = {};

                const topMatch = style.match(/top:\s*(\d+)px/);
                const leftMatch = style.match(/left:\s*(\d+)px/);
                const downMatch = style.match(/down:\s*(\d+)px/);
                const rightMatch = style.match(/right:\s*(\d+)px/);
                
                // Collect non-null values into the shotData object
                if (topMatch) shotData["top"] = parseInt(topMatch[1]);
                if (leftMatch) shotData["left"] = parseInt(leftMatch[1]);
                if (downMatch) shotData["down"] = parseInt(downMatch[1]);
                if (rightMatch) shotData["right"] = parseInt(rightMatch[1]);

                // Push shotData only if it has at least one value
                if (Object.keys(shotData).length > 0) {
                    results.push(shotData);
                    console.log(shotData);
                }
            });

            return results;
        });

        console.log(brookLopezMakes);

        await browser.close();
        
    } catch (err) {
        console.log(err);
    }
}

main();