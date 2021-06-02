const puppeteer = require("puppeteer");
const fs = require("fs");

const scrape = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://en.wikipedia.org/wiki/Lists_of_airports");
    for (let i = 4; i <= 29; i++) {
      var linkToClick = `#mw-content-text > div.mw-parser-output > p:nth-child(5) > a:nth-child(${i})`;
      await page.click(linkToClick);
      await scraper(page, i - 3);
      await page.goBack();
    }
    await browser.close();
  } catch (err) {
    console.log(err);
  }
};

scrape();

const scraper = async (page, no) => {
  try {
    await page.on("load");

    const airportlist = [];
    for (let i = 2; i < 20; i++) {
      const list = await page.$eval(
        `#mw-content-text > div.mw-parser-output > table > tbody > tr:nth-child(${i})`,
        (row) => {
          let rowContent = row.innerText;
          if (rowContent.length > 5) {
            let rec = {
              iata: rowContent.split("\t")[0],
              icao: rowContent.split("\t")[1],
              "airport name": rowContent
                .split("\t")[2]
                .toLowerCase()
                .replace(/[,\s]+|[,\s]+/g, "_"),
              "location served": rowContent
                .split("\t")[3]
                .toLowerCase()
                .replace("  ", "_")
                .replace(/[,\s]+|[,\s]+/g, "_"),
            };
            return rec;
          }
        }
      );
      if (list == null) {
      } else {
        airportlist.push(list);
      }
    }

    fs.writeFile(
      `page${no}.json`,
      JSON.stringify(airportlist, null, 2),
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Saved succesfully");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};
