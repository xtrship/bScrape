import puppeteer from "puppeteer";

let url = 'https://www.basketball-reference.com/players/l/lopezbr01/gamelog/';
const years = ['2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
let seasonURL = [];

// Generate season URLs
for (let i = 0; i < years.length; i++) {
    seasonURL.push(url + years[i]);
}

let gameDates = [];

const main = async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let i = 0; i < seasonURL.length; i++) {

        // Declaring an object that is then pushed into the gameDates array by year
        let obj = {
            year: `${years[i]}`,
            games: []
        };   

        await page.goto(seasonURL[i]);

        // Extract game dates and links using evaluate
        const dateLinks = await page.evaluate(() => {
            const rows = document.querySelectorAll('table tbody tr');
            let games = [];

            rows.forEach(row => {
                const dateElement = row.querySelector('td[data-stat="date_game"] a');
                if (dateElement) {
                    const date = dateElement.innerText;  
                    const link = dateElement.href;       
                    
                    games.push({ date, link });
                }
            });

            return games;
        });

        obj.games = dateLinks;
        gameDates.push(obj);
    }

    await browser.close();  
    
    // Log the first game link for the year 2009 if it exists
    if (gameDates.length > 0 && gameDates[0].games.length > 0) {
        console.log("First game link for 2009:", gameDates[0].games[0].link);
    } else {
        console.log("No games found for 2009.");
    }

};

main();





