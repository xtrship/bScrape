import puppeteer from "puppeteer";

let url = "https://www.basketball-reference.com/players/l/lopezbr01/gamelog/";
const years = [
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
];
let seasonURL = [];

// Generate season URLs
for (let i = 0; i < years.length; i++) {
  seasonURL.push(url + years[i]);
}

/* const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let i = 0; i < seasonURL.length; i++) {
        await page.goto(seasonURL[i], { waitUntil: 'networkidle2' }); // Wait for network activity to settle
        await page.screenshot({ path: `BROOK LOPEZ SEASONS/${years[i]}.png` }); // Save screenshots in the specified folder
    }

    await browser.close(); // Close the browser after the loop
}

main().catch(console.error);
*/

const newURL =
  "https://www.basketball-reference.com/boxscores/shot-chart/200810290WAS.html";

const main = async () => {
  try {
    // default setup to go to the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // script tp get the title, always need to wrtie await before next step
    const title = await page.title();
    console.log(title);

    const heading = await page.$eval("top", (element) => element.textContent);
    console.log(heading);

    await browser.close();
  } catch (err) {
    console.log(err);
  }
};

main();
